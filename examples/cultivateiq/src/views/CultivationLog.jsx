import { useState } from "react";
import { Plus, ChevronDown, Sprout } from "lucide-react";
import { COLORS, FONTS } from "../constants/theme.js";
import { Card } from "../components/Card.jsx";
import { Badge } from "../components/Badge.jsx";
import { SectionTitle } from "../components/SectionTitle.jsx";
import { Modal } from "../components/Modal.jsx";
import { toISODate } from "../utils/dates.js";

const inputStyle = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  background: COLORS.surface, border: `1px solid ${COLORS.border}`,
  color: COLORS.textPrimary, fontSize: 13, fontFamily: FONTS.body, outline: "none",
};

export const CultivationLog = ({ batches, addBatch, openJourney }) => {
  const [selected, setSelected] = useState(null);
  const [newOpen, setNewOpen] = useState(false);
  const [form, setForm] = useState({ strain: "", planted: toISODate(new Date()) });

  const submitBatch = () => {
    if (!form.strain.trim()) return;
    addBatch({ strain: form.strain.trim(), planted: form.planted });
    setForm({ strain: "", planted: toISODate(new Date()) });
    setNewOpen(false);
  };

  return (
    <div style={{ padding: "32px 36px", animation: "fadeUp 0.35s ease forwards" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <SectionTitle sub="Active cultivation batches and ODC-compliant record keeping">Cultivation Log</SectionTitle>
        <button onClick={() => setNewOpen(true)} style={{
          display: "flex", alignItems: "center", gap: 7, padding: "9px 16px",
          borderRadius: 8, background: COLORS.accent, border: "none",
          color: "#fff", fontSize: 13, fontFamily: FONTS.body, cursor: "pointer",
        }}>
          <Plus size={14} /> New Batch
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {batches.map((b) => {
          const statusColor = b.status === "Action needed" ? COLORS.warning : b.status === "Complete" ? COLORS.success : COLORS.accent;
          const isSelected = selected === b.id;
          return (
            <div key={b.id}>
              <Card hoverable onClick={() => setSelected(isSelected ? null : b.id)}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: statusColor, boxShadow: `0 0 8px ${statusColor}`, flexShrink: 0 }} />
                  <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr auto", gap: 16, alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: "0.06em" }}>Batch ID</div>
                      <div style={{ fontSize: 14, color: COLORS.textPrimary, fontFamily: FONTS.mono, fontWeight: 500 }}>{b.id}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: "0.06em" }}>Cultivar</div>
                      <div style={{ fontSize: 13, color: COLORS.textPrimary }}>{b.strain}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: "0.06em" }}>Stage</div>
                      <div style={{ fontSize: 13, color: COLORS.textPrimary }}>{b.stage}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: "0.06em" }}>Week</div>
                      <div style={{ fontSize: 13, color: COLORS.textPrimary }}>{b.week}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: "0.06em" }}>THC Est.</div>
                      <div style={{ fontSize: 13, color: COLORS.accentText, fontFamily: FONTS.mono }}>{b.thc}</div>
                    </div>
                    <Badge color={statusColor}>{b.status}</Badge>
                  </div>
                  <ChevronDown size={14} color={COLORS.textMuted} style={{ transform: isSelected ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s ease" }} />
                </div>
              </Card>

              {isSelected && (
                <div style={{
                  background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                  borderTop: "none", borderRadius: "0 0 12px 12px",
                  padding: "16px 24px", animation: "fadeUp 0.2s ease forwards",
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
                    {[
                      ["Planted", b.planted],
                      ["Licence", "MC-2024-QLD-0047"],
                      ["Location", "Room 3A – Canopy"],
                      ["Stage entries", String(b.stageHistory.length)],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{k}</div>
                        <div style={{ fontSize: 13, color: COLORS.textPrimary, fontFamily: FONTS.mono }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => openJourney(b.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 7, background: COLORS.accentGlow, border: `1px solid ${COLORS.accentDim}`, color: COLORS.accent, fontSize: 12, fontFamily: FONTS.body, cursor: "pointer" }}>
                      <Sprout size={13} /> Open Grow Journey
                    </button>
                    <button style={{ padding: "7px 14px", borderRadius: 7, background: "transparent", border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontSize: 12, fontFamily: FONTS.body, cursor: "pointer" }}>View Full Record</button>
                    <button style={{ padding: "7px 14px", borderRadius: 7, background: "transparent", border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontSize: 12, fontFamily: FONTS.body, cursor: "pointer" }}>Export ODC Report</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New Batch modal */}
      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="Log New Batch">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Cultivar / strain</div>
            <input value={form.strain} onChange={(e) => setForm({ ...form, strain: e.target.value })} placeholder="e.g. Bedrocan T22" style={inputStyle} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Planted date</div>
            <input type="date" value={form.planted} onChange={(e) => setForm({ ...form, planted: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.5 }}>
            The batch starts at "Seed / Clone". Advance stages from the Grow Journey view — stage exits require a four-eyes QA check.
          </div>
          <button onClick={submitBatch} disabled={!form.strain.trim()} style={{
            padding: "10px 16px", borderRadius: 8, marginTop: 4,
            background: form.strain.trim() ? COLORS.accent : COLORS.accentDim,
            border: "none", color: "#fff", fontSize: 13, fontFamily: FONTS.body,
            cursor: form.strain.trim() ? "pointer" : "not-allowed",
          }}>
            Create Batch
          </button>
        </div>
      </Modal>
    </div>
  );
};
