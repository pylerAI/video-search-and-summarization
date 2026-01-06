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
"""VIA Asset Management Module."""

import asyncio
import json
import os
import shutil
import time
import uuid
from threading import Thread
from typing import Callable

import aiofiles
from via_exception import ViaException
from via_logger import TimeMeasure, logger

AGE_OUT_THRESHOLD = 0.9  # Start aging out when usage is within this threshold of the max
AGE_OUT_RUN_INTERVAL_SEC = 300


class Asset:
    """VIA Asset."""

    def __init__(
        self,
        asset_id: str,
        path: str,
        purpose: str,
        media_type: str,
        asset_dir: str,
        fileName="",
        video_fps=None,
    ) -> None:
        """Asset constructor.

        Args:
            asset_id: Unique ID for the asset
            path: Path to the file.
            purpose: Purpose of the file.
            media_type: Media Type (video/image) of the file.
            asset_dir: Directory where the asset information and other files related
                       to the asset are stored.
            fileName (optional): Name of the file. Defaults to "".
            video_fps (optional): Cached video FPS. Defaults to None.
        """
        self._asset_id = asset_id
        self._filename = fileName
        self._purpose = purpose
        self._media_type = media_type
        self._path = path
        self._use_count = 0
        self._asset_dir = asset_dir
        self._video_fps = video_fps

    @classmethod
    def fromdir(cls, asset_dir):
        with open(os.path.join(asset_dir, "info.json")) as f:
            info = json.load(f)

            return Asset(
                asset_id=info["assetId"],
                path=info.get("path", ""),
                fileName=info.get("fileName", ""),
                purpose=info.get("purpose", "vision"),
                media_type=info.get("media_type", "video"),
                asset_dir=asset_dir,
                video_fps=info.get("video_fps", None),
            )

    @property
    def asset_id(self):
        """Unique ID of the asset"""
        return self._asset_id

    @property
    def filename(self):
        """Name of the file"""
        return self._filename

    @property
    def purpose(self):
        """Purpose of the file"""
        return self._purpose

    @property
    def media_type(self):
        """Media type of the file"""
        return self._media_type

    @property
    def path(self):
        """Path to the file"""
        return self._path

    @property
    def asset_dir(self):
        """Storage directory for the asset"""
        return self._asset_dir

    def lock(self):
        """Lock the asset. Asset cannot be deleted if in use."""
        self._use_count += 1

    def unlock(self):
        """Unock the asset"""
        self._use_count -= 1

    @property
    def use_count(self):
        """Reference count for the file"""
        return self._use_count

    @property
    def video_fps(self):
        """Cached video FPS."""
        return self._video_fps

    def update_video_fps(self, fps: float):
        """Update the cached video FPS and save to info.json.

        Args:
            fps: Video frames per second
        """
        self._video_fps = fps

        # Update the info.json file
        info_path = os.path.join(self._asset_dir, "info.json")
        if os.path.exists(info_path):
            with open(info_path, "r") as f:
                info = json.load(f)

            info["video_fps"] = fps

            with open(info_path, "w") as f:
                json.dump(info, f)


