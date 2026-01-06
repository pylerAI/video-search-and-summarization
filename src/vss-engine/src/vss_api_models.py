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

import os
from datetime import datetime
from enum import Enum
from typing import Annotated, List, Literal, Optional, Union
from uuid import UUID

from pydantic import (
    AfterValidator,
    BaseModel,
    ConfigDict,
    Field,
    HttpUrl,
    field_validator,
)
from via_exception import ViaException

TIMESTAMP_PATTERN = r"^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d{3})?Z$"
FILE_NAME_PATTERN = r"^[A-Za-z0-9_.\- ]*$"
PATH_PATTERN = r"^[A-Za-z0-9_.\-/ ]*$"
DESCRIPTION_PATTERN = r'^[A-Za-z0-9_.\-"\' ,]*$'
UUID_LENGTH = 36
ERROR_CODE_PATTERN = r"^[A-Za-z]*$"
ERROR_MESSAGE_PATTERN = r'^[A-Za-z\-. ,_"\']*$'
KEY_PATTERN = r"^[A-Za-z0-9]*$"
ANY_CHAR_PATTERN = r"^(.|\n)*$"


# Common models
class ViaBaseModel(BaseModel):
    """VIA pydantic base model that does not allow unsupported params in requests"""

    model_config = ConfigDict(extra="forbid")


class ViaError(ViaBaseModel):
    """VIA Error Information."""

    code: str = Field(
        description="Error code", examples=["ErrorCode"], max_length=128, pattern=ERROR_CODE_PATTERN
    )
    message: str = Field(
        description="Detailed error message",
        examples=["Detailed error message"],
        max_length=1024,
        pattern=ERROR_MESSAGE_PATTERN,
    )


# Validate RFC3339 timestamp string
def timestamp_validator(v: str, validation_info):
    try:
        # Attempt to parse the RFC3339 timestamp
        datetime.strptime(v, "%Y-%m-%dT%H:%M:%S.%fZ")
    except ValueError:
        raise ViaException(
            f"{validation_info.field_name} be a valid RFC3339 timestamp string",
            "InvalidParameters",
            422,
        )
    return v


# ===================== Models required by /files API


class MediaType(str, Enum):
    """Media type of the uploaded file."""

    VIDEO = "video"
    IMAGE = "image"
    METADATA = "metadata"
    SEGMENT = "segment"


class Purpose(str, Enum):
    """Purpose for the file."""

    VISION = "vision"


class FileInfo(ViaBaseModel):
    """Information about an uploaded file."""

    asset_id: str = Field(
        description="The file identifier, which can be referenced in the API endpoints."
    )
    bytes: int = Field(
        description="The size of the file, in bytes.",
        json_schema_extra={"format": "int64"},
        examples=[2000000],
        ge=0,
        le=100e9,
    )
    media_type: str = Field(
        description="Media type of the uploaded file.",
        max_length=256,
        examples=["video", "image", "metadata", "segment"],
        pattern=FILE_NAME_PATTERN,
    )
    purpose: Purpose = Field(
        description=(
            "The intended purpose of the uploaded file."
            " For VIA use-case this must be set to vision"
        ),
        examples=["vision"],
    )




class AddFileInfoResponse(FileInfo):
    """Response schema for the add file request."""

    media_type: MediaType = Field(description="Media type (image / video / metadata / segment).")


class DeleteFileResponse(ViaBaseModel):
    """Response schema for delete file request."""

    asset_id: str = Field(
        description="The file identifier, which can be referenced in the API endpoints."
    )
    object: Literal["file"] = Field(description="Type of response object.")
    deleted: bool = Field(description="Indicates if the file was deleted")


class ListFilesResponse(ViaBaseModel):
    """Response schema for the list files API."""

    data: list[AddFileInfoResponse] = Field(max_length=1000000)
    object: Literal["list"] = Field(description="Type of response object")


# ===================== Models required by Files API


# ===================== Models required by /models API
class ModelInfo(ViaBaseModel):
    """Describes an OpenAI model offering that can be used with the API."""

    id: str = Field(
        description="The model identifier, which can be referenced in the API endpoints.",
        pattern=FILE_NAME_PATTERN,
        max_length=2560,
    )
    created: int = Field(
        description="The Unix timestamp (in seconds) when the model was created.",
        examples=[1686935002],
        ge=0,
        le=4000000000,
        json_schema_extra={"format": "int64"},
    )
    object: Literal["model"] = Field(description="Type of object")
    owned_by: str = Field(
        description="The organization that owns the model.",
        examples=["NVIDIA"],
        max_length=10000,
        pattern=DESCRIPTION_PATTERN,
    )
    api_type: str = Field(
        description="API used to access model.",
        examples=["internal"],
        max_length=32,
        pattern=r"^[A-Za-z]*$",
    )


