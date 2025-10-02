import os
from loguru import logger

log_level = os.environ.get("VSS_LOG_LEVEL", "INFO").upper()
logger.add(
    "/tmp/via-logs/external_vila.log",
    level=log_level,
    rotation="100 MB",
    retention="10 days",
    format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level} | {name}:{function}:{line} - {message}",
    backtrace=True,
    diagnose=True
)

logger.info(f"🔍 External VILA logging enabled: /tmp/via-logs/external_vila.log (level: {log_level})")
