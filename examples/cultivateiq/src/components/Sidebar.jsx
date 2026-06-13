import { Leaf } from "lucide-react";
import { COLORS, FONTS } from "../constants/theme.js";
import { NAV } from "../constants/nav.js";
import { Badge } from "./Badge.jsx";
import { NotificationBell } from "./NotificationBell.jsx";

export const Sidebar = ({ active, setActive, alerts, leadDays, setLeadDays }) => (
  <div style={{
    width: 220, flexShrink: 0, background: COLORS.surface,
    borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column",
    height: "100vh", position: "sticky", top: 0,
  }}>
    {/* Logo */}
    <div style={{ padding: "24px 24px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDim})`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Leaf size={16} color="#fff" />
        </div>
        <div>
          <div style={{ fontFamily: FONTS.display, fontSize: 16, fontWeight: 700, color: COLORS.textPrimary, lineHeight: 1.1 }}>Cultivate</div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: COLORS.accent, letterSpacing: "0.12em" }}>IQ</div>
        </div>
      </div>
    </div>

    {/* Facility badge */}
    <div style={{ padding: "12px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
      <div style={{ fontSize: 10, color: COLORS.textMuted, fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Active Facility</div>
      <div style={{ fontSize: 13, color: COLORS.textSecondary, fontWeight: 500 }}>Suncoast Botanicals Pty Ltd</div>
      <div style={{ marginTop: 6 }}><Badge color={COLORS.accent}>QLD · Permit Active</Badge></div>
    </div>

    {/* Alerts */}
    <div style={{ padding: "10px 12px", borderBottom: `1px solid ${COLORS.border}` }}>
      <NotificationBell alerts={alerts} leadDays={leadDays} setLeadDays={setLeadDays} setActive={setActive} />
    </div>

    {/* Nav */}
    <nav style={{ padding: "10px 12px", flex: 1, overflowY: "auto" }}>
      {NAV.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button key={id} onClick={() => setActive(id)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer",
            background: isActive ? COLORS.accentGlow : "transparent",
            color: isActive ? COLORS.accent : COLORS.textSecondary,
            fontSize: 13, fontFamily: FONTS.body, fontWeight: isActive ? 500 : 400,
            textAlign: "left", transition: "all 0.15s ease",
            marginBottom: 2,
          }}>
            <Icon size={15} />
            {label}
          </button>
        );
      })}
    </nav>

    {/* Footer */}
    <div style={{ padding: "14px 20px", borderTop: `1px solid ${COLORS.border}` }}>
      <div style={{ fontSize: 10, color: COLORS.textMuted, fontFamily: FONTS.mono }}>ODC LICENCE</div>
      <div style={{ fontSize: 12, color: COLORS.textSecondary, fontFamily: FONTS.mono, marginTop: 2 }}>MC-2024-QLD-0047</div>
    </div>
  </div>
);