class ListModelsResponse(ViaBaseModel):
    """Lists and describes the various models available."""

    object: Literal["list"] = Field(description="Type of response object")
    data: list[ModelInfo] = Field(max_length=5)


# ===================== Models required by /models API


# ===================== Models required by /summarize API
class MediaInfoOffset(ViaBaseModel):
    """Media information using offset for files."""

    type: Literal["offset"] = Field(
        description="Information about a segment of media with start and end offsets."
    )
    start_offset: int = Field(
        default=None,
        description="Segment start offset in seconds from the beginning of the media.",
        ge=0,
        le=4000000000,
        examples=[0],
        json_schema_extra={"format": "int64"},
    )
    end_offset: int = Field(
        default=None,
        description="Segment end offset in seconds from the beginning of the media.",
        ge=0,
        le=4000000000,
        examples=[4000000000],
        json_schema_extra={"format": "int64"},
    )


class ResponseType(str, Enum):
    """Query Response Type."""

    JSON_OBJECT = "json_object"
    TEXT = "text"


class ResponseFormat(ViaBaseModel):
    """Query Response Format Object."""

    type: ResponseType = Field(
        description="Response format type", examples=[ResponseType.JSON_OBJECT, ResponseType.TEXT]
    )


class StreamOptions(ViaBaseModel):
    """Options for streaming response."""

    include_usage: bool = Field(
        default=False,
        description=(
            "If set, an additional chunk will be streamed before the `data: [DONE]` message."
            " The `usage` field on this chunk shows the token usage statistics"
            " for the entire request, and the `choices` field will always be an empty array."
            " All other chunks will also include a `usage` field, but with a null value."
        ),
        examples=[True, False],
    )


