"""Failure isolation boundary.

Non-negotiable: exceptions raised anywhere in the Aegis pipeline must never
propagate to whatever invoked it (a worker task, the seed script, a future
CAD/CTI integration). They are logged and converted into a PipelineFailure
sentinel instead, so one failing call can never take down the ability to
process or serve any other call, and can never block call answering.
"""

from __future__ import annotations

import functools
import logging
from dataclasses import dataclass
from typing import Any, Callable, Coroutine, TypeVar

logger = logging.getLogger("aegis.pipeline")

T = TypeVar("T")


@dataclass(frozen=True)
class PipelineFailure:
    error: str
    call_id: str


def isolate_from_call_path(
    func: Callable[..., Coroutine[Any, Any, T]],
) -> Callable[..., Coroutine[Any, Any, T | PipelineFailure]]:
    @functools.wraps(func)
    async def wrapper(*args: Any, **kwargs: Any) -> T | PipelineFailure:
        call_id = kwargs.get("call_id", "unknown")
        try:
            return await func(*args, **kwargs)
        except Exception as exc:  # noqa: BLE001 - deliberate: never let pipeline errors escape
            logger.exception("aegis.pipeline.failure", extra={"error": str(exc), "call_id": call_id})
            return PipelineFailure(error=str(exc), call_id=call_id)

    return wrapper
