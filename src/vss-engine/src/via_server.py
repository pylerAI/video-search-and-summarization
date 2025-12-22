######################################################################################################
# SPDX-FileCopyrightText: Copyright (c) 2024-2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: LicenseRef-NvidiaProprietary
#
# NVIDIA CORPORATION, its affiliates and licensors retain all intellectual
# property and proprietary rights in and to this material, related
# documentation and any modifications thereto. Any use, reproduction,
# disclosure or distribution of this material and related documentation
# without an express license agreement from NVIDIA CORPORATION or
# its affiliates is strictly prohibited.
######################################################################################################
"""Implements the VIA REST API.

Translates between requests/responses and ViaStreamHandler and AssetManager methods."""

from via_stream_handler import (  # isort:skip
    RequestInfo,
    ViaStreamHandler,
)

import argparse
import asyncio
import gc
import json
import os
import time
import traceback
import uuid
from concurrent.futures import ThreadPoolExecutor
from typing import Annotated

import aiofiles
import aiofiles.os
import gi
import uvicorn
from asset_manager import Asset, AssetManager
from fastapi import FastAPI, File, Form, Path, Query, Request, Response, UploadFile
from fastapi.exceptions import HTTPException, RequestValidationError
from fastapi.responses import FileResponse, JSONResponse
from prometheus_client import (
    GC_COLLECTOR,
    PLATFORM_COLLECTOR,
    PROCESS_COLLECTOR,
    REGISTRY,
    generate_latest,
)
from utils import (
    MediaFileInfo,
    StreamSettingsCache,
    validate_required_prompts,
)
from via_exception import ViaException
from via_logger import LOG_PERF_LEVEL, TimeMeasure, logger
from vss_api_models import (
    UUID_LENGTH,
    AddFileInfoResponse,
    ChatCompletionQuery,
    ChatCompletionToolType,
    CompletionFinishReason,
    CompletionResponse,
    CompletionUsage,
    DeleteFileResponse,
    FileInfo,
    ListFilesResponse,
    ListModelsResponse,
    MediaInfoOffset,
    MediaType,
    Purpose,
    SummarizationQuery,
    ViaError,
    VlmCaptionResponse,
    VlmCaptionsCompletionResponse,
    VlmQuery,
)

gi.require_version("GstRtsp", "1.0")  # isort:skip


API_PREFIX = (
    "/v1" if os.environ.get("VSS_API_ENABLE_VERSIONING", "").lower() in ["true", "1"] else ""
)

ALERT_REVIEW_MEDIA_BASE_DIR = os.environ.get("ALERT_REVIEW_MEDIA_BASE_DIR", "")


# Remove some default metrics reported by prometheus client.
REGISTRY.unregister(PROCESS_COLLECTOR)
REGISTRY.unregister(PLATFORM_COLLECTOR)
REGISTRY.unregister(GC_COLLECTOR)

COMMON_ERROR_RESPONSES = {
    400: {
        "model": ViaError,
        "description": (
            "Bad Request. The server could not understand the request due to invalid syntax."
        ),
    },
    401: {"model": ViaError, "description": "Unauthorized request."},
    422: {"model": ViaError, "description": "Failed to process request."},
    500: {"model": ViaError, "description": "Internal Server Error."},
    429: {
        "model": ViaError,
        "description": "Rate limiting exceeded.",
    },
}


def add_common_error_responses(errors=[]):
    return (
        {err: COMMON_ERROR_RESPONSES[err] for err in (errors + [401, 429, 422])}
        if errors
        else COMMON_ERROR_RESPONSES
    )