class SummarizationQuery(ViaBaseModel):
    """Summarization Query Request Fields."""

    asset_id: Union[str, List[str]] = Field(
        description="Asset ID or list of Asset IDs to summarize",
        examples=[
            "asset_id_string",
            ["asset_id_string_1", "asset_id_string_2"],
        ],
    )

    chunk_type: Literal["uniform", "segment"] = Field(
        default="uniform",
        description="Chunk type (uniform, segment).",
        examples=["uniform", "segment"],
    )

    @field_validator("asset_id", mode="after")
    @classmethod # Pydantic V2에서는 classmethod 권장
    def check_ids(cls, v: any):
        if isinstance(v, list) and len(v) > 50:
            raise ValueError("List of asset_ids must not exceed 50 items")
        return v

    @property
    def id_list(self) -> List[str]:
        # self.asset_id가 문자열이면 리스트로 감싸고, 리스트면 그대로 반환
        return [self.asset_id] if isinstance(self.asset_id, str) else self.asset_id

    @property
    def get_query_json(self) -> dict:
        return self.model_dump(mode="json")

    system_prompt: str = Field(
        default=os.environ.get("VLM_SYSTEM_PROMPT", ""),
        max_length=5000,
        description="System prompt for the VLM. To enable reasoning with Cosmos Reason1, add <think></think> and <answer></answer> tags to the system prompt.",  # noqa: E501
        pattern=ANY_CHAR_PATTERN,
        examples=[
            "You are a helpful assistant. Answer the user's question.",
        ],
    )

    prompt: str = Field(
        default="",
        max_length=5000,
        description="Prompt for summary generation",
        pattern=ANY_CHAR_PATTERN,
        examples=["Write a concise and clear dense caption for the provided warehouse video"],
    )
    model: str = Field(
        description="Model to use for this query.",
        examples=["vila-1.5", "nvila", "llava-1.5"],
        max_length=256,
        pattern=FILE_NAME_PATTERN,
    )
    api_type: str = Field(
        description="API used to access model.",
        examples=["internal"],
        max_length=32,
        pattern=r"^[A-Za-z]*$",
        default="",
    )
    response_format: ResponseFormat = Field(
        description="An object specifying the format that the model must output.",
        default=ResponseFormat(type=ResponseType.TEXT),
        examples=[
            ResponseFormat(type=ResponseType.TEXT),
            ResponseFormat(type=ResponseType.JSON_OBJECT),
        ],
    )
    stream: bool = Field(
        default=False,
        description=(
            "If set, partial message deltas will be sent, like in ChatGPT."
            " Tokens will be sent as data-only [server-sent events]"
            "(https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#Event_stream_format)"  # noqa: E501
            " as they become available, with the stream terminated by a `data: [DONE]` message."
        ),
        examples=[True, False],
    )
    stream_options: StreamOptions | None = Field(
        description="Options for streaming response.",
        default=None,
        json_schema_extra={"nullable": True},
        examples=[{"include_usage": True}, {"include_usage": False}],
    )
    max_tokens: int = Field(
        default=None,
        examples=[512],
        ge=1,
        le=1024,
        description="The maximum number of tokens to generate in any given call.",
        json_schema_extra={"format": "int32"},
    )
    temperature: float = Field(
        default=None,
        examples=[0.2],
        ge=0,
        le=1,
        description=(
            "The sampling temperature to use for text generation."
            " The higher the temperature value is, the less deterministic the output text will be."
        ),
    )
    top_p: float = Field(
        default=None,
        examples=[1],
        ge=0,
        le=1,
        description=(
            "The top-p sampling mass used for text generation."
            " The top-p value determines the probability mass that is sampled at sampling time."
        ),
    )
    top_k: float = Field(
        default=None,
        examples=[100],
        ge=1,
        le=1000,
        description=(
            "The number of highest probability vocabulary tokens to" " keep for top-k-filtering"
        ),
    )
    seed: int = Field(
        default=None,
        ge=1,
        le=(2**32 - 1),
        examples=[10],
        description="Seed value",
        json_schema_extra={"format": "int64"},
    )

    chunk_duration: int = Field(
        default=0,
        examples=[60],
        description="Chunk videos into `chunkDuration` seconds. Set `0` for no chunking",
        ge=0,
        le=3600,
        json_schema_extra={"format": "int32"},
    )
    chunk_overlap_duration: int = Field(
        default=0,
        examples=[10],
        description="Chunk Overlap Duration Time in Seconds. Set `0` for no overlap",
        ge=0,
        le=3600,
        json_schema_extra={"format": "int32"},
    )
    media_info: MediaInfoOffset = Field(
        default=None,
        description="Provide Start and End times offsets for processing part of a video file.",
    )

    user: str = Field(
        default="",
        examples=["user-123"],
        max_length=256,
        description="A unique identifier for the user",
        pattern=r"^[a-zA-Z0-9-._]*$",
    )
    caption_summarization_prompt: str = Field(
        default="",
        max_length=5000,
        description="Prompt for caption summarization",
        examples=["Prompt for caption summarization"],
        pattern=ANY_CHAR_PATTERN,
    )

    summary_aggregation_prompt: str = Field(
        default="",
        max_length=5000,
        description="Prompt for summary aggregation",
        examples=["Prompt for summary aggregation"],
        pattern=ANY_CHAR_PATTERN,
    )

    shot_summarization_prompt: str = Field(
        default="",
        max_length=5000,
        description="Prompt for shot-level summarization (segment mode)",
        examples=["Prompt for combining VLM and ASR into shot summary"],
        pattern=ANY_CHAR_PATTERN,
    )

    scene_summarization_prompt: str = Field(
        default="",
        max_length=5000,
        description="Prompt for scene-level summarization (segment mode)",
        examples=["Prompt for aggregating shot summaries into scene summary"],
        pattern=ANY_CHAR_PATTERN,
    )

    summarize: bool = Field(
        default=None,
        description="Enable summarization for the group of chunks",
        examples=[True, False],
    )

    enable_chat: bool = Field(
        default=False,
        description="Enable chat Question & Answers on the input media",
        examples=[True, False],
    )

    num_frames_per_chunk: int = Field(
        default=0,
        examples=[10],
        description="Number of frames per chunk to use for the VLM",
        ge=0,
        le=256,
        json_schema_extra={"format": "int32"},
    )
    vlm_input_width: int = Field(
        default=0,
        examples=[256],
        description="VLM Input Width",
        ge=0,
        le=4096,
        json_schema_extra={"format": "int32"},
    )
    vlm_input_height: int = Field(
        default=0,
        examples=[256],
        description="VLM Input Height",
        ge=0,
        le=4096,
        json_schema_extra={"format": "int32"},
    )
    enable_audio: bool = Field(
        default=False,
        description="Enable transcription of the audio stream in the media",
        examples=[True, False],
    )

    enable_reasoning: bool = Field(
        default=False,
        description="Enable reasoning for VLM captions generation",
        examples=[True, False],
    )

    summarize_batch_size: int = Field(
        default=None,
        examples=[5],
        description="Summarization batch size",
        ge=1,
        le=1024,
        json_schema_extra={"format": "int32"},
    )

    rag_top_k: int = Field(
        default=None,
        examples=[5],
        description="RAG top k",
        ge=1,
        le=1024,
        json_schema_extra={"format": "int32"},
    )

    rag_batch_size: int = Field(
        default=None,
        examples=[5],
        description="RAG batch size",
        ge=1,
        le=1024,
        json_schema_extra={"format": "int32"},
    )

    summarize_max_tokens: int = Field(
        default=None,
        examples=[512],
        ge=1,
        le=10240,
        description="The maximum number of tokens to generate in any given summarization call.",
        json_schema_extra={"format": "int32"},
    )
    summarize_temperature: float = Field(
        default=None,
        examples=[0.2],
        ge=0,
        le=1,
        description=(
            "The sampling temperature to use for summary text generation."
            " The higher the temperature value is, the less deterministic the output text will be."
        ),
    )
    summarize_top_p: float = Field(
        default=None,
        examples=[1],
        ge=0,
        le=1,
        description=(
            "The top-p sampling mass used for summary text generation."
            " The top-p value determines the probability mass that is sampled at sampling time."
        ),
    )

    chat_max_tokens: int = Field(
        default=None,
        examples=[512],
        ge=1,
        le=10240,
        description="The maximum number of tokens to generate in any given QnA call.",
        json_schema_extra={"format": "int32"},
    )
    chat_temperature: float = Field(
        default=None,
        examples=[0.2],
        ge=0,
        le=1,
        description=(
            "The sampling temperature to use for QnA text generation."
            " The higher the temperature value is, the less deterministic the output text will be."
        ),
    )
    chat_top_p: float = Field(
        default=None,
        examples=[1],
        ge=0,
        le=1,
        description=(
            "The top-p sampling mass used for QnA text generation."
            " The top-p value determines the probability mass that is sampled at sampling time."
        ),
    )
    graph_db: str = Field(
        default=None,
        examples=["neo4j", "arango"],
        description="Graph database to use for RAG",
        pattern=r"^(neo4j|arango)$",
        max_length=32,
    )
    enable_cot: bool = Field(
        default=False,
        description="Enable CoT for the summarization",
    )
    enable_image: bool = Field(
        default=False,
        description="Enable image for the summarization",
    )
    collection_name: str = Field(
        default=None,
        description="User specified collection name for the graph rag",
        max_length=256,
        pattern="^[A-Za-z_][A-Za-z0-9_]*$",
    )

    custom_metadata: dict[
        Annotated[str, Field(max_length=1024, pattern=ANY_CHAR_PATTERN)],
        Annotated[str, Field(max_length=1024, pattern=ANY_CHAR_PATTERN)],
    ] = Field(
        default=None,
        description="Custom metadata to be added to the summarization request. This is a JSON\
             object with key-value pairs. Custom metadata is supported only with user managed\
                 milvus db collections.",
    )

    delete_external_collection: bool = Field(
        default=False,
        description="Delete the external collection at the end of the summarization request",
    )


