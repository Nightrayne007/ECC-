"""Deterministic synthetic radio feed — no external dependency, no audio.

Emits a fixed script of realistic multi-channel radio traffic (police, fire,
ambulance) including a few priority events, so the Radio Monitor demonstrates
real event extraction locally with zero setup. Transmissions carry text
directly (as if already transcribed upstream).
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from app.radio.interface import RadioFeedAdapter, RadioTransmission

_SCRIPT: list[tuple[str, str, str, int, str]] = [
    # (channel_external_id, channel_label, service, duration_ms, text)
    ("police-vkg-1", "Police VKG 1", "police", 4200, "VKG copy, unit 41 on scene at the Coburg address."),
    ("police-vkg-1", "Police VKG 1", "police", 3100, "Unit 41 urgent, we need assistance, offender is armed."),
    ("ambulance-metro", "Ambulance Metro", "ambulance", 5200, "Case 22 en route to the Royal, patient stable."),
    ("police-vkg-1", "Police VKG 1", "police", 2600, "All units, in pursuit north on Sydney Road."),
    ("fire-district-3", "Fire District 3", "fire", 4800, "Pumper 12 responding, structure fire confirmed."),
    ("police-vkg-1", "Police VKG 1", "police", 2200, "Signal one, signal one, shots fired, officer down."),
    ("ambulance-metro", "Ambulance Metro", "ambulance", 3400, "Case 22 arrived, handover complete."),
]


class MockRadioFeedAdapter(RadioFeedAdapter):
    name = "mock-radio"
    version = "mock-1"

    def __init__(self, base_time: datetime | None = None) -> None:
        self._base_time = base_time or datetime.now(timezone.utc) - timedelta(minutes=len(_SCRIPT))

    async def poll(self, *, since: datetime | None = None, limit: int = 50) -> list[RadioTransmission]:
        transmissions: list[RadioTransmission] = []
        for i, (chan_id, chan_label, service, duration, text) in enumerate(_SCRIPT):
            started_at = self._base_time + timedelta(minutes=i)
            if since is not None and started_at <= since:
                continue
            transmissions.append(
                RadioTransmission(
                    external_ref=f"mock-tx-{i:03d}",
                    channel_external_id=chan_id,
                    channel_label=chan_label,
                    service=service,
                    started_at=started_at,
                    duration_ms=duration,
                    source=self.name,
                    text=text,
                )
            )
            if len(transmissions) >= limit:
                break
        return transmissions
