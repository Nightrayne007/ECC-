import { COLORS, FONTS } from "../constants/theme.js";

// Renders a numbered AI action plan / briefing with accent highlights for steps.
export const AIPlanOutput = ({ text }) => (
  <>
    {text.split("\n").map((line, i) => {
      if (line.match(/^\d+\./)) return (
        <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12, padding: "10px 12px", background: COLORS.accentGlow, borderRadius: 8, border: `1px solid ${COLORS.accentDim}` }}>
          <div style={{ fontSize: 12, color: COLORS.accent, fontFamily: FONTS.mono, fontWeight: 600, flexShrink: 0, marginTop: 1 }}>{line.match(/^\d+/)[0]}.</div>
          <div style={{ fontSize: 13, color: COLORS.textPrimary, lineHeight: 1.6 }}>{line.replace(/^\d+\.\s*\*\*[^*]+\*\*:?\s*/, "").replace(/\*\*/g, "")}</div>
        </div>
      );
      if (line === "") return <div key={i} style={{ height: 4 }} />;
      return <div key={i} style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.6, marginBottom: 4 }}>{line.replace(/\*\*/g, "")}</div>;
    })}
  </>
);
