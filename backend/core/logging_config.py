"""
core/logging_config.py
Structured JSON logging for production, human-readable for development.
Call setup_logging() once at application startup (in main.py lifespan).
"""
import logging
import logging.config
import sys
from typing import Any
from core.config import settings


class _JSONFormatter(logging.Formatter):
    """
    Emit log records as single-line JSON objects for log aggregators
    (e.g. Loki, CloudWatch, Datadog).
    """
    def format(self, record: logging.LogRecord) -> str:
        import json
        from datetime import datetime, timezone

        payload: dict[str, Any] = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
        }
        if record.exc_info:
            payload["exc"] = self.formatException(record.exc_info)
        if hasattr(record, "request_id"):
            payload["request_id"] = record.request_id
        return json.dumps(payload, ensure_ascii=False)


_DEV_FORMAT = (
    "%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d | %(message)s"
)
_DEV_DATE = "%Y-%m-%d %H:%M:%S"


def setup_logging() -> None:
    """
    Configure application-wide logging.
    - Production  → JSON to stdout (level INFO)
    - Development → colour-friendly text to stdout (level DEBUG)
    """
    level = logging.INFO if settings.is_production else logging.DEBUG

    handler = logging.StreamHandler(sys.stdout)

    if settings.is_production:
        handler.setFormatter(_JSONFormatter())
    else:
        handler.setFormatter(logging.Formatter(_DEV_FORMAT, datefmt=_DEV_DATE))

    # Root logger
    root = logging.getLogger()
    root.setLevel(level)
    root.handlers.clear()
    root.addHandler(handler)

    # Quieten noisy third-party loggers
    for noisy in ("uvicorn.access", "motor", "pymongo", "httpx", "httpcore"):
        logging.getLogger(noisy).setLevel(logging.WARNING)

    logging.getLogger("uvicorn.error").setLevel(logging.INFO)
    logging.getLogger("fastapi").setLevel(logging.INFO)

    logging.getLogger(__name__).info(
        "Logging configured | ENV=%s | level=%s",
        settings.ENV,
        logging.getLevelName(level),
    )
