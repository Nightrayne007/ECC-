// Sequential magnitude encoding (single hue, light -> dark). Score is also
// shown as a number, so meaning never rests on color alone.
export default function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return <span style={{ color: "var(--text-muted)" }}>—</span>;
  }
  const pct = Math.round(score * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 overflow-hidden rounded-full" style={{ background: "var(--seq-track)" }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: "var(--seq-450)" }}
        />
      </div>
      <span className="tabular-nums text-sm" style={{ color: "var(--text-primary)" }}>
        {pct}%
      </span>
    </div>
  );
}
