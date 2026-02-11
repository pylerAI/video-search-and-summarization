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

"""Main entry point for the MCP Gateway server."""

import argparse
import sys
from .server import run_server, run_http_server
from .config import settings


def main():
    """Main function to start the MCP Gateway server."""
    parser = argparse.ArgumentParser(
        description="MCP Gateway server for connecting to C++ applications via REST API"
    )
    parser.add_argument(
        "--transport",
        choices=["stdio", "http"],
        default="stdio",
        help="Transport protocol to use (default: stdio)"
    )
    parser.add_argument(
        "--host",
        default=settings.server_host,
        help=f"Host address for HTTP transport (default: {settings.server_host})"
    )
    parser.add_argument(
        "--port",
        type=int,
        default=settings.server_port,
        help=f"Port for HTTP transport (default: {settings.server_port})"
    )
    
    args = parser.parse_args()
    
    try:
        if args.transport == "http":
            print(f"Starting MCP Gateway for HTTP integration on {args.host}:{args.port}...")
            print(f"MCP endpoint will be available at: http://{args.host}:{args.port}/mcp")
            run_http_server(host=args.host, port=args.port)
        else:
            print("Starting MCP Gateway for Cursor integration...")
            run_server()
            
    except KeyboardInterrupt:
        print("\nShutting down MCP Gateway server...")
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main() 