class CompletionFinishReason(str, Enum):
    """The reason the model stopped generating tokens."""

    STOP = "stop"
    LENGTH = "length"
    CONTENT_FILTER = "content_filter"


class ChatMessage(ViaBaseModel):
    """A chatbot chat message object. This object uniquely identify
    a query/response/other messages in a chatbot."""

    content: str = Field(
        description="The content of this message.",
        max_length=256000,
        pattern=ANY_CHAR_PATTERN,
    )
    role: Literal["system", "user", "assistant"] = Field(
        description="The role of the author of this message."
    )
    name: str = Field(
        description="An optional name for the participant. "
        "Provides the model information to differentiate between participants of the same role",
        max_length=256,
        pattern=r"^[\x00-\x7F]*$",
        default="",
    )


class ChatCompletionQuery(ViaBaseModel):
    """A chat completion query."""

    asset_id: Union[str, List[str]] = Field(
        description="Asset ID or list of Asset IDs of the file(s) to query"
    )

    @field_validator("asset_id", mode="after")
    @classmethod
    def check_ids(cls, v: any):
        if isinstance(v, list) and len(v) > 50:
            raise ValueError("List of asset_ids must not exceed 50 items")
        return v

    @property
    def id_list(self) -> List[str]:
        return [self.asset_id] if isinstance(self.asset_id, str) else self.asset_id

    chunk_type: Literal["uniform", "segment"] = Field(
        default="uniform",
        description="Chunk type for RAG retrieval: 'uniform' for uniform chunks, 'segment' for segment-based chunks."
    )
    
    segment_level: Literal["shot", "scene"] = Field(
        default="shot",
        description="Retrieval unit for segment-based queries: 'shot' for shot-level (detailed), 'scene' for scene-level (broader context). Only used when chunk_type='segment'."
    )

    collection_name: str = Field(
        default=None,
        description="Custom Milvus collection name. If not provided, uses default collection.",
        max_length=256,
    )

    messages: List[ChatMessage] = Field(
        description="The list of chat messages.", max_length=1000000
    )
    model: str = Field(
        description="Model to use for this query.",
        examples=["vila-1.5"],
        max_length=256,
        pattern=FILE_NAME_PATTERN,
    )
    api_type: str = Field(
        description="API used to access model.",
        examples=["internal"],
        max_length=32,
        pattern=r"^[A-Za-z]*$",
        default="",
    )
    response_format: ResponseFormat = Field(
        description="An object specifying the format that the model must output.",
        default=ResponseFormat(type=ResponseType.TEXT),
    )
    stream: bool = Field(
        default=False,
        description=(
            "If set, partial message deltas will be sent, like in ChatGPT."
            " Tokens will be sent as data-only [server-sent events]"
            "(https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#Event_stream_format)"  # noqa: E501
            " as they become available, with the stream terminated by a `data: [DONE]` message."
        ),
    )
    stream_options: StreamOptions | None = Field(
        description="Options for streaming response.",
        default=None,
        json_schema_extra={"nullable": True},
    )
    max_tokens: int = Field(
        default=None,
        examples=[512],
        ge=1,
        le=1024,
        description="The maximum number of tokens to generate in any given call.",
        json_schema_extra={"format": "int32"},
    )
    temperature: float = Field(
        default=None,
        examples=[0.2],
        ge=0,
        le=1,
        description=(
            "The sampling temperature to use for text generation."
            " The higher the temperature value is, the less deterministic the output text will be."
        ),
    )
    top_p: float = Field(
        default=None,
        examples=[1],
        ge=0,
        le=1,
        description=(
            "The top-p sampling mass used for text generation."
            " The top-p value determines the probability mass that is sampled at sampling time."
        ),
    )
    top_k: float = Field(
        default=None,
        examples=[100],
        ge=1,
        le=1000,
        description=(
            "The number of highest probability vocabulary tokens to" " keep for top-k-filtering"
        ),
    )
    seed: int = Field(
        default=None,
        ge=1,
        le=(2**32 - 1),
        examples=[10],
        description="Seed value",
        json_schema_extra={"format": "int64"},
    )

    chunk_duration: int = Field(
        default=0,
        examples=[60],
        description="Chunk videos into `chunkDuration` seconds. Set `0` for no chunking",
        ge=0,
        le=3600,
        json_schema_extra={"format": "int32"},
    )
    chunk_overlap_duration: int = Field(
        default=0,
        examples=[10],
        description="Chunk Overlap Duration Time in Seconds. Set `0` for no overlap",
        ge=0,
        le=3600,
        json_schema_extra={"format": "int32"},
    )
    media_info: MediaInfoOffset = Field(
        default=None,
        description="Provide Start and End times offsets for processing part of a video file.",
    )
    user: str = Field(
        default="",
        examples=["user-123"],
        max_length=256,
        description="A unique identifier for the user",
        pattern=r"^[a-zA-Z0-9-._]*$",
    )


