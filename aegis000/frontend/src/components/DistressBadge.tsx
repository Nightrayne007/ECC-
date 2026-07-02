// Distress is a one-directional risk signal (there's no "good" pole), so
// this uses the status palette scaling muted -> warning -> serious ->
// critical rather than the sequential blue used for QA score magnitude.
// Icon + label always accompany the color per the relief rule.
function statusFor(score: number): { color: string; label: string; icon: string } {
  if (score >= 0.75) return { color: "var(--status-critical)", label: "Critical", icon: "⚠" };
  if (score >= 0.5) return { color: "var(--status-serious)", label: "Serious", icon: "⚠" };
  if (score >= 0.25) return { color: "var(--status-warning)", label: "Warning", icon: "ⓘ" };
  return { color: "var(--text-muted)", label: "Low", icon: "" };
}

export default function DistressBadge({ score }: { score: number | null }) {
  if (score === null) {
    return <span style={{ color: "var(--text-muted)" }}>—</span>;
  }
  const { color, label, icon } = statusFor(score);
  return (
    <span className="inline-flex items-center gap-1 text-sm" style={{ color }}>
      {icon && <span aria-hidden="true">{icon}</span>}
      {label} <span className="tabular-nums" style={{ color: "var(--text-muted)" }}>({Math.round(score * 100)}%)</span>
    </span>
  );
}
