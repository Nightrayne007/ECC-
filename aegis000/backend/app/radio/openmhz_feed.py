"""Real radio feed adapter against the free, open OpenMHz API.

OpenMHz (https://openmhz.com) is the one genuinely-free JSON API returning
real recorded radio calls, and is ToS-clean for dev/demo use. This adapter
polls `{base}/{system}/calls/newer` and maps each call to a RadioTransmission
with `audio_ref` set to the call's m4a URL and `text=None` — OpenMHz gives
metadata + audio, not transcripts, so transcription of `audio_ref` is the
STT swap-in (the RadioMonitorService only extracts events from transmissions
that already have text).

This is a *dev/demo* source only. AU coverage on OpenMHz is thin because
most AU emergency voice is encrypted at source; a production deployment taps
the ESO's own ICCS/ControlWorks directly (see docs/failover-design.md).
Not selected by default — enable with AEGIS_RADIO_FEED=openmhz.
"""

from __future__ import annotations

from datetime import datetime, timezone

import httpx

from app.radio.interface import RadioFeedAdapter, RadioTransmission


def _openmhz_time(dt: datetime) -> int:
    # OpenMHz expects unix seconds with the first three fractional digits
    # appended as a whole number, e.g. 1609533015.681 -> 1609533015681.
    return int(dt.timestamp() * 1000)


class OpenMHzRadioFeedAdapter(RadioFeedAdapter):
    name = "openmhz-radio"
    version = "v1"

    def __init__(self, system: str, base_url: str = "https://api.openmhz.com", timeout_s: float = 15.0) -> None:
        if not system:
            raise ValueError("OpenMHz system short-name is required (AEGIS_RADIO_OPENMHZ_SYSTEM)")
        self._system = system
        self._base_url = base_url.rstrip("/")
        self._timeout_s = timeout_s

    async def poll(self, *, since: datetime | None = None, limit: int = 50) -> list[RadioTransmission]:
        since = since or datetime.fromtimestamp(0, tz=timezone.utc)
        url = f"{self._base_url}/{self._system}/calls/newer"
        params = {"time": _openmhz_time(since)}
        async with httpx.AsyncClient(timeout=self._timeout_s) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            payload = response.json()

        transmissions: list[RadioTransmission] = []
        for call in payload.get("calls", [])[:limit]:
            started_at = datetime.fromtimestamp(call["time"] / 1000, tz=timezone.utc) if "time" in call else since
            talkgroup = str(call.get("talkgroupNum", "unknown"))
            transmissions.append(
                RadioTransmission(
                    external_ref=str(call.get("_id", talkgroup)),
                    channel_external_id=f"{self._system}-{talkgroup}",
                    channel_label=call.get("talkgroupName") or f"TG {talkgroup}",
                    service=call.get("talkgroupGroup", "multi") or "multi",
                    started_at=started_at,
                    duration_ms=int(call.get("len", 0) * 1000),
                    source=self.name,
                    text=None,
                    audio_ref=call.get("url"),
                    detail={"talkgroup": talkgroup},
                )
            )
        return transmissions