class AssetManager:
    """VIA Asset Manager. Responsible for managing the assets (files)
    added to the backend server."""

    def __init__(
        self,
        asset_dir: str,
        max_storage_usage_gb=None,
        asset_removal_callback: Callable[[Asset], bool] = None,
    ) -> None:
        """Default constructor

        Args:
            asset_dir: Path to the directory to store assets in
        """
        self._asset_dir = asset_dir
        self._max_storage_usage_gb = max_storage_usage_gb
        self._asset_removal_callback = asset_removal_callback

        try:
            os.makedirs(self._asset_dir, exist_ok=True)
        except Exception:
            raise ViaException(f"Could not create assets directory '{asset_dir}'")

        # Get existing assets and populate the asset map.
        asset_ids = self._get_existing_asset_ids()
        self._asset_map: dict[str, Asset] = {
            asset_id: Asset.fromdir(os.path.join(asset_dir, asset_id)) for asset_id in asset_ids
        }

        self._aged_out_assets = []
        if self._max_storage_usage_gb:
            self._age_out_thread = Thread(target=self._age_out_thread_func, daemon=True)
            self._age_out_thread.start()

    async def save_file(
        self, 
        file, 
        asset_id: str,  # 1. asset_id를 인자로 받음
        purpose: str, 
        media_type: str, # video, image, segment, metadata 등
    ):
        """Save the uploaded file into a specific asset directory.
        If the file for the same media_type exists, it will be overwritten.
        """
        
        # 자산 디렉토리 경로 설정 및 생성 (이미 있으면 통과)
        asset_dir = os.path.join(self._asset_dir, asset_id)
        os.makedirs(asset_dir, exist_ok=True)

        EXTENSIONS = {
            "video": ".mp4",
            "image": ".jpg",
            "segment": ".json",
            "metadata": ".json"
        }

        target_file_path = os.path.join(asset_dir, f"{media_type}{EXTENSIONS[media_type]}")

        current_storage_size = await self._get_storage_usage()
        written_bytes = 0

        # 2. 파일 쓰기 (기존 파일이 있으면 'wb' 모드에 의해 덮어씌워짐)
        try:
            async with aiofiles.open(target_file_path, "wb") as f:
                while chunk := await file.read(1024 * 1024 * 10):
                    chunk_len = len(chunk)
                    
                    # 용량 체크 로직 (기존 로직 유지)
                    if self._max_storage_usage_gb:
                        projected_size_gb = current_storage_size + (written_bytes + chunk_len) / (1024.0**3)
                        
                        if projected_size_gb > AGE_OUT_THRESHOLD * self._max_storage_usage_gb:
                            await self._age_out_assets()
                            current_storage_size = await self._get_storage_usage()

                        if projected_size_gb > self._max_storage_usage_gb:
                            # 용량 초과 시 방금 쓰던 파일만 삭제 시도
                            await f.close()
                            if os.path.exists(target_file_path):
                                os.remove(target_file_path)
                            raise ViaException("Storage Full", "ServerBusy", 503)

                    await f.write(chunk)
                    written_bytes += chunk_len

            # 3. info.json 업데이트 (기존 데이터가 있으면 로드 후 병합)
            info_path = os.path.join(asset_dir, "info.json")
            asset_info = {}
            
            if os.path.exists(info_path):
                async with aiofiles.open(info_path, "r") as f:
                    content = await f.read()
                    asset_info = json.loads(content)

            # 새로운 정보 업데이트 (파일 경로 등을 media_type별로 관리하도록 구조 개선 가능)
            # 여기서는 요청받은 필드들을 최신화합니다.
            asset_info.update({
                "assetId": asset_id,
                "path": target_file_path,
                f"{media_type}_path": target_file_path, # 타입별 경로 저장
                "last_updated_media": media_type,
                "purpose": purpose,
                "asset_id": asset_id,
            })

            async with aiofiles.open(info_path, "w") as f:
                await f.write(json.dumps(asset_info, indent=4))

            # 4. 자산 맵 업데이트
            self._asset_map[asset_id] = Asset.fromdir(asset_dir)
            
            logger.info(f"[AssetManager] Saved {media_type} - asset-id: {asset_id}")
            return asset_id

        except Exception as e:
            logger.error(f"Error saving file for asset {asset_id}: {e}")
            if isinstance(e, ViaException):
                raise e
            raise ViaException("Could not save asset file")

    def add_file(self, file_path, purpose, media_type, reuse_asset=False):
        """Add a file already on the file system as a path.

        Args:
            file_path: Path of the file to add.
            purpose: Purpose of the file.
            media_type: Media type (video/image) of the file.
            reuse_asset: Whether to reuse an existing asset.
        Returns:
            A unique id for the asset.
        """
        if not os.path.isfile(file_path):
            raise ViaException(f"{file_path} is not a valid file", "InvalidParameters", 400)

        if reuse_asset:
            asset = self._get_asset_id_for_file(file_path)
            if asset:
                logger.info(f"Reusing asset id {asset.asset_id} for {file_path}")
                return asset.asset_id

        # Generate a unique id for the asset.
        asset_id = str(uuid.uuid4())
        while asset_id in self._asset_map:
            asset_id = str(uuid.uuid4())
        asset_dir = os.path.join(self._asset_dir, asset_id)

        try:
            os.makedirs(asset_dir)
        except Exception:
            raise ViaException("Could not create directory for asset")

        # Save asset info as json
        with open(os.path.join(asset_dir, "info.json"), "w") as f:
            json.dump(
                {
                    "assetId": asset_id,
                    "path": file_path,
                    "fileName": os.path.basename(file_path),
                    "purpose": purpose,
                    "media_type": media_type,
                    "video_fps": None,
                },
                f,
            )

        # add an entry in the asset map
        self._asset_map[asset_id] = Asset.fromdir(asset_dir)
        logger.info(
            f"[AssetManager] Added file from path - asset-id: {asset_id} original path: {file_path}"
        )
        return asset_id

    def cleanup_asset(self, asset_id: str):
        """Remove the asset and associated storage directory

        Raises an exception if the asset is in use.

        Args:
            asset_id: ID of the asset to remove
        """
        if asset_id in self._aged_out_assets:
            raise ViaException(f"{asset_id} already deleted", "BadParameter", 400)

        if asset_id not in self._asset_map:
            raise ViaException(f"No such resource {asset_id}", "BadParameter", 400)

        # Do not allow asset to be removed if it is in use.
        if self._asset_map[asset_id].use_count > 0:
            raise ViaException(f"Resource {asset_id} is currently being used", "ResourceInUse", 409)

        asset_dir = os.path.join(self._asset_dir, asset_id)
        try:
            shutil.rmtree(asset_dir)
        except Exception:
            pass
        self._asset_map.pop(asset_id)
        logger.info(f"Removed asset {asset_id} and cleaned up associated resources")

    def _get_existing_asset_ids(self):
        entries = os.listdir(self._asset_dir)
        return [
            entry
            for entry in entries
            if os.path.isdir(os.path.join(self._asset_dir, entry))
            and os.path.isfile(os.path.join(self._asset_dir, entry, "info.json"))
        ]

    def _get_asset_id_for_file(self, filepath: str) -> Asset:
        """
        Returns the Asset object that matches the given filename.

        Args:
            filename (str): The filename to search for in the asset map.

        Returns:
            Asset: The Asset object that matches the filename, or None if not found.
        """
        for asset in self._asset_map.values():
            if asset.path == filepath:
                return asset
        return None

    def list_assets(self):
        """Get a list of all assets"""
        return list(self._asset_map.values())

    def get_asset(self, asset_id: str):
        """Get asset information.

        Args:
            asset_id: Unique id of the asset.

        Returns:
            Information of the asset.
        """
        if asset_id in self._aged_out_assets:
            raise ViaException(
                f"{asset_id} already deleted because of age out policy", "BadParameter", 400
            )

        if asset_id not in self._asset_map:
            raise ViaException(f"No such resource {asset_id}", "BadParameter", 400)
        return self._asset_map[asset_id]

    async def _get_storage_usage(self):
        """Get the current storage usage of the assets directory in GB."""
        proc = await asyncio.subprocess.create_subprocess_exec(
            "du", "-s", "-b", self._asset_dir, stdout=asyncio.subprocess.PIPE
        )
        await proc.wait()
        output = await proc.stdout.read()
        return int(output.split()[0].decode("utf-8")) / (1024.0**3)

    async def _is_storage_above_threshold(self):
        return (
            bool(self._max_storage_usage_gb)
            and (await self._get_storage_usage()) > self._max_storage_usage_gb * AGE_OUT_THRESHOLD
        )

    async def _age_out_assets(self):
        """Age out old assets to free up storage space."""
        if not self._max_storage_usage_gb:
            return

        logger.debug(
            "Asset storage current size: %.2f GB, Threshold: %.2f GB, Max size: %.2f GB",
            await self._get_storage_usage(),
            self._max_storage_usage_gb * AGE_OUT_THRESHOLD,
            self._max_storage_usage_gb,
        )

        if not (await self._is_storage_above_threshold()):
            return

        logger.info(
            "Asset storage size above threshold. Current size: %.2f GB,"
            " Threshold: %.2f GB, Max size: %.2f GB",
            await self._get_storage_usage(),
            self._max_storage_usage_gb * AGE_OUT_THRESHOLD,
            self._max_storage_usage_gb,
        )

        # Get a list of all assets in the assets directory
        asset_ids = self._get_existing_asset_ids()

        # Sort the asset directories by their last modification time
        mtimes = await asyncio.gather(
            *[
                aiofiles.os.path.getmtime(os.path.join(self._asset_dir, asset_id))
                for asset_id in asset_ids
            ]
        )
        asset_ids = [d for _, d in sorted(zip(mtimes, asset_ids))]

        loop = asyncio.get_event_loop()
        # Age out the oldest asset directories until the storage usage is below the threshold
        while await self._is_storage_above_threshold() and asset_ids:
            oldest_asset_dir = asset_ids.pop(0)
            oldest_asset = self.get_asset(oldest_asset_dir)

            if oldest_asset.use_count:
                continue

            # Remove the oldest asset directory
            size_before_removal = await self._get_storage_usage()
            try:
                if self._asset_removal_callback and not (
                    await loop.run_in_executor(None, self._asset_removal_callback, oldest_asset)
                ):
                    continue
                await loop.run_in_executor(None, self.cleanup_asset, oldest_asset_dir)
                self._aged_out_assets.append(oldest_asset_dir)
            except Exception:
                continue
            logger.info(
                "Removed asset %s due to age out policy. Asset storage size before removal"
                " = %.2f GB. After removal = %.2f GB. Max asset storage size = %.2f GB",
                oldest_asset_dir,
                size_before_removal,
                await self._get_storage_usage(),
                self._max_storage_usage_gb,
            )

        if await self._is_storage_above_threshold():
            logger.warning(
                "Asset storage close to limit. Current size = %.2f GB. Max size = %.2f GB",
                await self._get_storage_usage(),
                self._max_storage_usage_gb,
            )

    def _age_out_thread_func(self):
        logger.info(
            "Started asset storage size monitoring. Current size = %.2f GB. Max size = %.2f GB",
            asyncio.run(self._get_storage_usage()),
            self._max_storage_usage_gb,
        )
        while True:
            with TimeMeasure("Age out assets"):
                asyncio.run(self._age_out_assets())
            time.sleep(AGE_OUT_RUN_INTERVAL_SEC)
