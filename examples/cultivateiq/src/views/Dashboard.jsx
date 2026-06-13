import { useState } from "react";
import { FileText, Leaf, Zap, ChevronRight, AlertCircle, CheckCircle, Clock, TrendingUp, Shield, Bell, Plus, X, Check } from "lucide-react";
import { COLORS, FONTS } from "../constants/theme.js";
import { Card } from "../components/Card.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { Badge } from "../components/Badge.jsx";
import { Modal } from "../components/Modal.jsx";
import { toISODate } from "../utils/dates.js";

const inputStyle = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  background: COLORS.surface, border: `1px solid ${COLORS.border}`,
  color: COLORS.textPrimary, fontSize: 13, fontFamily: FONTS.body, outline: "none",
};

const STATUS_CONFIG = {
  overdue: { color: COLORS.danger, label: "Overdue" },
  "due-today": { color: COLORS.warning, label: "Due today" },
  upcoming: { color: COLORS.textMuted, label: "Upcoming" },
  snoozed: { color: COLORS.purple, label: "Snoozed" },
};

export const Dashboard = ({ setActive, tasks, batches, complianceScore, completeTask, snoozeTask, addTask }) => {
  const [reformBannerDismissed, setReformBannerDismissed] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", due: toISODate(new Date()), priority: "medium" });

  const activeTasks = tasks.filter((t) => !t.completed);
  const overdue = activeTasks.filter((t) => t.status === "overdue").length;
  const activeBatches = batches.filter((b) => b.status !== "Complete");
  const harvestReady = batches.filter((b) => b.stage === "Harvest ready").length;
  const scoreColor = complianceScore >= 80 ? COLORS.accent : complianceScore >= 60 ? COLORS.warning : COLORS.danger;

  const todayLabel = new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const visibleTasks = [...activeTasks]
    .sort((a, b) => {
      const rank = { overdue: 0, "due-today": 1, upcoming: 2, snoozed: 3 };
      return rank[a.status] - rank[b.status] || a.due.localeCompare(b.due);
    })
    .slice(0, 5);

  const submitTask = () => {
    if (!form.title.trim() || !form.due) return;
    addTask({ title: form.title.trim(), due: form.due, priority: form.priority });
    setForm({ title: "", due: toISODate(new Date()), priority: "medium" });
    setAddOpen(false);
  };

  return (
    <div style={{ padding: "32px 36px", animation: "fadeUp 0.35s ease forwards" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: FONTS.mono, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{todayLabel}</div>
        <h1 style={{ fontFamily: FONTS.display, fontSize: 32, fontWeight: 700, color: COLORS.textPrimary }}>Good morning, Rayneol</h1>
        <p style={{ fontSize: 14, color: COLORS.textSecondary, marginTop: 4 }}>Your facility has {overdue} overdue task{overdue !== 1 ? "s" : ""} requiring attention.</p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        <StatCard label="Compliance Score" value={`${complianceScore}%`} sub="Live — weighted by task priority" icon={Shield} color={scoreColor} anim="fadeUp 0.3s ease forwards" />
        <StatCard label="Active Batches" value={activeBatches.length} sub={harvestReady > 0 ? `${harvestReady} harvest-ready` : "All in cycle"} icon={Leaf} color={COLORS.purple} anim="fadeUp 0.35s ease forwards" />
        <StatCard label="Overdue Tasks" value={overdue} sub={overdue > 0 ? "Immediate action needed" : "All clear"} icon={AlertCircle} color={overdue > 0 ? COLORS.danger : COLORS.accent} anim="fadeUp 0.4s ease forwards" />
        <StatCard label="Permit Status" value="Active" sub="Renewal 30 Jun 2026" icon={CheckCircle} color={COLORS.success} anim="fadeUp 0.45s ease forwards" />
      </div>

      {/* Regulatory horizon banner */}
      {!reformBannerDismissed && (
        <div onClick={() => setActive("reforms")} style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "14px 18px", borderRadius: 10, marginBottom: 24,
          background: COLORS.warningDim, border: `1px solid ${COLORS.warning}30`,
          cursor: "pointer", animation: "fadeUp 0.5s ease forwards",
        }}>
          <Bell size={18} color={COLORS.warning} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: COLORS.textPrimary, fontWeight: 500 }}>4 regulatory reforms on the horizon — including a move to quarterly TGA compliance reviews from 1 Jul 2026.</div>
            <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>Open the Reform Tracker for facility-specific impact and an AI readiness briefing.</div>
          </div>
          <ChevronRight size={16} color={COLORS.warning} style={{ flexShrink: 0 }} />
          <button onClick={(e) => { e.stopPropagation(); setReformBannerDismissed(true); }} style={{ background: "transparent", border: "none", cursor: "pointer", color: COLORS.textMuted, padding: 4, flexShrink: 0, display: "flex" }}>
            <X size={14} />
          </button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Tasks */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div style={{ fontFamily: FONTS.display, fontSize: 18, fontWeight: 600 }}>Compliance Tasks</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Badge color={overdue > 0 ? COLORS.danger : COLORS.accent}>{overdue} overdue</Badge>
              <button onClick={() => setAddOpen(true)} style={{
                display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 6,
                background: "transparent", border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary,
                fontSize: 11, fontFamily: FONTS.body, cursor: "pointer",
              }}>
                <Plus size={12} /> Add
              </button>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {visibleTasks.length === 0 && (
              <div style={{ fontSize: 13, color: COLORS.textMuted, textAlign: "center", padding: "16px 0" }}>All tasks complete. Well done.</div>
            )}
            {visibleTasks.map((task) => {
              const cfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.upcoming;
              return (
                <div key={task.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 12px", borderRadius: 8,
                  background: task.status === "overdue" ? COLORS.dangerDim : task.status === "due-today" ? COLORS.warningDim : `${COLORS.border}40`,
                  border: `1px solid ${task.status === "overdue" ? `${COLORS.danger}30` : task.status === "due-today" ? `${COLORS.warning}30` : COLORS.border}`,
                }}>
                  <div style={{ fontSize: 13, color: COLORS.textPrimary, flex: 1 }}>{task.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 12 }}>
                    <span style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: FONTS.mono }}>{task.due}</span>
                    <Badge color={cfg.color}>{cfg.label}</Badge>
                    <button title="Snooze 7 days" onClick={() => snoozeTask(task.id, 7)} style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 5, cursor: "pointer", color: COLORS.textMuted, padding: 4, display: "flex" }}>
                      <Clock size={12} />
                    </button>
                    <button title="Mark complete" onClick={() => completeTask(task.id)} style={{ background: COLORS.accentGlow, border: `1px solid ${COLORS.accentDim}`, borderRadius: 5, cursor: "pointer", color: COLORS.accent, padding: 4, display: "flex" }}>
                      <Check size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Batch overview */}
        <Card>
          <div style={{ fontFamily: FONTS.display, fontSize: 18, fontWeight: 600, marginBottom: 18 }}>Batch Overview</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {batches.map((b) => {
              const statusColor = b.status === "Action needed" ? COLORS.warning : b.status === "Complete" ? COLORS.success : COLORS.accent;
              return (
                <div key={b.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px", borderRadius: 8,
                  background: `${COLORS.border}40`, border: `1px solid ${COLORS.border}`,
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", background: statusColor, flexShrink: 0,
                    boxShadow: `0 0 6px ${statusColor}`,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: COLORS.textPrimary, fontWeight: 500 }}>{b.id}</div>
                    <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{b.strain} · {b.stage}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: FONTS.mono }}>Wk {b.week}</div>
                    <div style={{ fontSize: 11, color: statusColor }}>{b.status}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Quick Actions</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            { label: "Open Reform Tracker", icon: TrendingUp, view: "reforms" },
            { label: "Draft ODC Report", icon: FileText, view: "reports" },
            { label: "Run Permit Gap Analysis", icon: Shield, view: "permit" },
            { label: "Log New Batch", icon: Plus, view: "batches" },
            { label: "View Intel Feed", icon: Zap, view: "intel" },
          ].map(({ label, icon: Icon, view }) => (
            <button key={label} onClick={() => setActive(view)} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 16px", borderRadius: 8, border: `1px solid ${COLORS.border}`,
              background: COLORS.card, color: COLORS.textSecondary, fontSize: 13,
              fontFamily: FONTS.body, cursor: "pointer", transition: "all 0.15s ease",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.color = COLORS.accent; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textSecondary; }}>
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Add Task modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Compliance Task">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Title</div>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Quarterly inventory reconciliation" style={inputStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Due date</div>
              <input type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Priority</div>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} style={inputStyle}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <button onClick={submitTask} disabled={!form.title.trim()} style={{
            padding: "10px 16px", borderRadius: 8, marginTop: 4,
            background: form.title.trim() ? COLORS.accent : COLORS.accentDim,
            border: "none", color: "#fff", fontSize: 13, fontFamily: FONTS.body,
            cursor: form.title.trim() ? "pointer" : "not-allowed",
          }}>
            Add Task
          </button>
        </div>
      </Modal>
    </div>
  );
};
