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
import uuid
from concurrent.futures import ThreadPoolExecutor
from typing import Annotated, Optional

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
    AnalysisDeleteResponse,
    AnalysisInfo,
    AnalysisListResponse,
    AnalysisQuery,
    AnalysisResponse,
    ChatCompletionQuery,
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


API_PREFIX = (
    "/v1" if os.environ.get("VSS_API_ENABLE_VERSIONING", "").lower() in ["true", "1"] else ""
)


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
            max_workers=10, thread_name_prefix="vss-async-worker"
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
            summary="API for uploading media files",
            description="Upload one or two files. Converts segment format automatically.",
            tags=["Files"],
        )
        async def add_video_file(
            purpose: Annotated[Purpose, Form(...)],
            asset_id: Annotated[str, Form(description="Asset ID to store the files")],
            media_type1: Annotated[MediaType, Form(description="Media type for file1")],
            file1: Annotated[UploadFile, File(description="First file object")],
            media_type2: Annotated[Optional[MediaType], Form(description="Media type for file2")] = None,
            file2: Annotated[Optional[UploadFile], File(description="Second file object")] = None,
        ):
            logger.info(f"Received add file request for asset_id: {asset_id}")

            # 변환 로직 함수 (내부 헬퍼)
            def convert_segment_format(old_data: dict, video_id: str) -> dict:
                new_data = {
                    "video_id": video_id,
                    "coarse_scenes": []
                }
                for idx, scene in enumerate(old_data.get("hierarchical_scenes", [])):
                    medium_scene = scene.get("medium_scene", {})
                    high_scenes = scene.get("contained_high_scenes", [])

                    coarse_scene = {
                        "id": idx,
                        "start_time": medium_scene.get("start_time", ""),
                        "end_time": medium_scene.get("end_time", ""),
                        "num_finegrained_scenes": len(high_scenes),
                        "fine_scenes": []
                    }
                    for jdx, hs in enumerate(high_scenes):
                        fine_scene = {
                            "id": jdx,
                            "start_time": hs.get("start_time", ""),
                            "end_time": hs.get("end_time", "")
                        }
                        coarse_scene["fine_scenes"].append(fine_scene)
                    new_data["coarse_scenes"].append(coarse_scene)
                return new_data

            upload_tasks = [(file1, media_type1)]
            if file2 and media_type2:
                upload_tasks.append((file2, media_type2))

            uploaded_files_result = []

            for file, m_type in upload_tasks:
                m_type_val = m_type.value if hasattr(m_type, 'value') else m_type
                
                # 1. 파일 기본 저장
                await self._asset_manager.save_file(file, asset_id, purpose.value, m_type_val)

                # 2. 경로 및 확장자 설정
                ext_map = {"video": ".mp4", "image": ".jpg", "segment": ".json", "metadata": ".json"}
                ext = ext_map.get(m_type_val, "")
                target_path = os.path.join(self._asset_manager._asset_dir, asset_id, f"{m_type_val}{ext}")

                # [추가 부분] 3. segment 타입일 경우 포맷 변환 수행
                if m_type_val == "segment":
                    try:
                        # 저장된 파일을 다시 읽음
                        async with aiofiles.open(target_path, mode='r') as f:
                            content = await f.read()
                            old_segment_data = json.loads(content)

                        # 변환 로직 적용
                        new_segment_data = convert_segment_format(old_segment_data, asset_id)

                        # 변환된 데이터를 다시 덮어씀
                        async with aiofiles.open(target_path, mode='w') as f:
                            await f.write(json.dumps(new_segment_data, indent=4))
                        
                        logger.info(f"Segment format converted for asset_id: {asset_id}")
                    except Exception as e:
                        logger.error(f"Failed to convert segment format: {e}")
                        # 변환 실패 시 기존 파일은 유지되나 로그를 남김

                # 4. 저장된 파일 정보 확인 (용량 등)
                try:
                    fsize = (await aiofiles.os.stat(target_path)).st_size
                except:
                    fsize = 0

                uploaded_files_result.append({
                    "asset_id": asset_id,
                    "bytes": fsize,
                    "media_type": m_type_val,
                    "purpose": "vision"
                })

                # 비디오 FPS 캐시 업데이트 로직
                if m_type_val == "video" and not os.environ.get("VSS_SKIP_INPUT_MEDIA_VERIFICATION", ""):
                    try:
                        media_info = await MediaFileInfo.get_info_async(target_path)
                        if hasattr(media_info, "video_fps"):
                            self._asset_manager.get_asset(asset_id).update_video_fps(float(media_info.video_fps))
                    except Exception as e:
                        logger.error(f"Video verification failed: {e}")

            return {
                "asset_id": asset_id,
                "object": "list",
                "data": uploaded_files_result
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
                        "Server is busy processing another file."
                        " Client may try again in some time."
                    ),
                },
            },
            tags=["Summarization"],
        )
        async def summarize(query: SummarizationQuery, request: Request) -> CompletionResponse:
            # 1. asset_id 리스트 처리
            assetIdList = [str(obj) for obj in query.id_list]
            assetList = []
            sampling_source = None

            for asset_id in assetIdList:
                # AssetManager에서 해당 asset_id 폴더 정보를 가져옴
                asset = self._asset_manager.get_asset(asset_id)
                
                # [핵심] 요약은 비디오 파일을 필요로 하므로 폴더 내 video.mp4 경로를 강제 지정
                video_file_path = os.path.join(self._asset_manager._asset_dir, asset_id, "video.mp4")
                
                if not os.path.exists(video_file_path):
                    raise ViaException(
                        f"Video file (video.mp4) not found in asset folder: {asset_id}",
                        "ResourceNotFound",
                        404
                    )
                
                # 엔진이 분석할 수 있도록 asset 객체의 path를 video.mp4로 설정
                asset._path = video_file_path
                assetList.append(asset)
            
            if query.chunk_type == "segment":
                main_asset_id = assetIdList[0]
                segment_file_path = os.path.join(self._asset_manager._asset_dir, main_asset_id, "segment.json")

                if os.path.exists(segment_file_path):
                    sampling_source = segment_file_path
                    logger.info(f"Using segment-based sampling with file: {sampling_source}")
                else:
                    # segment 타입인데 파일이 없으면 에러 처리 또는 uniform 강제 전환 (여기선 에러 처리)
                    raise ViaException(
                        f"Segment file (segment.json) not found for asset: {main_asset_id}",
                        "ResourceNotFound", 404
                    )
            else:
                sampling_source = None
                logger.info("Using uniform sampling")
            
            logger.info(f"Sampling source: {sampling_source}")

            # 2. 오디오 지원 여부 및 미디어 타입 검증
            if query.enable_audio:
                for asset in assetList:
                    if asset.media_type == "image":
                        raise ViaException(
                            f"Audio transcription is not supported for image assets. Asset {asset.asset_id} is an image",
                            "BadParameters",
                            400,
                        )

            # 3. 메인 자산 정보 설정 (첫 번째 자산 기준)
            main_asset = assetList[0]
            main_asset_id = assetIdList[0]

            media_info_start = None
            media_info_end = None

            if query.media_info:
                if query.media_info.type == "offset":
                    media_info_start = query.media_info.start_offset
                    media_info_end = query.media_info.end_offset
                elif query.media_info.type == "timetamp":
                    media_info_start = query.media_info.start_timestamp
                    media_info_end = query.media_info.end_timestamp

            # 4. 로깅 (videoId 대신 assetIdList 사용)
            logger.info(
                "Received summarize query, ids - %s, "
                "chunk_duration=%d, chunk_overlap_duration=%d, "
                "media-offset-type=%s, media-start-time=%r, "
                "media-end-time=%r, enable_audio = %d",
                ", ".join(assetIdList),
                query.chunk_duration,
                query.chunk_overlap_duration,
                query.media_info and query.media_info.type,
                media_info_start,
                media_info_end,
                query.enable_audio,
            )

            # 5. 스트림 설정 캐시 업데이트
            filtered_query_json = self._stream_settings_cache.transform_query(query.get_query_json)
            self._stream_settings_cache.update_stream_settings(main_asset_id, filtered_query_json)

            # 6. 모델 및 프롬프트 검증
            model_info = self._stream_handler.get_models_info()
            if query.model != model_info.id:
                raise ViaException(f"No such model '{query.model}'", "BadParameters", 400)

            validation_errors = validate_required_prompts(
                query.prompt,
                query.caption_summarization_prompt,
                query.summary_aggregation_prompt,
                self._args,
            )
            if validation_errors:
                raise ViaException("; ".join(validation_errors), "BadParameters", 400)

            # 7. 비동기 엔진 실행
            loop = asyncio.get_event_loop()
            request_id = await loop.run_in_executor(
                self._async_executor,
                self._stream_handler.summarize,
                assetList,
                query,
                sampling_source,
            )
            logger.info("Created video file query %s for main asset %s", request_id, main_asset_id)

            # 8. 결과 대기 (Non-streaming)
            await loop.run_in_executor(
                self._async_executor, self._stream_handler.wait_for_request_done, request_id
            )
            req_info, resp_list = self._stream_handler.get_response(request_id)
            self._stream_handler.check_status_remove_req_id(request_id)
            
            if req_info.status == RequestInfo.Status.FAILED:
                raise ViaException(f"Failed to generate summary: {req_info.error_message}", "InternalServerError", 500)

            # 9. 응답 반환
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
                "choices": [
                    {
                        "finish_reason": "stop",
                        "index": 0,
                        "message": {"content": resp_list[0].response, "role": "assistant"},
                    }
                ] if resp_list else [],
                "usage": {
                    "total_chunks_processed": req_info.chunk_count,
                    "query_processing_time": int(req_info.end_time - req_info.start_time),
                },
            }


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
                        "Server is busy processing another file."
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
                if query.media_info.type == "offset":
                    media_info_start = query.media_info.start_offset
                    media_info_end = query.media_info.end_offset
                if query.media_info.type == "timetamp":
                    media_info_start = query.media_info.start_timestamp
                    media_info_end = query.media_info.end_timestamp

            logger.info(
                "Received generate_vlm_captions query, id - %s, "
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
            description="Run video interactive question and answer using asset_id.",
            responses={
                200: {"description": "Successful Response."},
                **add_common_error_responses(),
                503: {
                    "model": ViaError,
                    "description": (
                        "Server is busy processing another file."
                        " Client may try again in some time."
                    ),
                },
            },
            tags=["Summarization"],
        )
        async def qa(query: ChatCompletionQuery, request: Request) -> CompletionResponse:
            # 1. asset_id 리스트 처리
            assetIdList = [str(uuid_obj) for uuid_obj in query.id_list]
            assetList = []

            for asset_id in assetIdList:
                # AssetManager에서 해당 asset_id 폴더 정보를 가져옴
                asset = self._asset_manager.get_asset(asset_id)
                
                # [핵심] QA/Chat 분석을 위해 폴더 내 video.mp4 경로를 강제 지정
                video_file_path = os.path.join(self._asset_manager._asset_dir, asset_id, "video.mp4")
                
                if not os.path.exists(video_file_path):
                    raise ViaException(
                        f"Video file (video.mp4) not found in asset folder: {asset_id}",
                        "ResourceNotFound",
                        404
                    )
                
                # AttributeError 방지: property 'path' 대신 내부 변수 '_path'에 할당
                asset._path = video_file_path 
                assetList.append(asset)

            # 2. 다중 이미지 Q&A 체크 (기존 로직 유지)
            if len(assetIdList) > 1:
                for asset in assetList:
                    if asset.media_type != "image":
                        raise ViaException(
                            "Multi-file Q&A: Only image files supported. "
                            f"Asset {asset.asset_id} is not an image.",
                            "BadParameters",
                            400,
                        )

            # 메인 자산 ID 설정 (첫 번째 자산 기준)
            main_asset_id = assetIdList[0]

            logger.debug(f"Q&A; messages={query.messages}")

            media_info_start = 0
            media_info_end = 0

            if query.media_info:
                if query.media_info.type == "offset":
                    media_info_start = query.media_info.start_offset
                    media_info_end = query.media_info.end_offset
                elif query.media_info.type == "timetamp":
                    media_info_start = query.media_info.start_timestamp
                    media_info_end = query.media_info.end_timestamp

            # 3. 로깅
            logger.info(
                "Received QA query, id - %s, media-offset-type=%s, "
                "media-start-time=%r, media-end-time=%r, modelParams=%s, stream=%r",
                ", ".join(assetIdList),
                query.media_info and query.media_info.type,
                media_info_start,
                media_info_end,
                json.dumps({
                    "max_tokens": query.max_tokens,
                    "temperature": query.temperature,
                    "top_p": query.top_p,
                    "top_k": query.top_k,
                }),
                query.stream,
            )

            # 4. 모델 정보 확인
            model_info = self._stream_handler.get_models_info()
            if query.model != model_info.id:
                raise ViaException(f"No such model '{query.model}'", "BadParameters", 400)

            if self._stream_handler._ctx_mgr is None:
                raise ViaException("Chat functionality disabled", "BadParameters", 400)

            # 5. 비동기 엔진(QA) 실행
            loop = asyncio.get_event_loop()
            request_id = str(uuid.uuid4())
            chat_start_time = time.time()

            answer_resp = await loop.run_in_executor(
                self._async_executor,
                self._stream_handler.qa,
                assetList,
                str(query.messages[-1].content),
                {},
                media_info_start,
                media_info_end,
                query.chunk_type,  # ✅ chunk_type 전달
                query.collection_name,  # ✅ collection_name 전달
                query.segment_level,  # ✅ segment_level 전달 (renamed from granularity)
            )

            chat_latency = time.time() - chat_start_time

            # 6. 메트릭 및 로그 기록
            self._stream_handler._metrics.chat_completions_latency.observe(chat_latency)
            self._stream_handler._metrics.chat_completions_latency_latest.set(chat_latency)
            logger.info("Created query %s for asset_id %s", request_id, main_asset_id)
            logger.info("Chat completions latency: %.3f seconds", chat_latency)

            # 7. 응답 반환
            return {
                "id": str(request_id),
                "model": model_info.id,
                "created": int(time.time()),
                "object": "summarization.completion",
                "media_info": {
                    "type": "offset",
                    "start_offset": media_info_start,
                    "end_offset": media_info_end,
                },
                "choices": [
                    {
                        "finish_reason": "stop",
                        "index": 0,
                        "message": {
                            "content": answer_resp,
                            "role": "assistant",
                        },
                    }
                ],
                "usage": {
                    "total_chunks_processed": 0,
                    "query_processing_time": int(chat_latency),
                },
            }

        # ======================= Q&A API

        # ======================= Analysis API

        @self._app.post(
            f"{API_PREFIX}/analyze",
            summary="Analyze video content metadata",
            description=(
                "Extracts structured metadata from video summaries using LLM analysis.\n\n"
                "This endpoint analyzes batch summaries from the specified collection "
                "and extracts metadata such as locations, keywords, emotions, themes, "
                "IAB categories, and more.\n\n"
                "**Custom Schema:**\n"
                "You can provide a custom schema to define which metadata fields to extract. "
                "Each field should include a `type` and `description`.\n\n"
                "**Custom Prompt:**\n"
                "You can provide a custom prompt using `{content}` and `{schema}` placeholders."
            ),
            responses={
                200: {"description": "Successful Response."},
                **add_common_error_responses(),
            },
            tags=["Analysis"],
        )
        async def analyze_video(query: AnalysisQuery, request: Request) -> AnalysisResponse:
            logger.info(
                "Received analyze request - collection_name: %s, clear: %s, has_prompt: %s, has_schema: %s",
                query.collection_name,
                query.clear,
                bool(query.prompt),
                bool(query.schema),
            )

            loop = asyncio.get_event_loop()

            try:
                # Call ViaStreamHandler.analyze()
                result, analysis_id = await loop.run_in_executor(
                    self._async_executor,
                    self._stream_handler.analyze,
                    query,
                )

                return AnalysisResponse(
                    collection_name=query.collection_name,
                    analysis_id=analysis_id or "",
                    status="success",
                    result=result,
                    error="",
                    created=int(time.time()),
                )

            except ViaException as e:
                # Already logged in stream_handler, just return error response
                return AnalysisResponse(
                    collection_name=query.collection_name,
                    analysis_id="",
                    status="error",
                    result=None,
                    error=e.message,
                    created=int(time.time()),
                )
            except Exception as e:
                logger.error(f"Analysis failed with unexpected error: {str(e)}")
                return AnalysisResponse(
                    collection_name=query.collection_name,
                    analysis_id="",
                    status="error",
                    result=None,
                    error=str(e),
                    created=int(time.time()),
                )

        @self._app.get(
            f"{API_PREFIX}/analyze/list",
            summary="List all analyses for a collection",
            description=(
                "Retrieve a list of all analysis results for a specific collection.\n\n"
                "Returns analysis IDs, batch indices, creation timestamps, and model info."
            ),
            responses={
                200: {"description": "Successful Response."},
                **add_common_error_responses(),
            },
            tags=["Analysis"],
        )
        async def list_analyses(collection_name: str, request: Request) -> AnalysisListResponse:
            logger.info(f"Received list analyses request for collection_name: {collection_name}")

            loop = asyncio.get_event_loop()

            try:
                analyses = await loop.run_in_executor(
                    self._async_executor,
                    self._stream_handler.list_analyses,
                    collection_name,
                )

                analysis_list = [
                    AnalysisInfo(
                        analysis_id=a.get("analysis_id", ""),
                        batch_i=a.get("batch_i", 0),
                        created_at=a.get("created_at", 0),
                        model=a.get("model", "unknown"),
                    )
                    for a in analyses
                ]
                message = "" if analysis_list else "No analyses found. Please run analysis first."

                return AnalysisListResponse(
                    collection_name=collection_name,
                    analyses=analysis_list,
                    count=len(analysis_list),
                    message=message,
                )

            except ViaException as e:
                # Already logged in stream_handler
                raise e
            except Exception as e:
                logger.error(f"List analyses failed: {str(e)}")
                raise ViaException(str(e), "", 500)

        @self._app.delete(
            f"{API_PREFIX}/analyze",
            summary="Delete all analyses for a collection",
            description=(
                "Delete all analysis results for a specific collection.\n\n"
                "This permanently removes all stored analysis data for the collection."
            ),
            responses={
                200: {"description": "Successful Response."},
                **add_common_error_responses(),
            },
            tags=["Analysis"],
        )
        async def delete_analyses(collection_name: str, request: Request) -> AnalysisDeleteResponse:
            logger.info(f"Received delete analyses request for collection_name: {collection_name}")

            loop = asyncio.get_event_loop()

            try:
                deleted_count = await loop.run_in_executor(
                    self._async_executor,
                    self._stream_handler.delete_analyses,
                    collection_name,
                )

                return AnalysisDeleteResponse(
                    collection_name=collection_name,
                    deleted_count=deleted_count,
                )

            except ViaException as e:
                logger.error(f"Delete analyses failed: {e.message}")
                raise e
            except Exception as e:
                logger.error(f"Delete analyses failed with unexpected error: {str(e)}")
                raise ViaException(str(e), "", 500)

        # ======================= Analysis API

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
