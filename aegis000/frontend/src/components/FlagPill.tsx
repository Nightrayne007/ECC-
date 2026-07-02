// Status color + icon + label per the relief rule — severity is never
// carried by color alone.
const SEVERITY_STYLE: Record<string, { color: string; icon: string }> = {
  critical: { color: "var(--status-critical)", icon: "⚠" },
  high: { color: "var(--status-serious)", icon: "⚠" },
  medium: { color: "var(--status-serious)", icon: "ⓘ" },
};

export default function FlagPill({ phrase, severity }: { phrase: string; severity: string }) {
  const style = SEVERITY_STYLE[severity] ?? { color: "var(--text-muted)", icon: "ⓘ" };
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"
      style={{ borderColor: style.color, color: style.color }}
    >
      <span aria-hidden="true">{style.icon}</span>
      {phrase}
      <span style={{ color: "var(--text-muted)" }}>({severity})</span>
    </span>
  );
}
