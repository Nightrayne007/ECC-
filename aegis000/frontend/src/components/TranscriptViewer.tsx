import type { DistressMarkerOut, FlagOut, SegmentOut } from "../types/call";

function formatMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function TranscriptViewer({
  segments,
  flags,
  distressMarkers = [],
}: {
  segments: SegmentOut[];
  flags: FlagOut[];
  distressMarkers?: DistressMarkerOut[];
}) {
  const flaggedStarts = new Set(flags.map((f) => f.timestamp_ms));
  const distressStarts = new Set(distressMarkers.map((m) => m.timestamp_ms));

  return (
    <div className="space-y-2 text-sm">
      {segments.map((segment, i) => {
        const isFlagged = flaggedStarts.has(segment.start_ms);
        const isDistressed = !isFlagged && distressStarts.has(segment.start_ms);
        const background = isFlagged
          ? "color-mix(in srgb, var(--status-critical) 10%, transparent)"
          : isDistressed
            ? "color-mix(in srgb, var(--status-warning) 12%, transparent)"
            : undefined;
        return (
          <div key={i} className="rounded px-2 py-1" style={background ? { background } : undefined}>
            <span className="mr-2 tabular-nums" style={{ color: "var(--text-muted)" }}>
              {formatMs(segment.start_ms)}
            </span>
            <span className="mr-2 font-medium" style={{ color: "var(--text-secondary)" }}>
              {segment.speaker === "call_taker" ? "Call-taker" : "Caller"}:
            </span>
            <span>{segment.text}</span>
          </div>
        );
      })}
    </div>
  );
}
