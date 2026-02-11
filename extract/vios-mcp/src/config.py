# SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: MIT
#
# Permission is hereby granted, free of charge, to any person obtaining a
# copy of this software and associated documentation files (the "Software"),
# to deal in the Software without restriction, including without limitation
# the rights to use, copy, modify, merge, publish, distribute, sublicense,
# and/or sell copies of the Software, and to permit persons to whom the
# Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
# THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
# FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
# DEALINGS IN THE SOFTWARE

"""Configuration settings for the MCP Gateway."""

from pydantic import Field
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings."""
    
    # C++ Application API Configuration
    cpp_api_base_url: str = Field(
        default="http://localhost:8080",
        description="Base URL for the C++ application API"
    )
    cpp_api_timeout: int = Field(
        default=30,
        description="Timeout for C++ API calls in seconds"
    )
    
    # MCP Server Configuration
    server_name: str = Field(
        default="cpp-gateway",
        description="Name of the MCP server"
    )
    server_version: str = Field(
        default="1.0.0",
        description="Version of the MCP server"
    )
    server_host: str = Field(
        default="0.0.0.0",
        description="Host address for the MCP server"
    )
    server_port: int = Field(
        default=8000,
        description="Port for the MCP server"
    )

    allow_all_hosts: bool = Field(
        default=True,
        description="Disable MCP DNS rebinding/Host header protection (INSECURE)"
    )
    
    # Logging Configuration
    log_level: str = Field(
        default="INFO",
        description="Logging level"
    )
    enable_jsonrpc_logging: bool = Field(
        default=False,
        description="Enable detailed JSON RPC message logging"
    )
    
    # API Behavior Configuration
    sensor_list_force_refresh: bool = Field(
        default=True,
        description="Always add forceRefresh=true to sensor list API calls"
    )
    video_url_disable_audio: bool = Field(
        default=True,
        description="Always add disableAudio=true to video URL API calls"
    )
    
    class Config:
        env_file = ".env"
        env_prefix = "MCP_GATEWAY_"


# Global settings instance
settings = Settings() 