class ViaServer:
    def __init__(self, args) -> None:
        self._args = args

        self._asset_manager = AssetManager(
            args.asset_dir,
            max_storage_usage_gb=args.max_asset_storage_size,
            asset_removal_callback=self._remove_asset,
        )

        self._async_executor = ThreadPoolExecutor(
            max_workers=args.max_live_streams, thread_name_prefix="vss-async-worker"
        )

        # Use FastAPI to implement the REST API
        self._app = FastAPI(
            contact={"name": "NVIDIA", "url": "https://nvidia.com"},
            description="Visual Insights Agent API.",
            title="Visual Insights Agent API",
            openapi_tags=[
                {
                    "name": "Files",
                    "description": "Files are used to upload and manage media files.",
                },
                {"name": "Health Check", "description": "Operations to check system health."},
                {"name": "Metrics", "description": "Operations to get metrics."},
                {
                    "name": "Models",
                    "description": "List and describe the various models available in the API.",
                },
                {
                    "name": "Summarization",
                    "description": "Operations related to video summarization.",
                },
            ],
            servers=[
                {"url": "/", "description": "VIA microservice local endpoint.", "x-internal": False}
            ],
            version="v1",
        )
        self._app.config = {}
        self._app.config["host"] = args.host
        self._app.config["port"] = args.port

        self._setup_routes()
        self._setup_exception_handlers()
        self._setup_openapi_schema()

        if logger.level <= LOG_PERF_LEVEL:

            @self._app.middleware("http")
            async def measure_time(request: Request, call_next):
                with TimeMeasure(f"{request.method} {request.url.path}"):
                    response = await call_next(request)
                return response

        self._sse_active_clients = {}

        self._server = None

        self._stream_settings_cache = StreamSettingsCache(logger=logger)

    def _remove_asset(self, asset: Asset):
        self._stream_handler.remove_video_file(asset)
        return True

    def run(self):
        # Initialize OpenTelemetry if enabled (optional)
        try:
            from otel_helper import init_otel

            init_otel(service_name="via-engine")
        except Exception as e:
            logger.debug(f"OTEL initialization failed: {e}")

        try:
            # Start the VIA stream handler
            self._stream_handler = ViaStreamHandler(self._args)
        except Exception as ex:
            raise ViaException(f"Failed to load VIA stream handler - {str(ex)}")

        # Configure and start the uvicorn web server
        config = uvicorn.Config(
            self._app, host=self._args.host, port=int(self._args.port), reload=True
        )
        self._server = uvicorn.Server(config)
        self._server.run()
        self._server = None

        self._stream_handler.stop()

    def _setup_routes(self):
        # Mount the ASGI app exposed by prometheus client as a FastAPI endpoint.
        @self._app.get(
            f"{API_PREFIX}/metrics",
            summary="Get VIA metrics",
            description="Get VIA metrics in prometheus format.",
            responses={
                200: {"description": "Successful Response."},
                **add_common_error_responses([500]),
            },
            tags=["Metrics"],
        )
        def metrics():
            return Response(content=generate_latest(), media_type="text/plain")

        # ======================= Health check API
        @self._app.get(
            f"{API_PREFIX}/health/ready",
            summary="Get VIA readiness status",
            description="Get VIA readiness status.",
            responses={
                200: {"model": None, "description": "Successful Response."},
                **add_common_error_responses([500]),
            },
            tags=["Health Check"],
        )
        async def health_ready_probe():
            return Response(status_code=200)

        # ======================= Health check API

        # ======================= Files API
        @self._app.post(
            f"{API_PREFIX}/files",
            summary="API for uploading a media file",
            description="Files are used to upload media files.",
            responses={
                200: {"description": "Successful Response."},
                **add_common_error_responses(),
            },
            tags=["Files"],
        )
        async def add_video_file(
            purpose: Annotated[
                Purpose,
                Form(
                    description=(
                        "The intended purpose of the uploaded file."
                        " For VIA use-case this must be set to vision"
                    )
                ),
            ],
            media_type: Annotated[MediaType, Form(description="Media type (image / video / segment / metadata).")],
            file: Annotated[
                UploadFile, File(description="File object (not file name) to be uploaded.")
            ],
            asset_id: Annotated[
                str,
                Form(
                    description="video_id ID to be used for the file.",
                    max_length=256,
                ),
            ],
        ) -> AddFileInfoResponse:

            logger.info(
                "Received add video file request - purpose %s,"
                " media_type %s have file %r, filename - %s, camera_id - %s",
                purpose,
                media_type,
                file,
                asset_id,
            )


            if media_type != "video" and media_type != "image" and media_type != "metadata" and media_type != "segment":
                raise ViaException(
                    "Currently only 'video', 'image', 'metadata', 'segment' media_type is supported.",
                    "InvalidParameters",
                    422,
                )
            asset_id = await self._asset_manager.save_file(
                file, asset_id, purpose.value, media_type.value, 
            )

            try:
                if media_type in ["video", "image"] and not os.environ.get("VSS_SKIP_INPUT_MEDIA_VERIFICATION", ""):
                    media_info = await MediaFileInfo.get_info_async(
                        self._asset_manager.get_asset(asset_id).path
                    )
                    if not media_info.video_codec:
                        raise Exception("Invalid file")
                    if (media_type == "image") != media_info.is_image:
                        raise Exception("Invalid file")

                    # Cache video FPS in the asset
                    if media_type == "video" and hasattr(media_info, "video_fps"):
                        asset = self._asset_manager.get_asset(asset_id)
                        asset.update_video_fps(float(media_info.video_fps))
            except Exception as e:
                logger.error("".join(traceback.format_exception(e)))
                self._asset_manager.cleanup_asset(asset_id)
                raise ViaException(
                    f"File does not seem to be a valid {media_type} file",
                    "InvalidFile",
                    400,
                )

            asset = self._asset_manager.get_asset(asset_id)
            try:
                fsize = (await aiofiles.os.stat(asset.path)).st_size
            except Exception:
                fsize = 0
            return {
                "asset_id": asset_id,
                "bytes": fsize,
                "media_type": media_type,
                "purpose": "vision",
            }

        @self._app.delete(
            f"{API_PREFIX}/files/{{asset_id}}",
            summary="Delete a file",
            description="The ID of the file to use for this request.",
            responses={
                200: {"description": "Successful Response."},
                **add_common_error_responses(),
                409: {"model": ViaError, "description": "File is in use and cannot be deleted."},
            },
            tags=["Files"],
        )
        async def delete_video_file(
            asset_id: Annotated[str, Path(description="File having 'asset_id' to be deleted.")],
        ) -> DeleteFileResponse:
            logger.info("Received delete video file request for %s", asset_id)
            asset = self._asset_manager.get_asset(asset_id)

            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                self._async_executor, self._stream_handler.remove_video_file, asset
            )
            await loop.run_in_executor(
                self._async_executor, self._asset_manager.cleanup_asset, asset_id
            )

            if os.environ.get("VSS_FORCE_GC"):
                print("Force Garbage Collect in VIA Server")
                gc.collect()

            return {"asset_id": asset_id, "object": "file", "deleted": True}

        @self._app.get(
            f"{API_PREFIX}/files",
            description="Returns a list of all files within assets.",
            summary="Returns list of files",
            responses={
                200: {"description": "Successful Response."},
                **add_common_error_responses([500]),
            },
            tags=["Files"],
        )
        async def list_video_files(
            purpose: Annotated[
                str,
                Query(
                    description="Only return files with the given purpose.",
                    max_length=36,
                    title="Only return files with the given purpose.",
                    pattern=r"^[a-zA-Z]*$",
                ),
            ],
        ) -> ListFilesResponse:
            if purpose != "vision":
                return {"data": [], "object": "list"}

            all_files_info = []
            
            # 지원하는 미디어 타입 정의 (save_file의 EXTENSIONS와 일치시킴)
            EXTENSIONS = {
                "video": ".mp4",
                "image": ".jpg",
                "segment": ".json",
                "metadata": ".json"
            }

            # 모든 자산(폴더)을 순회
            for asset in self._asset_manager.list_assets():
                asset_dir = os.path.join(self._asset_manager._asset_dir, asset.asset_id)
                
                # 각 asset_id 폴더 내에서 지원하는 미디어 타입 파일이 있는지 확인
                for m_type, ext in EXTENSIONS.items():
                    file_path = os.path.join(asset_dir, f"{m_type}{ext}")
                    
                    if os.path.isfile(file_path):
                        try:
                            stats = await aiofiles.os.stat(file_path)
                            fsize = stats.st_size
                        except Exception:
                            fsize = 0

                        all_files_info.append({
                            "asset_id": asset.asset_id,
                            "purpose": "vision",
                            "bytes": fsize,
                            "media_type": m_type,
                        })

            logger.info(
                "Received list files request. Responding with %d individual files from %d assets", 
                len(all_files_info), len(self._asset_manager.list_assets())
            )
            
            return {"data": all_files_info, "object": "list"}

        @self._app.get(
            f"{API_PREFIX}/files/{{asset_id}}/{{media_type}}",
            summary="Returns information about a specific file",
            description="Returns information about a specific file.",
            responses={
                200: {"description": "Successful Response."},
                **add_common_error_responses(),
            },
            tags=["Files"],
        )
        async def get_file_info(
            asset_id: Annotated[
                str, Path(description="The ID of the asset.")
            ],
            media_type: Annotated[
                str, Path(description="Media type (video, image, metadata, segment)")
            ],
        ) -> FileInfo:
            # Asset 존재 여부 확인
            asset = self._asset_manager.get_asset(asset_id)
            
            # 해당 asset_id 폴더 내의 특정 media_type 파일 경로 계산
            EXTENSIONS = {
                "video": ".mp4",
                "image": ".jpg",
                "segment": ".json",
                "metadata": ".json"
            }
            
            asset_dir = os.path.join(self._asset_manager._asset_dir, asset_id)
            target_file_path = os.path.join(asset_dir, f"{media_type}{EXTENSIONS[media_type]}")

            # 실제 파일이 존재하는지 확인
            if not os.path.exists(target_file_path):
                raise ViaException(
                    f"No {media_type} file found for asset {asset_id}", 
                    "ResourceNotFound", 
                    404
                )

            try:
                stats = await aiofiles.os.stat(target_file_path)
                fsize = stats.st_size
            except Exception:
                fsize = 0

            #규격에 맞게 응답 (filename 대신 media_type 활용)
            return {
                "asset_id": asset_id, 
                "bytes": fsize, 
                "media_type": media_type,
                "purpose": "vision"
            }

        @self._app.get(
            f"{API_PREFIX}/files/{{asset_id}}/{{media_type}}/content",
            summary="Returns the contents of the specified file",
            description="Returns the contents of the specified file.",
            responses={
                200: {"description": "Successful Response."},
                **add_common_error_responses(),
            },
            tags=["Files"],
        )
        async def get_file_content(
            asset_id: Annotated[str, Path(description="The ID of the file.")],
            media_type: Annotated[str, Path(description="video, image, metadata, segment.")],
        ):
            self._asset_manager.get_asset(asset_id)

            EXTENSIONS = {
                "video": ".mp4",
                "image": ".jpg",
                "segment": ".json",
                "metadata": ".json"
            }

            if media_type not in EXTENSIONS:
                raise ViaException("Unsupported media type", "InvalidParameters", 422)

            asset_dir = os.path.join(self._asset_manager._asset_dir, asset_id)
            extension = EXTENSIONS[media_type]
            target_file_path = os.path.join(asset_dir, f"{media_type}{extension}")

            if not os.path.exists(target_file_path):
                raise ViaException("File not found", "ResourceNotFound", 404)

            media_types_map = {
                "video": "video/mp4",
                "image": "image/jpeg",
                "segment": "application/json",
                "metadata": "application/json"
            }
            
            return FileResponse(
                path=target_file_path, 
                media_type=media_types_map.get(media_type, "application/octet-stream"),
                filename=f"{media_type}{extension}"
            )
        # ======================= Files API

        # ======================= Models API
        @self._app.get(
            f"{API_PREFIX}/models",
            summary=(
                "Lists the currently available models, and provides basic information"
                " about each one such as the owner and availability"
            ),
            description=(
                "Lists the currently available models, and provides basic information"
                " about each one such as the owner and availability."
            ),
            responses={
                200: {"description": "Successful Response."},
                **add_common_error_responses([500]),
            },
            tags=["Models"],
        )
        async def list_models() -> ListModelsResponse:

            # Get the loaded model information from pipeline
            minfo = self._stream_handler.get_models_info()

            logger.info("Received list models request. Responding with 1 models info")
            return {
                "object": "list",
                "data": [
                    {
                        "id": minfo.id,
                        "created": int(minfo.created),
                        "object": "model",
                        "owned_by": minfo.owned_by,
                        "api_type": minfo.api_type,
                    }
                ],
            }

        # ======================= Models API

        # ======================= Summarize API

        @self._app.post(
            f"{API_PREFIX}/summarize",
            summary="Summarize a video",
            description="Run video summarization query.",
            responses={
                200: {"description": "Successful Response."},
                **add_common_error_responses(),
                503: {
                    "model": ViaError,
                    "description": (
                        "Server is busy processing another file / live-stream."
                        " Client may try again in some time."
                    ),
                },
            },
            tags=["Summarization"],
        )
        async def summarize(query: SummarizationQuery, request: Request) -> CompletionResponse:

            videoIdListUUID = query.id_list
            videoIdList = [str(uuid_obj) for uuid_obj in videoIdListUUID]
            assetList = []

            if len(videoIdList) > 1:
                for videoId in videoIdList:
                    asset = self._asset_manager.get_asset(videoId)
                    assetList.append(asset)
                    if asset.media_type != "image":
                        raise ViaException(
                            "Multi-file summarize: Only image files supported."
                            f" {asset._filename} is a not an image",
                            "BadParameters",
                            400,
                        )

            if query.enable_audio:
                for videoId in videoIdList:
                    asset = self._asset_manager.get_asset(videoId)
                    if asset.media_type == "image":
                        raise ViaException(
                            "Audio transcription is not supported for image files."
                            f" {asset._filename} is an image",
                            "BadParameters",
                            400,
                        )

            videoId = videoIdList[
                0
            ]  # Note: Other files processed only for multi-image summarize() below
            asset = self._asset_manager.get_asset(videoId)

            media_info_start = None
            media_info_end = None

            if query.media_info:
                # Extract user specified start/end time filter.
                # For files, it is in terms of "offset" - start/end time in seconds
                # For live stream, it is in terms of "timetamp" - start/end NTP timestamp.
                if query.media_info.type == "offset":
                    media_info_start = query.media_info.start_offset
                    media_info_end = query.media_info.end_offset
                if query.media_info.type == "timetamp":
                    media_info_start = query.media_info.start_timestamp
                    media_info_end = query.media_info.end_timestamp

            logger.info(
                "Received summarize query, id - %s (live-stream=%d), "
                "chunk_duration=%d, chunk_overlap_duration=%d, "
                "media-offset-type=%s, media-start-time=%r, "
                "media-end-time=%r, modelParams=%s, "
                "summary_duration=%d, stream=%r num_frames_per_chunk=%d "
                "vlm_input_width = %d, "
                "vlm_input_height = %d, "
                "summarize_batch_size = %s, "
                "summarize_max_tokens = %s, "
                "summarize_temperature = %s, "
                "summarize_top_p = %s, "
                "rag_top_k = %s, "
                "rag_batch_size = %s, "
                "chat_max_tokens = %s, "
                "chat_temperature = %s, "
                "chat_top_p = %s, "

                "summarization enabled = %s, "
                "chat enabled = %s, "
                "collection_name = %s, "
                "custom_metadata = %s, "
                "delete_external_collection = %s, "
                "camera_id = %s, "
                "enable_audio = %d",
                ", ".join(videoIdList),
                query.chunk_duration,
                query.chunk_overlap_duration,
                query.media_info and query.media_info.type,
                media_info_start,
                media_info_end,
                json.dumps(
                    {
                        "max_tokens": query.max_tokens,
                        "temperature": query.temperature,
                        "top_p": query.top_p,
                        "top_k": query.top_k,
                    }
                ),
                query.summary_duration,
                query.stream,
                query.num_frames_per_chunk,
                query.vlm_input_width,
                query.vlm_input_height,
                query.summarize_batch_size,
                query.summarize_max_tokens,
                query.summarize_temperature,
                query.summarize_top_p,
                query.rag_top_k,
                query.rag_batch_size,
                query.chat_max_tokens,
                query.chat_temperature,
                query.chat_top_p,
                query.summarize,
                query.enable_chat,
                query.collection_name,
                str(query.custom_metadata),
                query.delete_external_collection,
                query.camera_id,
                query.enable_audio,
            )

            # Save stream settings to json file
            filtered_query_json = self._stream_settings_cache.transform_query(query.get_query_json)
            logger.debug(f"Filtered Query JSON: {filtered_query_json}")
            self._stream_settings_cache.update_stream_settings(videoId, filtered_query_json)

            # Check if user has specified the model that is initialized
            model_info = self._stream_handler.get_models_info()
            if query.model != model_info.id:
                raise ViaException(f"No such model '{query.model}'", "BadParameters", 400)

            if query.api_type and query.api_type != model_info.api_type:
                raise ViaException(
                    f"api_type {query.api_type} not supported by model '{query.model}'",
                    "BadParameters",
                    400,
                )

            # Validate required prompts based on CA-RAG configuration
            validation_errors = validate_required_prompts(
                query.prompt,
                query.caption_summarization_prompt,
                query.summary_aggregation_prompt,
                self._args,
            )
            if validation_errors:
                error_message = "; ".join(validation_errors)
                raise ViaException(error_message, "BadParameters", 400)


            # For non-CA RAG usecase, only streaming output is supported
            if self._stream_handler._ctx_mgr is None and not query.stream:
                raise ViaException(
                    "Only streaming output is supported for files when CA-RAG is disabled",
                    "BadParameters",
                    400,
                )

            loop = asyncio.get_event_loop()

        
            if len(videoIdList) == 1:
                assetList = [asset]
            # Summarize on a file or multiple files
            request_id = await loop.run_in_executor(
                self._async_executor,
                self._stream_handler.summarize,
                assetList,
                query,
            )
            logger.info("Created video file query %s for videoId %s", request_id, videoId)

            if query.tools:
                for tool in query.tools:
                    if tool.type == ChatCompletionToolType.ALERT:
                        if not query.stream:
                            raise ViaException(
                                "Only streaming output is supported for alerts",
                                "BadParameters",
                                400,
                            )

            logger.info("Waiting for results of query %s", request_id)

            # Non-streaming output. Wait for request to be completed.
            await loop.run_in_executor(
                self._async_executor, self._stream_handler.wait_for_request_done, request_id
            )
            req_info, resp_list = self._stream_handler.get_response(request_id)
            self._stream_handler.check_status_remove_req_id(request_id)
            if req_info.status == RequestInfo.Status.FAILED:
                raise ViaException(
                    f"Failed to generate summary: {req_info.error_message}",
                    "InternalServerError",
                    500,
                )

            # Create response json and return it
            return {
                "id": request_id,
                "model": model_info.id,
                "created": int(req_info.queue_time),
                "object": "summarization.completion",
                "media_info": {
                    "type": "offset",
                    "start_offset": int(req_info.start_timestamp),
                    "end_offset": int(req_info.end_timestamp),
                },
                "choices": (
                    [
                        {
                            "finish_reason": CompletionFinishReason.STOP.value,
                            "index": 0,
                            "message": {"content": resp_list[0].response, "role": "assistant"},
                        }
                    ]
                    if resp_list
                    else []
                ),
                "usage": {
                    "total_chunks_processed": req_info.chunk_count,
                    "query_processing_time": int(req_info.end_time - req_info.start_time),
                },
            }

        # ======================= Summarize API

        # ======================= Summarize API

        def _format_chunk_response(resp, req_info):
            """Format a chunk response with timestamp for display.

            Args:
                resp: Response object with start_timestamp, end_timestamp, and response fields
                req_info: Request info object

            Returns:
                str: Formatted chunk response with timestamp
            """

            start_time = str(resp.start_timestamp)
            end_time = str(resp.end_timestamp)

            return f"[{start_time} - {end_time}] {resp.response}"

        @self._app.post(
            f"{API_PREFIX}/generate_vlm_captions",
            summary="Generate VLM captions for a video",
            description="Run video VLM captions generation query.",
            responses={
                200: {"description": "Successful Response."},
                **add_common_error_responses(),
                503: {
                    "model": ViaError,
                    "description": (
                        "Server is busy processing another file / live-stream."
                        " Client may try again in some time."
                    ),
                },
            },
            tags=["Summarization"],
        )
        async def generate_vlm_captions(
            query: VlmQuery, request: Request
        ) -> VlmCaptionsCompletionResponse:

            videoIdListUUID = query.id_list
            videoIdList = [str(uuid_obj) for uuid_obj in videoIdListUUID]
            assetList = []

            if len(videoIdList) > 1:
                for videoId in videoIdList:
                    asset = self._asset_manager.get_asset(videoId)
                    assetList.append(asset)
                    if asset.media_type != "image":
                        raise ViaException(
                            "Multi-file summarize: Only image files supported."
                            f" {asset._filename} is a not an image",
                            "BadParameters",
                            400,
                        )

            videoId = videoIdList[
                0
            ]  # Note: Other files processed only for multi-image summarize() below
            asset = self._asset_manager.get_asset(videoId)

            media_info_start = None
            media_info_end = None

            if query.media_info:
                # Extract user specified start/end time filter.
                # For files, it is in terms of "offset" - start/end time in seconds
                # For live stream, it is in terms of "timetamp" - start/end NTP timestamp.
                if query.media_info.type == "offset":
                    media_info_start = query.media_info.start_offset
                    media_info_end = query.media_info.end_offset
                if query.media_info.type == "timetamp":
                    media_info_start = query.media_info.start_timestamp
                    media_info_end = query.media_info.end_timestamp

            logger.info(
                "Received generate_vlm_captions query, id - %s (live-stream=%d), "
                "chunk_duration=%d, chunk_overlap_duration=%d, "
                "media-offset-type=%s, media-start-time=%r, "
                "media-end-time=%r, modelParams=%s, "
                "stream=%r num_frames_per_chunk=%d "
                "vlm_input_width = %d, "
                "vlm_input_height = %d, "
                "enable_reasoning = %d",
                ", ".join(videoIdList),
                query.chunk_duration,
                query.chunk_overlap_duration,
                query.media_info and query.media_info.type,
                media_info_start,
                media_info_end,
                json.dumps(
                    {
                        "max_tokens": query.max_tokens,
                        "temperature": query.temperature,
                        "top_p": query.top_p,
                        "top_k": query.top_k,
                    }
                ),
                query.stream,
                query.num_frames_per_chunk,
                query.vlm_input_width,
                query.vlm_input_height,
                query.enable_reasoning,
            )

            # Save stream settings to json file
            filtered_query_json = self._stream_settings_cache.transform_query(query.get_query_json)
            logger.debug(f"Filtered Query JSON: {filtered_query_json}")
            self._stream_settings_cache.update_stream_settings(videoId, filtered_query_json)

            # Check if user has specified the model that is initialized
            model_info = self._stream_handler.get_models_info()
            if query.model != model_info.id:
                raise ViaException(f"No such model '{query.model}'", "BadParameters", 400)

            if query.api_type and query.api_type != model_info.api_type:
                raise ViaException(
                    f"api_type {query.api_type} not supported by model '{query.model}'",
                    "BadParameters",
                    400,
                )


            loop = asyncio.get_event_loop()

            # Convert VlmQuery to SummarizationQuery for internal processing
            # Build the query dict with only non-None values
            query_dict = {
                "id": query.id,
                "prompt": query.prompt,
                "model": query.model,
                "api_type": query.api_type,
                "response_format": query.response_format,
                "stream": query.stream,
                "chunk_duration": query.chunk_duration,
                "chunk_overlap_duration": query.chunk_overlap_duration,
                "user": query.user,
                "tools": query.tools,
                "num_frames_per_chunk": query.num_frames_per_chunk,
                "vlm_input_width": query.vlm_input_width,
                "vlm_input_height": query.vlm_input_height,
                "enable_reasoning": query.enable_reasoning,
                # Set VLM captions specific defaults
                "summarize": False,
                "enable_chat": False,
            }

            if query.system_prompt:
                query_dict["system_prompt"] = query.system_prompt

            # Add optional fields only if they have values
            if query.stream_options is not None:
                query_dict["stream_options"] = query.stream_options
            if query.max_tokens is not None:
                query_dict["max_tokens"] = query.max_tokens
            if query.temperature is not None:
                query_dict["temperature"] = query.temperature
            if query.top_p is not None:
                query_dict["top_p"] = query.top_p
            if query.top_k is not None:
                query_dict["top_k"] = query.top_k
            if query.seed is not None:
                query_dict["seed"] = query.seed
            if query.media_info is not None:
                query_dict["media_info"] = query.media_info

            summarization_query = SummarizationQuery(**query_dict)

            if len(videoIdList) == 1:
                assetList = [asset]
            # Summarize on a file or multiple files
            request_id = await loop.run_in_executor(
                self._async_executor,
                self._stream_handler.generate_vlm_captions,
                assetList,
                summarization_query,
            )
            logger.info("Created video file query %s for videoId %s", request_id, videoId)
            logger.info("Waiting for results of query %s", request_id)

        
            # Non-streaming output. Wait for request to be completed.
            await loop.run_in_executor(
                self._async_executor, self._stream_handler.wait_for_request_done, request_id
            )
            req_info, resp_list = self._stream_handler.get_response(request_id)
            self._stream_handler.check_status_remove_req_id(request_id)
            if req_info.status == RequestInfo.Status.FAILED:
                raise ViaException(
                    "Failed to generate VLM captions", "InternalServerError", 500
                )

            # Create response json and return it
            return VlmCaptionsCompletionResponse(
                id=request_id,
                model=model_info.id,
                created=int(req_info.queue_time),
                media_info=MediaInfoOffset(
                    type="offset",
                    start_offset=int(req_info.start_timestamp),
                    end_offset=int(req_info.end_timestamp),
                ),
                chunk_responses=(
                    [
                        VlmCaptionResponse(
                            start_time=(
                                str(resp.start_timestamp)
                            ),
                            end_time=(
                                str(resp.end_timestamp)
                            ),
                            content=resp.response,
                            reasoning_description=getattr(resp, "reasoning_description", ""),
                        )
                        for resp in resp_list
                    ]
                    if resp_list
                    else []
                ),
                usage=CompletionUsage(
                    total_chunks_processed=req_info.chunk_count,
                    query_processing_time=int(req_info.end_time - req_info.start_time),
                ),
            )

        # ======================= Summarize API

        # ======================= VIA Q&A API

        def adding_video_path(input_data, video_path):
            """Add video path to either a JSON string or dictionary.

            Args:
                input_data (Union[str, dict]): Either a string representation of a dictionary
                    or a dictionary
                video_path (str): Path to the video file

            Returns:
                str: A JSON string with the video path added
            """
            try:

                json_data = input_data

                # Add video path
                json_data["video"] = video_path

                # Convert back to JSON string
                return json.dumps(json_data)

            except json.JSONDecodeError as e:
                print(f"Error decoding JSON: {e}")
                return None

        @self._app.post(
            f"{API_PREFIX}/chat/completions",
            summary="VIA Chat or Q&A",
            description="Run video interactive question and answer.",
            responses={
                200: {"description": "Successful Response."},
                **add_common_error_responses(),
                503: {
                    "model": ViaError,
                    "description": (
                        "Server is busy processing another file / live-stream."
                        " Client may try again in some time."
                    ),
                },
            },
            tags=["Summarization"],
        )
        async def qa(query: ChatCompletionQuery, request: Request) -> CompletionResponse:

            videoIdListUUID = query.id_list
            logger.debug(f"{videoIdListUUID}")
            videoIdList = [str(uuid_obj) for uuid_obj in videoIdListUUID]
            assetList = []

            def json_to_string(input):
                try:
                    return json.dumps(input)
                except TypeError:
                    return input

            if len(videoIdList) > 1:
                for videoId in videoIdList:
                    asset = self._asset_manager.get_asset(videoId)
                    assetList.append(asset)
                    if asset.media_type != "image":
                        raise ViaException(
                            "Multi-file Q&A: Only image files supported."
                            f" {asset._filename} is a not an image",
                            "BadParameters",
                            400,
                        )

            videoId = videoIdList[0]  # Note: Other files processed only for multi-image qa() below
            asset = self._asset_manager.get_asset(videoId)

            logger.debug(f"Q&A; messages={query.messages}")

            media_info_start = 0
            media_info_end = 0

            if query.media_info:
                # Extract user specified start/end time filter.
                # For files, it is in terms of "offset" - start/end time in seconds
                # For live stream, it is in terms of "timetamp" - start/end NTP timestamp.
                if query.media_info.type == "offset":
                    media_info_start = query.media_info.start_offset
                    media_info_end = query.media_info.end_offset
                if query.media_info.type == "timetamp":
                    media_info_start = query.media_info.start_timestamp
                    media_info_end = query.media_info.end_timestamp

            logger.info(
                "Received QA query, id - %s (live-stream=%d), "
                "chunk_duration=%d, chunk_overlap_duration=%d, "
                "media-offset-type=%s, media-start-time=%r, "
                "media-end-time=%r, modelParams=%s, summary_duration=%d, stream=%r",
                ", ".join(videoIdList),
                query.chunk_duration,
                query.chunk_overlap_duration,
                query.media_info and query.media_info.type,
                media_info_start,
                media_info_end,
                json.dumps(
                    {
                        "max_tokens": query.max_tokens,
                        "temperature": query.temperature,
                        "top_p": query.top_p,
                        "top_k": query.top_k,
                    }
                ),
                query.summary_duration,
                query.stream,
            )

            # Check if user has specified the model that is initialized
            model_info = self._stream_handler.get_models_info()
            if query.model != model_info.id:
                raise ViaException(f"No such model '{query.model}'", "BadParameters", 400)

            if query.api_type and query.api_type != model_info.api_type:
                raise ViaException(
                    f"api_type {query.api_type} not supported by model '{query.model}'",
                    "BadParameters",
                    400,
                )

            # For non-CA RAG usecase, only streaming output is supported
            if self._stream_handler._ctx_mgr is None:
                raise ViaException(
                    "Chat functionality disabled",
                    "BadParameters",
                    400,
                )

            loop = asyncio.get_event_loop()
            request_id = str(uuid.uuid4())

            if len(videoIdList) == 1:
                assetList = [asset]

            # Measure chat completions latency
            chat_start_time = time.time()

            answer_resp = await loop.run_in_executor(
                self._async_executor,
                self._stream_handler.qa,
                assetList,
                str(query.messages[-1].content),
                {},
                media_info_start,
                media_info_end,
            )

            chat_end_time = time.time()
            chat_latency = chat_end_time - chat_start_time

            # Record the chat completions latency metrics
            self._stream_handler._metrics.chat_completions_latency.observe(chat_latency)
            self._stream_handler._metrics.chat_completions_latency_latest.set(chat_latency)

            logger.info("Created query %s for id %s", request_id, videoId)
            logger.info("Waiting for results of query %s", request_id)
            logger.info("Chat completions latency: %.3f seconds", chat_latency)

            logger.debug(f"Q&A answer:{answer_resp}")
            if len(answer_resp) > 0 and answer_resp[0] == "{":
                try:
                    json_resp = json.loads(answer_resp)
                except json.JSONDecodeError:
                    # If JSON parsing fails, proceed with original behavior
                    pass
            response = {
                "id": str(request_id),
                "model": model_info.id,
                "created": int(0),
                "object": "summarization.completion",
                "media_info": {
                    "type": "offset",
                    "start_offset": media_info_start,
                    "end_offset": media_info_end,
                },
                "choices": [
                    {
                        "finish_reason": CompletionFinishReason.STOP.value,
                        "index": 0,
                        "message": {
                            "content": answer_resp,
                            "role": "assistant",
                        },
                    }
                ],
                "usage": {
                    "total_chunks_processed": 0,
                    "query_processing_time": int(0),
                },
            }
            return response

        # ======================= Q&A API

    def _setup_exception_handlers(self):
        # Handle incorrect request schema (user error)
        @self._app.exception_handler(RequestValidationError)
        async def handle_validation_error(request, ex) -> ViaError:
            err = ex.args[0][0]
            loc = str(err["loc"])
            try:
                loc = str(err["loc"])
            except Exception:
                loc = ".".join(str(err["loc"]))
            msg = err["msg"].replace("UploadFile", "'bytes'").replace("<class 'str'>", "'string'")
            if err["type"] in ["value_error", "uuid_parsing", "string_pattern_mismatch"]:
                msg += f" (input: {json.dumps(err['input'])})"
            return JSONResponse(
                status_code=422, content={"code": "InvalidParameters", "message": f"{loc}: {msg}"}
            )

        # Handle exceptions and return error details in format specified in the API schema.
        @self._app.exception_handler(ViaException)
        async def handle_via_exception(request, ex: ViaException) -> ViaError:
            return JSONResponse(
                status_code=ex.status_code, content={"code": ex.code, "message": ex.message}
            )

        # Handle exceptions and return error details in format specified in the API schema.
        @self._app.exception_handler(HTTPException)
        async def handle_http_exception(request, ex: HTTPException) -> ViaError:
            return JSONResponse(
                status_code=ex.status_code, content={"code": ex.detail, "message": ex.detail}
            )

        # Unhandled backend errors. Return error details in format specified in the API schema.
        @self._app.exception_handler(Exception)
        async def handle_exception(request, ex: Exception) -> ViaError:
            return JSONResponse(
                status_code=500,
                content={
                    "code": "InternalServerError",
                    "message": "An internal server error occured",
                },
            )

    def _setup_openapi_schema(self):
        orig_openapi = self._app.openapi

        def custom_openapi():
            if self._app.openapi_schema:
                return self._app.openapi_schema
            openapi_schema = orig_openapi()
            openapi_schema["security"] = [{"Token": []}]
            openapi_schema["components"]["securitySchemes"] = {
                "Token": {"type": "http", "scheme": "bearer"}
            }

            openapi_schema["components"]["schemas"]["Body_add_video_file_files_post"][
                "description"
            ] = "Request body schema for adding a file."
            openapi_schema["components"]["schemas"]["Body_add_video_file_files_post"]["properties"][
                "file"
            ]["maxLength"] = 100e9
            openapi_schema["components"]["schemas"]["SummarizationQuery"]["properties"]["id"][
                "anyOf"
            ][1]["maxItems"] = 50
            openapi_schema["components"]["schemas"]["ChatCompletionQuery"]["properties"]["id"][
                "anyOf"
            ][1]["maxItems"] = 50

            def search_dict(d):
                if isinstance(d, dict):
                    for k, v in d.items():
                        if isinstance(v, dict):
                            search_dict(v)
                        elif isinstance(v, list):
                            for item in v:
                                search_dict(item)
                        else:
                            if k == "format" and v == "uuid":
                                d["maxLength"] = UUID_LENGTH
                                d["minLength"] = UUID_LENGTH
                                break
                    if "enum" in d and "const" in d:
                        d.pop("const")
                elif isinstance(d, list):
                    for item in d:
                        search_dict(item)

            search_dict(openapi_schema)

            self._app.openapi_schema = openapi_schema
            return self._app.openapi_schema

        self._app.openapi = custom_openapi

    @staticmethod
    def populate_argument_parser(parser: argparse.ArgumentParser):
        ViaStreamHandler.populate_argument_parser(parser)

        parser.add_argument("--host", type=str, help="Address to run server on", default="0.0.0.0")
        parser.add_argument("--port", type=str, help="port to run server on", default="8000")
        parser.add_argument(
            "--log-level",
            type=str,
            choices=["error", "warn", "info", "debug", "perf"],
            default="info",
            help="Application log level",
        )
        parser.add_argument(
            "--max-asset-storage-size",
            type=int,
            help="Maximum size of asset storage directory",
            default=None,
        )

    @staticmethod
    def get_argument_parser():
        parser = argparse.ArgumentParser(
            "VIA Server", formatter_class=argparse.ArgumentDefaultsHelpFormatter
        )
        ViaServer.populate_argument_parser(parser)
        return parser


if __name__ == "__main__":

    parser = ViaServer.get_argument_parser()
    args = parser.parse_args()

    server = ViaServer(args)
    server.run()
