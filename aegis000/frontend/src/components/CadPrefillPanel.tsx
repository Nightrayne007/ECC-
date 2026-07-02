import type { CadPrefillOut } from "../types/call";

// Deliberately styled as a draft, never as a submitted/authoritative
// record — this data is never sent to a real CAD system by this codebase.
// The banner is the UI counterpart of the life-safety boundary enforced
// in app/cad/interface.py.
export default function CadPrefillPanel({ prefill }: { prefill: CadPrefillOut | null }) {
  if (!prefill) {
    return <p style={{ color: "var(--text-muted)" }}>Not yet analysed.</p>;
  }

  return (
    <div className="space-y-2 rounded border px-3 py-2" style={{ borderColor: "var(--gridline)" }}>
      <div
        className="inline-block rounded px-2 py-0.5 text-xs font-medium"
        style={{ background: "var(--seq-track)", color: "var(--text-secondary)" }}
      >
        DRAFT — review before entering into CAD, not submitted automatically
      </div>
      <dl className="space-y-1 text-sm">
        <div className="flex justify-between">
          <dt style={{ color: "var(--text-muted)" }}>Incident type</dt>
          <dd>{prefill.incident_type}</dd>
        </div>
        <div className="flex justify-between">
          <dt style={{ color: "var(--text-muted)" }}>Location</dt>
          <dd>{prefill.location_text ?? "—"}</dd>
        </div>
        <div className="flex justify-between">
          <dt style={{ color: "var(--text-muted)" }}>Confidence</dt>
          <dd className="tabular-nums">{Math.round(prefill.confidence * 100)}%</dd>
        </div>
      </dl>
      {prefill.hazards.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {prefill.hazards.map((h) => (
            <span
              key={h}
              className="rounded-full border px-2 py-0.5 text-xs"
              style={{ borderColor: "var(--status-serious)", color: "var(--status-serious)" }}
            >
              {h}
            </span>
          ))}
        </div>
      )}
      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
        {prefill.notes}
      </p>
    </div>
  );
}