class ChatCompletionResponseMessage(ViaBaseModel):
    """A chat completion message generated by the model."""

    content: str = Field(
        max_length=100000,
        description="The contents of the message. For VLM captions API, this field contains a "
        "combined response with timestamps for each chunk.",
        examples=[
            "Some summary of the video",
            "[00:00 - 01:00] A worker is walking down the aisle.\n\n"
            "[01:00 - 02:00] A man is driving a forklift in the warehouse.",
        ],
        pattern=ANY_CHAR_PATTERN,
        json_schema_extra={"nullable": True},
    )
    role: Literal["assistant"] = Field(description="The role of the author of this message.")


class CompletionResponseChoice(ViaBaseModel):
    """Completion Response Choice."""

    finish_reason: CompletionFinishReason = Field(
        description=(
            "The reason the model stopped generating tokens."
            " This will be `stop` if the model hit a natural stop point or a provided"
            " stop sequence,\n`length` if the maximum number of tokens specified in the"
            " request was reached,\n`content_filter` if content was omitted due to a flag"
            " from our content filters."
        ),
        examples=[CompletionFinishReason.STOP],
    )
    index: int = Field(
        description="The index of the choice in the list of choices.",
        ge=0,
        le=4000000000,
        examples=[1],
        json_schema_extra={"format": "int64"},
    )
    message: ChatCompletionResponseMessage


class CompletionObject(str, Enum):
    """Completion object type."""

    CHAT_COMPLETION = "chat.completion"
    SUMMARIZATION_COMPLETION = "summarization.completion"
    SUMMARIZATION_PROGRESSING = "summarization.progressing"
    VLM_CAPTIONS_COMPLETION = "vlm_captions.completion"
    VLM_CAPTIONS_PROGRESSING = "vlm_captions.progressing"


