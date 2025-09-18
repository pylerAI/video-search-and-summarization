#!/usr/bin/env python3
"""
Model setup utilities for downloading NGC models and building TRT engines.
This module handles the heavy lifting of model preparation so the server can focus on inference.
"""

import os
import json
import shutil
import tempfile
import subprocess
from threading import Thread
from typing import Optional, Tuple
from loguru import logger

from ngc_model_downloader import download_model

# Location to download and cache NGC models
NGC_MODEL_CACHE = os.environ.get("NGC_MODEL_CACHE", "") or os.path.expanduser(
    "/tmp/via-ngc-model-cache"
)

FORCE_TRT = True


class VlmModelType:
    VILA_15 = "vila-1.5"
    NVILA = "nvila"


class TrtLlmMode:
    FP16 = "fp16"
    FP8 = "fp8"
    INT8 = "int8"
    INT4 = "int4"
    INT4_AWQ = "int4_awq"


def download_ngc_model(model_path: str, model_type: str) -> str:
    """
    Download model from NGC if path starts with 'ngc:'
    
    Args:
        model_path: NGC model path (e.g., 'ngc:nvidia/vila-1.5:latest')
        model_type: Type of model being downloaded
        
    Returns:
        Local path to downloaded model
    """
    if not model_path.startswith("ngc:"):
        return model_path
        
    logger.info(f"Downloading NGC model: {model_path}")
    
    # Workaround for some asyncio issue - use thread
    def download_thread_func(ngc_model_path, download_prefix, model_path_):
        try:
            downloaded_path = download_model(ngc_model_path, download_prefix, model_type)
            model_path_[0] = downloaded_path
        except Exception as ex:
            model_path_[1] = ex

    model_path_result = ["", ""]
    download_thread = Thread(
        target=download_thread_func,
        args=(model_path[4:], NGC_MODEL_CACHE, model_path_result),
    )
    download_thread.start()
    download_thread.join()
    
    if model_path_result[1]:
        raise model_path_result[1]
        
    logger.info(f"NGC model downloaded to: {model_path_result[0]}")
    return model_path_result[0]


def setup_trt_engine(
    model_path: str,
    model_type: str,
    trt_engine_dir: Optional[str] = None,
    trt_llm_mode: str = "fp8",
    vlm_batch_size: int = 1,
    force_rebuild: bool = False
) -> Tuple[str, bool]:
    """
    Setup TRT engine for the model. Downloads prebuilt engine if available, 
    otherwise builds from scratch.
    
    Args:
        model_path: Path to the model
        model_type: Type of VLM model
        trt_engine_dir: Directory for TRT engines (auto-inferred if None)
        trt_llm_mode: TRT precision mode (fp16, int8, etc.)
        vlm_batch_size: Maximum batch size for the engine
        force_rebuild: Force rebuild even if engine exists
        
    Returns:
        Tuple of (engine_directory, use_trt_flag)
    """
    if not FORCE_TRT or model_type != VlmModelType.VILA_15:
        return "", False
        
    # Infer the TRT engine directory if not specified
    if not trt_engine_dir:
        trt_engine_dir = os.path.join(model_path, f"trt-engines/{trt_llm_mode}/0-gpu")
        
    config_file = os.path.join(trt_engine_dir, "config.json")
    rank0_file = os.path.join(trt_engine_dir, "rank0.engine")
    visual_engines_dir = os.path.join(trt_engine_dir, "visual_engines")
    visual_encoder_file = os.path.join(visual_engines_dir, "visual_encoder.engine")

    # Check if engine already exists and is valid
    build_engine = force_rebuild or not all([
        os.path.isfile(config_file),
        os.path.isfile(rank0_file), 
        os.path.isfile(visual_encoder_file)
    ])
    
    if not build_engine:
        # Validate existing engine configuration
        try:
            with open(config_file) as f:
                config = json.load(f)
                existing_batch_size = config["build_config"]["max_batch_size"]
                lora_enabled = config["build_config"]["plugin_config"]["lora_plugin"]
                
                if existing_batch_size < vlm_batch_size:
                    logger.info(
                        f"Existing engine max batch size ({existing_batch_size}) < "
                        f"requested ({vlm_batch_size}). Rebuilding..."
                    )
                    build_engine = True
                    
                if os.environ.get("VILA_LORA_PATH", "") and not lora_enabled:
                    logger.info("LoRA configured but existing engine lacks LoRA support. Rebuilding...")
                    build_engine = True
                    
        except (FileNotFoundError, json.JSONDecodeError, KeyError) as e:
            logger.warning(f"Invalid engine config: {e}. Rebuilding...")
            build_engine = True

    if build_engine:
        logger.info("Building TRT engine...")
        
        # Try to download prebuilt engine from NGC first
        vila_ngc_engine = os.environ.get("VILA_ENGINE_NGC_RESOURCE", "")
        if vila_ngc_engine and not force_rebuild:
            success = _download_prebuilt_engine(vila_ngc_engine, trt_engine_dir)
            if success:
                build_engine = False
                
        # Build engine from scratch if needed
        if build_engine:
            _build_engine_from_scratch(model_path, trt_engine_dir, trt_llm_mode, vlm_batch_size)
            
        logger.info("TRT engine setup complete")
        
    return trt_engine_dir, True


