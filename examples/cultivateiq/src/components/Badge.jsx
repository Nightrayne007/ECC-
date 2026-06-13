import { COLORS, FONTS } from "../constants/theme.js";

export const Badge = ({ children, color = COLORS.accent, bg }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "2px 8px", borderRadius: 4,
    fontSize: 11, fontFamily: FONTS.mono, fontWeight: 500, letterSpacing: "0.04em",
    color: color, background: bg || `${color}18`,
    border: `1px solid ${color}30`,
  }}>{children}</span>
);
