import { useState } from "react";
import { Bell, Minus, Plus } from "lucide-react";
import { COLORS, FONTS } from "../constants/theme.js";
import { Badge } from "./Badge.jsx";
import { formatDaysRemaining } from "../utils/dates.js";

const SEVERITY_COLOR = {
  overdue: COLORS.danger,
  critical: COLORS.warning,
  upcoming: COLORS.textSecondary,
};

const TYPE_LABEL = { task: "Task", reform: "Reform", document: "Document" };

export const NotificationBell = ({ alerts, leadDays, setLeadDays, setActive }) => {
  const [open, setOpen] = useState(false);
  const urgent = alerts.filter((a) => a.severity !== "upcoming").length;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          padding: "10px 12px", borderRadius: 8, border: `1px solid ${open ? COLORS.borderLight : COLORS.border}`,
          background: open ? COLORS.cardHover : "transparent", cursor: "pointer",
          color: urgent > 0 ? COLORS.warning : COLORS.textSecondary,
          fontSize: 13, fontFamily: FONTS.body, transition: "all 0.15s ease",
        }}
      >
        <Bell size={15} />
        Alerts
        {alerts.length > 0 && (
          <span style={{
            marginLeft: "auto", minWidth: 20, height: 20, borderRadius: 10, padding: "0 6px",
            background: urgent > 0 ? COLORS.danger : COLORS.accentDim, color: "#fff",
            fontSize: 11, fontFamily: FONTS.mono, display: "flex", alignItems: "center", justifyContent: "center",
          }}>{alerts.length}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", left: "100%", top: 0, marginLeft: 10, width: 320, zIndex: 90,
          background: COLORS.card, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12,
          padding: "14px 16px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          animation: "fadeUp 0.2s ease forwards",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontFamily: FONTS.display, fontSize: 15, fontWeight: 600, color: COLORS.textPrimary }}>Notifications</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 10, color: COLORS.textMuted, fontFamily: FONTS.mono }}>LEAD</span>
              <button onClick={() => setLeadDays(Math.max(1, leadDays - 1))} style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 4, cursor: "pointer", color: COLORS.textSecondary, padding: 2, display: "flex" }}><Minus size={10} /></button>
              <span style={{ fontSize: 11, color: COLORS.textPrimary, fontFamily: FONTS.mono, minWidth: 28, textAlign: "center" }}>{leadDays}d</span>
              <button onClick={() => setLeadDays(Math.min(90, leadDays + 1))} style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 4, cursor: "pointer", color: COLORS.textSecondary, padding: 2, display: "flex" }}><Plus size={10} /></button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflowY: "auto" }}>
            {alerts.length === 0 && (
              <div style={{ fontSize: 12, color: COLORS.textMuted, padding: "12px 0", textAlign: "center" }}>
                Nothing due within {leadDays} days.
              </div>
            )}
            {alerts.map((a) => {
              const color = SEVERITY_COLOR[a.severity];
              return (
                <button
                  key={a.id}
                  onClick={() => { setActive(a.view); setOpen(false); }}
                  style={{
                    textAlign: "left", padding: "8px 10px", borderRadius: 7, cursor: "pointer",
                    background: a.severity === "overdue" ? COLORS.dangerDim : `${COLORS.border}40`,
                    border: `1px solid ${a.severity === "overdue" ? COLORS.danger + "30" : COLORS.border}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
                    <Badge color={color}>{TYPE_LABEL[a.type]}</Badge>
                    <span style={{ fontSize: 10, color, fontFamily: FONTS.mono }}>
                      {a.type === "document" ? (a.daysRemaining < 0 ? `Expired ${Math.abs(a.daysRemaining)}d ago` : `Expires in ${a.daysRemaining}d`) : formatDaysRemaining(a.daysRemaining)}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.textPrimary, lineHeight: 1.4 }}>{a.title}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
