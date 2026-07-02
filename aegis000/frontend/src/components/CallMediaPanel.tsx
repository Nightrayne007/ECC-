import { useState } from "react";
import { API_BASE, fetchCallMedia, requestMediaSession } from "../api/client";
import type { MediaSessionOut, MediaSessionSummaryOut } from "../types/call";

// On-demand caller media (Phase 3). A call-taker requests a photo or
// livestream; the caller consents by opening the single-use invite link.
// Requesting media never affects call answering — it's a human-initiated
// assist surfaced here for the supervisor.
export default function CallMediaPanel({
  callId,
  sessions,
  onChange,
}: {
  callId: string;
  sessions: MediaSessionSummaryOut[];
  onChange: (sessions: MediaSessionSummaryOut[]) => void;
}) {
  const [pending, setPending] = useState<MediaSessionOut | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function request(mediaType: string) {
    setError(null);
    try {
      const session = await requestMediaSession(callId, mediaType);
      setPending(session);
      onChange(await fetchCallMedia(callId));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          className="rounded border px-2 py-1 text-xs"
          style={{ borderColor: "var(--gridline)" }}
          onClick={() => request("photo")}
        >
          Request photo
        </button>
        <button
          className="rounded border px-2 py-1 text-xs"
          style={{ borderColor: "var(--gridline)" }}
          onClick={() => request("livestream")}
        >
          Request livestream
        </button>
      </div>

      {error && <p style={{ color: "var(--status-critical)" }}>{error}</p>}

      {pending && (
        <div className="rounded border px-3 py-2 text-xs" style={{ borderColor: "var(--gridline)" }}>
          <div className="mb-1 font-medium">Invite created — send this link to the caller</div>
          <code className="break-all" style={{ color: "var(--text-secondary)" }}>
            {pending.join_url}
          </code>
          <div className="mt-1" style={{ color: "var(--text-muted)" }}>
            {pending.transport} · single-use · expires {new Date(pending.expires_at).toLocaleTimeString("en-AU")}
          </div>
        </div>
      )}

      {sessions.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No media requested.</p>
      ) : (
        <ul className="space-y-2 text-xs">
          {sessions.map((session) => (
            <li key={session.id} className="rounded border px-3 py-2" style={{ borderColor: "var(--gridline)" }}>
              <div className="flex justify-between">
                <span className="font-medium">{session.media_type}</span>
                <span style={{ color: "var(--text-muted)" }}>{session.status}</span>
              </div>
              {session.assets.map((asset) => (
                <div key={asset.id} className="mt-1">
                  {asset.content_type.startsWith("image/") ? (
                    <img
                      src={`${API_BASE}/api/media/asset/${asset.id}/content`}
                      alt="Caller-supplied"
                      className="max-h-40 rounded"
                    />
                  ) : (
                    <a
                      href={`${API_BASE}/api/media/asset/${asset.id}/content`}
                      style={{ color: "var(--seq-450)" }}
                    >
                      {asset.content_type} ({asset.byte_size} bytes)
                    </a>
                  )}
                </div>
              ))}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
