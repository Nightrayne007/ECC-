import { useNavigate } from "react-router-dom";
import type { CallSummaryOut } from "../types/call";
import DistressBadge from "./DistressBadge";
import ScoreBadge from "./ScoreBadge";

export default function CallTable({ calls }: { calls: CallSummaryOut[] }) {
  const navigate = useNavigate();

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b text-left" style={{ borderColor: "var(--gridline)", color: "var(--text-muted)" }}>
          <th className="py-2 pr-4 font-normal">Started</th>
          <th className="py-2 pr-4 font-normal">Agent</th>
          <th className="py-2 pr-4 font-normal">Duration</th>
          <th className="py-2 pr-4 font-normal">QA Score</th>
          <th className="py-2 pr-4 font-normal">Distress</th>
          <th className="py-2 pr-4 font-normal">Flags</th>
          <th className="py-2 pr-4 font-normal">Language</th>
        </tr>
      </thead>
      <tbody>
        {calls.map((call) => (
          <tr
            key={call.id}
            className="cursor-pointer border-b hover:bg-black/[0.02]"
            style={{ borderColor: "var(--gridline)" }}
            onClick={() => navigate(`/calls/${call.id}`)}
          >
            <td className="py-2 pr-4 tabular-nums">{new Date(call.started_at).toLocaleString("en-AU")}</td>
            <td className="py-2 pr-4">{call.agent_id.slice(0, 8)}</td>
            <td className="py-2 pr-4 tabular-nums">{call.duration_seconds}s</td>
            <td className="py-2 pr-4">
              <ScoreBadge score={call.overall_score} />
            </td>
            <td className="py-2 pr-4">
              <DistressBadge score={call.distress_score} />
            </td>
            <td className="py-2 pr-4 tabular-nums">{call.flag_count}</td>
            <td className="py-2 pr-4">
              {call.language_detected}
              {call.non_english_flag && (
                <span className="ml-1" style={{ color: "var(--text-muted)" }}>
                  (multi-language)
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
