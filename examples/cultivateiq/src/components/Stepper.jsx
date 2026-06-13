import { Check } from "lucide-react";
import { COLORS, FONTS } from "../constants/theme.js";

// Generic horizontal stepper. steps: [{ label, status: "done"|"active"|"upcoming", meta }]
export const Stepper = ({ steps }) => (
  <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
    {steps.map((step, i) => {
      const color = step.status === "done" ? COLORS.accent : step.status === "active" ? COLORS.accentText : COLORS.textMuted;
      const circleBg = step.status === "done" ? COLORS.accent : step.status === "active" ? COLORS.accentGlow : "transparent";
      return (
        <div key={step.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
          {i > 0 && (
            <div style={{
              position: "absolute", top: 14, right: "50%", width: "100%", height: 2,
              background: step.status === "upcoming" ? COLORS.border : COLORS.accentDim, zIndex: 0,
            }} />
          )}
          <div style={{
            width: 28, height: 28, borderRadius: "50%", zIndex: 1,
            background: circleBg,
            border: `2px solid ${step.status === "upcoming" ? COLORS.border : COLORS.accent}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: step.status === "active" ? `0 0 10px ${COLORS.accentGlow}` : "none",
          }}>
            {step.status === "done"
              ? <Check size={14} color="#fff" />
              : <div style={{ width: 8, height: 8, borderRadius: "50%", background: step.status === "active" ? COLORS.accent : COLORS.border }} />}
          </div>
          <div style={{ fontSize: 11, color, fontWeight: step.status === "active" ? 600 : 400, marginTop: 8, textAlign: "center" }}>{step.label}</div>
          {step.meta && <div style={{ fontSize: 10, color: COLORS.textMuted, fontFamily: FONTS.mono, marginTop: 2, textAlign: "center" }}>{step.meta}</div>}
        </div>
      );
    })}
  </div>
);