def _download_prebuilt_engine(vila_ngc_engine: str, trt_engine_dir: str) -> bool:
    """Download prebuilt engine from NGC"""
    try:
        logger.info(f"Downloading prebuilt TRT engine from NGC: {vila_ngc_engine}")
        
        with tempfile.TemporaryDirectory() as temp_dir:
            # Download the engine
            def download_thread_func(ngc_path, download_prefix, result):
                try:
                    result[0] = download_model(ngc_path, download_prefix)
                except Exception as ex:
                    result[1] = ex

            result = ["", ""]
            download_thread = Thread(
                target=download_thread_func,
                args=(vila_ngc_engine, temp_dir, result),
            )
            download_thread.start()
            download_thread.join()
            
            if result[1]:
                raise result[1]
                
            downloaded_path = result[0]
            
            # Create target directory
            os.makedirs(trt_engine_dir, exist_ok=True)
            
            # Move engine files
            files_to_move = [
                ("config.json", "config.json"),
                ("rank0.engine", "rank0.engine"), 
                ("visual_engines", "visual_engines")
            ]
            
            for src_name, dst_name in files_to_move:
                src_path = os.path.join(downloaded_path, src_name)
                dst_path = os.path.join(trt_engine_dir, dst_name)
                
                if os.path.exists(src_path):
                    if os.path.exists(dst_path):
                        if os.path.isdir(dst_path):
                            shutil.rmtree(dst_path)
                        else:
                            os.remove(dst_path)
                    shutil.move(src_path, dst_path)
                    logger.debug(f"Moved {src_name} to {dst_path}")
                    
            logger.info("Successfully downloaded prebuilt TRT engine from NGC")
            return True
            
    except Exception as e:
        logger.warning(f"Failed to download prebuilt engine: {e}")
        return False


def _build_engine_from_scratch(model_path: str, trt_engine_dir: str, trt_llm_mode: str, vlm_batch_size: int):
    """Build TRT engine from scratch using build_engine.sh"""
    logger.info("Building TRT engine from scratch...")
    
    # Find the build script
    base_path = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    build_script = os.path.join(base_path, "trt_helper/build_engine.sh")
    
    if not os.path.exists(build_script):
        raise FileNotFoundError(f"Build script not found: {build_script}")
        
    # Run the build script
    cmd = [
        "bash",
        build_script,
        model_path,
        str(vlm_batch_size),
        trt_llm_mode,
        trt_engine_dir,
    ]
    
    logger.info(f"Running: {' '.join(cmd)}")
    # result = subprocess.run(cmd, capture_output=True, text=True)
    
    # if result.returncode != 0:
    #     logger.error(f"Engine build failed with return code {result.returncode}")
    #     logger.error(f"STDOUT: {result.stdout}")
    #     logger.error(f"STDERR: {result.stderr}")
    #     raise RuntimeError("Failed to generate TRT-LLM engine")
    result = subprocess.run(cmd)
    if result.returncode:
        raise Exception("Failed to generate TRT-LLM engine")
       
    logger.info("Successfully built TRT engine from scratch")


def prepare_model(
    model_path: str,
    model_type: str = VlmModelType.VILA_15,
    trt_engine_dir: Optional[str] = None,
    trt_llm_mode: str = TrtLlmMode.FP16,
    vlm_batch_size: int = 1,
    force_rebuild: bool = False
) -> Tuple[str, str, bool]:
    """
    Complete model preparation workflow: download from NGC if needed, setup TRT engines.
    
    Args:
        model_path: Model path (can be NGC path starting with 'ngc:')
        model_type: Type of VLM model
        trt_engine_dir: Directory for TRT engines (auto-inferred if None)
        trt_llm_mode: TRT precision mode
        vlm_batch_size: Maximum batch size
        force_rebuild: Force rebuild of engines
        
    Returns:
        Tuple of (final_model_path, trt_engine_dir, use_trt)
    """
    # Step 1: Download model from NGC if needed
    final_model_path = download_ngc_model(model_path, model_type)
    
    # Step 2: Setup TRT engines
    final_trt_engine_dir, use_trt = setup_trt_engine(
        final_model_path, 
        model_type,
        trt_engine_dir,
        trt_llm_mode,
        vlm_batch_size,
        force_rebuild
    )
    
    return final_model_path, final_trt_engine_dir, use_trt
