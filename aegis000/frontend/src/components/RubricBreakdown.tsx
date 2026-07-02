import type { CriterionScoreOut } from "../types/call";
import ScoreBadge from "./ScoreBadge";

export default function RubricBreakdown({ criteria }: { criteria: CriterionScoreOut[] }) {
  return (
    <div className="space-y-3">
      {criteria.map((c) => (
        <div key={c.criterion_key}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{c.criterion_key.replace(/_/g, " ")}</span>
            <ScoreBadge score={c.score} />
          </div>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {c.rationale}
          </p>
        </div>
      ))}
    </div>
  );
}