class CompletionUsage(ViaBaseModel):
    """An optional field that will only be present when you set
    `stream_options: {\"include_usage\": true}` in your request.

    When present, it contains a null value except for the last chunk which contains
    the token usage statistics for the entire request.
    """

    query_processing_time: int = Field(
        description="Summarization Query Processing Time in seconds.",
        ge=0,
        le=1000000,
        examples=[78],
        json_schema_extra={"format": "int32"},
    )
    total_chunks_processed: int = Field(
        description="Total Number of chunks processed.",
        ge=0,
        le=1000000,
        examples=[10],
        json_schema_extra={"format": "int32"},
    )


class CompletionResponse(ViaBaseModel):
    """Represents a summarization/chat completion response."""

    id: UUID = Field(description="Unique ID for the query")
    choices: list[CompletionResponseChoice] = Field(
        description=(
            "A list of chat completion choices. Can be more than one if `n` is greater than 1."
        ),
        max_length=10,
    )
    created: int = Field(
        json_schema_extra={"format": "int64"},
        ge=0,
        le=4000000000,
        examples=[1717405636],
        description=(
            "The Unix timestamp (in seconds) of when the chat completion/summary request"
            " was created."
        ),
    )
    model: str = Field(
        description="The model used for the chat completion/summarization.",
        examples=["vila-1.5"],
        max_length=256,
        pattern=FILE_NAME_PATTERN,
    )
    media_info: MediaInfoOffset = Field(
        description="Part of the file for which this response is applicable."
    )
    object: CompletionObject = Field(
        description=(
            "The object type, which can be `chat.completion` or `summarization.completion`"
            " or `summarization.progressing`."
        ),
        examples=[CompletionObject.SUMMARIZATION_COMPLETION],
    )
    usage: CompletionUsage | None = Field(default=None)


class VlmCaptionResponse(ViaBaseModel):
    """Represents a VLM caption response for a single chunk."""

    start_time: str = Field(
        description="Start time of the chunk in seconds",
        max_length=50,
        pattern=r"^[0-9\.\-TZ]+$",
        examples=["15.5", "2024-05-30T01:41:25.000Z"],
    )
    end_time: str = Field(
        description="End time of the chunk in seconds",
        max_length=50,
        pattern=r"^[0-9\.\-TZ]+$",
        examples=["30.2", "2024-05-30T01:41:35.000Z"],
    )
    content: str = Field(
        description="VLM caption content for this chunk",
        max_length=100000,
        pattern=ANY_CHAR_PATTERN,
    )
    reasoning_description: str = Field(
        description="Reasoning description for the VLM caption (if enable_reasoning is True)",
        max_length=100000,
        pattern=ANY_CHAR_PATTERN,
        default="",
    )


class VlmCaptionsCompletionResponse(ViaBaseModel):
    """Represents a VLM captions response without choices and object fields."""

    id: UUID = Field(description="Unique ID for the query")
    created: int = Field(
        json_schema_extra={"format": "int64"},
        ge=0,
        le=4000000000,
        examples=[1717405636],
        description=(
            "The Unix timestamp (in seconds) of when the VLM captions request" " was created."
        ),
    )
    model: str = Field(
        description="The model used for the VLM captions generation.",
        examples=["vila-1.5"],
        max_length=256,
        pattern=FILE_NAME_PATTERN,
    )
    media_info: MediaInfoOffset = Field(
        description="Part of the file for which this response is applicable."
    )
    usage: CompletionUsage | None = Field(default=None)
    chunk_responses: list[VlmCaptionResponse] = Field(
        description="List of individual chunk responses with timestamps and captions",
        default=[],
        max_length=10000,
    )


# ===================== Models required by /summarize API


# ===================== Models required by /recommended_config API
class RecommendedConfig(ViaBaseModel):
    """Recommended VIA Config."""

    video_length: int = Field(
        default=None,
        examples=[5, 10, 60, 300],
        ge=1,
        le=24 * 60 * 60 * 10000,
        description="The video length in seconds.",
        json_schema_extra={"format": "int32"},
    )
    target_response_time: int = Field(
        default=None,
        examples=[5, 10, 60, 300],
        ge=1,
        le=86400,
        description="The target response time of VIA in seconds.",
        json_schema_extra={"format": "int32"},
    )
    usecase_event_duration: int = Field(
        default=None,
        examples=[5, 10, 60, 300],
        ge=1,
        le=86400,
        description=(
            "The duration of the target event user wants to detect;"
            " example: it will take a box-falling event 3 seconds to happen."
        ),
        json_schema_extra={"format": "int32"},
    )


class RecommendedConfigResponse(ViaBaseModel):
    """Recommended VIA Config Response."""

    chunk_size: int = Field(
        default=None,
        examples=[5, 10, 60, 300],
        ge=0,
        le=86400,
        description="The recommended chunk size in seconds and no chunking is 0",
        json_schema_extra={"format": "int32"},
    )
    text: str = Field(
        description="Recommendation text",
        max_length=5000,
        examples=["Recommendation text"],
        pattern=DESCRIPTION_PATTERN,
    )


