import { useEffect, useState } from "react";
import { fetchRadioTransmissions, pollRadio } from "../api/client";
import type { RadioTransmissionOut } from "../types/call";

const SEVERITY_COLOR: Record<string, string> = {
  critical: "var(--status-critical)",
  high: "var(--status-serious)",
  low: "var(--text-muted)",
};

function EventTag({ phrase, severity, meaning }: { phrase: string; severity: string; meaning: string }) {
  const color = SEVERITY_COLOR[severity] ?? "var(--text-muted)";
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"
      style={{ borderColor: color, color }}
      title={meaning}
    >
      {severity !== "low" && <span aria-hidden="true">⚠</span>}
      {phrase}
    </span>
  );
}

export default function RadioMonitorPage() {
  const [transmissions, setTransmissions] = useState<RadioTransmissionOut[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setTransmissions(await fetchRadioTransmissions());
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onPoll() {
    setError(null);
    try {
      await pollRadio();
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (error) return <p style={{ color: "var(--status-critical)" }}>{error}</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-medium">Radio Monitor</h2>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Observe-only. Priority events auto-extracted from radio traffic.
          </p>
        </div>
        <button className="rounded border px-3 py-1 text-sm" style={{ borderColor: "var(--gridline)" }} onClick={onPoll}>
          Poll feed
        </button>
      </div>

      {!transmissions ? (
        <p style={{ color: "var(--text-muted)" }}>Loading…</p>
      ) : transmissions.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No transmissions yet — poll the feed.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {transmissions.map((tx) => (
            <li
              key={tx.id}
              className="rounded border px-3 py-2"
              style={{
                borderColor: tx.events.some((e) => e.severity === "critical")
                  ? "var(--status-critical)"
                  : "var(--gridline)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{tx.channel_label}</span>
                <span className="tabular-nums text-xs" style={{ color: "var(--text-muted)" }}>
                  {new Date(tx.started_at).toLocaleTimeString("en-AU")} · {(tx.duration_ms / 1000).toFixed(1)}s
                </span>
              </div>
              {tx.text ? (
                <p className="mt-0.5">{tx.text}</p>
              ) : (
                <p className="mt-0.5 italic" style={{ color: "var(--text-muted)" }}>
                  Audio not transcribed (STT swap-in) · {tx.audio_ref ? "audio available" : "no audio"}
                </p>
              )}
              {tx.events.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {tx.events.map((e, i) => (
                    <EventTag key={i} phrase={e.phrase} severity={e.severity} meaning={e.meaning} />
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
