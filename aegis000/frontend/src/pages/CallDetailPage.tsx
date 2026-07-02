import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchAuditTrail, fetchCallDetail } from "../api/client";
import AudioPlayerStub from "../components/AudioPlayerStub";
import CadPrefillPanel from "../components/CadPrefillPanel";
import DistressBadge from "../components/DistressBadge";
import FlagPill from "../components/FlagPill";
import RubricBreakdown from "../components/RubricBreakdown";
import TranscriptViewer from "../components/TranscriptViewer";
import type { AuditEntryOut, CallDetailOut } from "../types/call";

export default function CallDetailPage() {
  const { callId } = useParams<{ callId: string }>();
  const [call, setCall] = useState<CallDetailOut | null>(null);
  const [audit, setAudit] = useState<AuditEntryOut[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!callId) return;
    Promise.all([fetchCallDetail(callId), fetchAuditTrail(callId)])
      .then(([callDetail, auditTrail]) => {
        setCall(callDetail);
        setAudit(auditTrail);
      })
      .catch((e: Error) => setError(e.message));
  }, [callId]);

  if (error) return <p style={{ color: "var(--status-critical)" }}>{error}</p>;
  if (!call) return <p style={{ color: "var(--text-muted)" }}>Loading…</p>;

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-4">
        <div>
          <h2 className="text-base font-medium">Transcript</h2>
          <AudioPlayerStub />
        </div>
        <TranscriptViewer
          segments={call.segments}
          flags={call.flags}
          distressMarkers={call.distress_assessment?.markers ?? []}
          translatedSegments={call.translated_segments}
        />

        {call.flags.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-medium">Flags</h3>
            <div className="flex flex-wrap gap-2">
              {call.flags.map((f, i) => (
                <FlagPill key={i} phrase={f.phrase} severity={f.severity} />
              ))}
            </div>
          </div>
        )}

        {call.coaching_moments.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-medium">Coaching Moments</h3>
            <ul className="space-y-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              {call.coaching_moments.map((m, i) => (
                <li key={i}>
                  <span className="font-medium">{m.criterion_key.replace(/_/g, " ")}:</span> {m.note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="mb-2 text-sm font-medium">Rubric Score</h3>
          {call.qa_score ? (
            <RubricBreakdown criteria={call.qa_score.criterion_scores} />
          ) : (
            <p style={{ color: "var(--text-muted)" }}>Not yet scored.</p>
          )}
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium">Vocal Distress</h3>
          {call.distress_assessment ? (
            <div className="space-y-2">
              <DistressBadge score={call.distress_assessment.overall_distress_score} />
              <ul className="space-y-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                {call.distress_assessment.markers.map((m, i) => (
                  <li key={i}>
                    <span className="font-medium">{m.kind.replace(/_/g, " ")}</span> ({m.severity}) — {m.description}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)" }}>Not yet analysed.</p>
          )}
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium">CAD Pre-fill</h3>
          <CadPrefillPanel prefill={call.cad_prefill} />
        </div>

        {audit && (
          <div>
            <h3 className="mb-2 text-sm font-medium">Audit Trail</h3>
            <ul className="space-y-1 text-xs">
              {audit.map((entry) => (
                <li key={entry.id} className="flex items-center gap-2">
                  <span
                    style={{ color: entry.verified ? "var(--status-good)" : "var(--status-critical)" }}
                    aria-hidden="true"
                  >
                    {entry.verified ? "✓" : "✗"}
                  </span>
                  <span>
                    {entry.action} — {entry.model_name} ({entry.model_version})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