# ===================== Models required by /recommended_config API




class VlmParams(ViaBaseModel):
    """VLM parameters configuration."""

    prompt: str = Field(
        max_length=5000,
        description="VLM prompt",
        pattern=ANY_CHAR_PATTERN,
        examples=[
            "Is there person detected in restricted area?",
            "Analyze this video for unauthorized access",
            "Check for suspicious activity in the monitored area",
        ],
    )
    system_prompt: str = Field(
        default="You are a helpful assistant. Answer the user's question.",
        min_length=1,
        max_length=5000,
        description="System prompt for the VLM. To enable reasoning with Cosmos Reason1, add <think></think> and <answer></answer> tags to the system prompt.",  # noqa: E501
        pattern=ANY_CHAR_PATTERN,
        examples=[
            (
                "You are a helpful assistant. Answer the user's question."
                " (Caption only or Caption with boolean answer to use with do_verification=True)"
            ),
            (
                "You are a helpful assistant. Answer the user's question."
                " Answer in yes or no only. (Boolean only, use with do_verification=True)"
            ),
            (
                "You are a helpful assistant. Answer the user's question."
                " Answer in yes or no only. Answer the question in the following format:"
                " <think>\nyour reasoning\n</think>\n\n<answer>\nyour answer\n</answer>.\n"
            ),
        ],
    )

    response_format: Optional[ResponseFormat] = Field(
        description="Response format configuration",
        default=None,
        examples=[{"type": "json_object"}, {"type": "text"}],
    )
    max_tokens: int = Field(
        default=None,
        examples=[512],
        ge=1,
        le=1024,
        description="The maximum number of tokens to generate in any given call.",
        json_schema_extra={"format": "int32"},
    )
    temperature: float = Field(
        default=None,
        examples=[0.2],
        ge=0,
        le=1,
        description=(
            "The sampling temperature to use for text generation."
            " The higher the temperature value is, the less deterministic the output text will be."
        ),
    )
    top_p: float = Field(
        default=None,
        examples=[1],
        ge=0,
        le=1,
        description=(
            "The top-p sampling mass used for text generation."
            " The top-p value determines the probability mass that is sampled at sampling time."
        ),
    )
    top_k: float = Field(
        default=None,
        examples=[100],
        ge=1,
        le=1000,
        description=(
            "The number of highest probability vocabulary tokens to" " keep for top-k-filtering"
        ),
    )
    seed: int = Field(
        default=None,
        ge=1,
        le=(2**32 - 1),
        examples=[10],
        description="Seed value",
        json_schema_extra={"format": "int64"},
    )


class VssParams(ViaBaseModel):
    """VSS parameters configuration."""

    chunk_duration: int = Field(
        default=0,
        examples=[60],
        description="Chunk videos into `chunkDuration` seconds. Set `0` for no chunking",
        ge=0,
        le=3600,
        json_schema_extra={"format": "int32"},
    )
    chunk_overlap_duration: int = Field(
        default=0,
        examples=[10],
        description="Chunk Overlap Duration Time in Seconds. Set `0` for no overlap",
        ge=0,
        le=3600,
        json_schema_extra={"format": "int32"},
    )
    num_frames_per_chunk: int = Field(
        default=0,
        examples=[10],
        description="Number of frames per chunk to use for the VLM",
        ge=0,
        le=256,
        json_schema_extra={"format": "int32"},
    )
    enable_reasoning: bool = Field(
        description="Enable reasoning for VLM",
        default=False,
        examples=[True, False],
    )
    do_verification: bool = Field(
        description="Enable verification for VLM",
        default=False,
        examples=[True, False],
    )
    vlm_params: VlmParams = Field(description="VLM parameters")
    debug: bool = Field(
        description="Enable debug output in response", default=False, examples=[True, False]
    )



