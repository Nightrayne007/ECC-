import { COLORS, FONTS } from "../constants/theme.js";
import { Card } from "./Card.jsx";

export const StatCard = ({ label, value, sub, icon: Icon, color = COLORS.accent, anim }) => (
  <Card style={{ animation: anim }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: FONTS.mono, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
        <div style={{ fontSize: 32, fontFamily: FONTS.display, fontWeight: 700, color: COLORS.textPrimary, lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 6 }}>{sub}</div>}
      </div>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${color}30` }}>
        <Icon size={18} color={color} />
      </div>
    </div>
  </Card>
);