class VlmQuery(ViaBaseModel):
    """VLM Captions Query Request Fields."""

    id: Union[UUID, List[UUID]] = Field(
        description="Unique ID or list of IDs of the file(s) to generate VLM captions for",
        examples=[
            "123e4567-e89b-12d3-a456-426614174000",
            ["123e4567-e89b-12d3-a456-426614174000", "987fcdeb-51a2-43d1-b567-537725285111"],
        ],
        json_schema_extra={
            "anyOf": [
                {"type": "string", "format": "uuid"},
                {"type": "array", "items": {"type": "string", "format": "uuid"}, "maxItems": 50},
            ]
        },
    )

    @field_validator("id", mode="after")
    def check_ids(cls, v, info):
        if isinstance(v, list) and len(v) > 50:
            raise ValueError("List of ids must not exceed 50 items")
        return v

    @property
    def id_list(self) -> List[UUID]:
        return [self.id] if isinstance(self.id, UUID) else self.id

    @property
    def get_query_json(self: ViaBaseModel) -> dict:
        return self.model_dump(mode="json")

    system_prompt: str = Field(
        default=os.environ.get("VLM_SYSTEM_PROMPT", ""),
        max_length=5000,
        description="System prompt for the VLM. To enable reasoning with Cosmos Reason1, add <think></think> and <answer></answer> tags to the system prompt.",  # noqa: E501
        pattern=ANY_CHAR_PATTERN,
        examples=[
            "You are a helpful assistant. Answer the user's question.",
        ],
    )

    prompt: str = Field(
        default="",
        max_length=5000,
        description="Prompt for VLM captions generation",
        pattern=ANY_CHAR_PATTERN,
        examples=["Write a concise and clear dense caption for the provided warehouse video"],
    )
    model: str = Field(
        description="Model to use for this query.",
        examples=["vila-1.5", "nvila", "llava-1.5"],
        max_length=256,
        pattern=FILE_NAME_PATTERN,
    )
    api_type: str = Field(
        description="API used to access model.",
        examples=["internal"],
        max_length=32,
        pattern=r"^[A-Za-z]*$",
        default="",
    )
    response_format: ResponseFormat = Field(
        description="An object specifying the format that the model must output.",
        default=ResponseFormat(type=ResponseType.TEXT),
        examples=[
            ResponseFormat(type=ResponseType.TEXT),
            ResponseFormat(type=ResponseType.JSON_OBJECT),
        ],
    )
    stream: bool = Field(
        default=False,
        description=(
            "If set, partial message deltas will be sent, like in ChatGPT."
            " Tokens will be sent as data-only [server-sent events]"
            "(https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#Event_stream_format)"  # noqa: E501
            " as they become available, with the stream terminated by a `data: [DONE]` message."
        ),
        examples=[True, False],
    )
    stream_options: StreamOptions | None = Field(
        description="Options for streaming response.",
        default=None,
        json_schema_extra={"nullable": True},
        examples=[{"include_usage": True}, {"include_usage": False}],
    )
    max_tokens: int = Field(
        default=None,
        examples=[512],
        ge=1,
        le=1024,
        description="The maximum number of tokens to generate in any given call.",
        json_schema_extra={"format": "int32"},
    )
    temperature: float = Field(
        default=None,
        examples=[0.2],
        ge=0,
        le=1,
        description=(
            "The sampling temperature to use for text generation."
            " The higher the temperature value is, the less deterministic the output text will be."
        ),
    )
    top_p: float = Field(
        default=None,
        examples=[1],
        ge=0,
        le=1,
        description=(
            "The top-p sampling mass used for text generation."
            " The top-p value determines the probability mass that is sampled at sampling time."
        ),
    )
    top_k: float = Field(
        default=None,
        examples=[100],
        ge=1,
        le=1000,
        description=(
            "The number of highest probability vocabulary tokens to" " keep for top-k-filtering"
        ),
    )
    seed: int = Field(
        default=None,
        ge=1,
        le=(2**32 - 1),
        examples=[10],
        description="Seed value",
        json_schema_extra={"format": "int64"},
    )

    chunk_duration: int = Field(
        default=0,
        examples=[60],
        description="Chunk videos into `chunkDuration` seconds. Set `0` for no chunking",
        ge=0,
        le=3600,
        json_schema_extra={"format": "int32"},
    )
    chunk_overlap_duration: int = Field(
        default=0,
        examples=[10],
        description="Chunk Overlap Duration Time in Seconds. Set `0` for no overlap",
        ge=0,
        le=3600,
        json_schema_extra={"format": "int32"},
    )
    media_info: MediaInfoOffset = Field(
        default=None,
        description="Provide Start and End times offsets for processing part of a video file.",
    )

    user: str = Field(
        default="",
        examples=["user-123"],
        max_length=256,
        description="A unique identifier for the user",
        pattern=r"^[a-zA-Z0-9-._]*$",
    )

    num_frames_per_chunk: int = Field(
        default=0,
        examples=[10],
        description="Number of frames per chunk to use for the VLM",
        ge=0,
        le=256,
        json_schema_extra={"format": "int32"},
    )
    vlm_input_width: int = Field(
        default=0,
        examples=[256],
        description="VLM Input Width",
        ge=0,
        le=4096,
        json_schema_extra={"format": "int32"},
    )
    vlm_input_height: int = Field(
        default=0,
        examples=[256],
        description="VLM Input Height",
        ge=0,
        le=4096,
        json_schema_extra={"format": "int32"},
    )

    enable_reasoning: bool = Field(
        default=False,
        description="Enable reasoning for VLM captions generation",
        examples=[True, False],
    )
