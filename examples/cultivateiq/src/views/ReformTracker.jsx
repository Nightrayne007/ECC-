import { useState } from "react";
import { MessageSquare, Zap, Clock, ChevronRight, Bell, BookOpen, Loader } from "lucide-react";
import { COLORS, FONTS } from "../constants/theme.js";
import { Card } from "../components/Card.jsx";
import { Badge } from "../components/Badge.jsx";
import { SectionTitle } from "../components/SectionTitle.jsx";
import { AIPlanOutput } from "../components/AIPlanOutput.jsx";
import { REFORM_TRACKER } from "../data/reform-tracker.js";
import { PERMIT_GAPS } from "../data/permit-gaps.js";
import { buildReformBriefingPrompt } from "../constants/system-prompts.js";
import { useAnthropic } from "../hooks/useAnthropic.js";

export const ReformTracker = ({ onAskCopilot }) => {
  const [expanded, setExpanded] = useState(REFORM_TRACKER[0].id);
  const [briefing, setBriefing] = useState("");
  const { send, loading: briefingLoading } = useAnthropic();

  const runBriefing = async () => {
    setBriefing("");
    try {
      const text = await send({
        messages: [{ role: "user", content: buildReformBriefingPrompt(REFORM_TRACKER, PERMIT_GAPS) }],
      });
      setBriefing(text);
    } catch {
      setBriefing("Briefing failed. Please check your connection and try again.");
    }
  };

  return (
    <div style={{ padding: "32px 36px", animation: "fadeUp 0.35s ease forwards" }}>
      <SectionTitle sub="Tracking TGA and ODC reform proposals reshaping medicinal cannabis cultivation compliance">Reform Tracker</SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>
        {/* Timeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {REFORM_TRACKER.map((item) => {
            const isOpen = expanded === item.id;
            return (
              <Card key={item.id} hoverable onClick={() => setExpanded(isOpen ? null : item.id)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                      <Badge color={COLORS.textSecondary}>{item.regulator}</Badge>
                      <Badge color={item.statusColor}>{item.status}</Badge>
                      <span style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: FONTS.mono }}>{item.area}</span>
                    </div>
                    <div style={{ fontFamily: FONTS.display, fontSize: 17, fontWeight: 600, color: COLORS.textPrimary, marginBottom: 6 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: FONTS.mono, display: "flex", alignItems: "center", gap: 6 }}>
                      <Clock size={12} /> {item.timeline}
                    </div>
                  </div>
                  <ChevronRight size={16} color={COLORS.textMuted} style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s ease", flexShrink: 0, marginTop: 4 }} />
                </div>

                {isOpen && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${COLORS.border}`, animation: "fadeUp 0.2s ease forwards" }}>
                    <div style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.6, marginBottom: 12 }}>{item.summary}</div>
                    <div style={{ padding: "10px 12px", borderRadius: 8, background: COLORS.accentGlow, border: `1px solid ${COLORS.accentDim}`, marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: COLORS.accent, fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Impact on Suncoast Botanicals</div>
                      <div style={{ fontSize: 13, color: COLORS.textPrimary, lineHeight: 1.6 }}>{item.impact}</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onAskCopilot(item.actionPrompt); }} style={{
                      display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 7,
                      background: "transparent", border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary,
                      fontSize: 12, fontFamily: FONTS.body, cursor: "pointer", transition: "all 0.15s ease",
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.color = COLORS.accent; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textSecondary; }}>
                      <MessageSquare size={13} /> Ask Co-pilot about this reform
                    </button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* AI briefing panel */}
        <div>
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Bell size={16} color={COLORS.accent} />
              <div style={{ fontFamily: FONTS.display, fontSize: 16, fontWeight: 600 }}>90-Day Readiness Briefing</div>
            </div>

            <button onClick={runBriefing} disabled={briefingLoading} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%",
              padding: "10px 16px", borderRadius: 8, marginBottom: 14,
              background: briefingLoading ? COLORS.accentDim : COLORS.accent,
              border: "none", color: "#fff", fontSize: 13,
              fontFamily: FONTS.body, cursor: briefingLoading ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
            }}>
              {briefingLoading ? <Loader size={14} style={{ animation: "spin 0.8s linear infinite" }} /> : <Zap size={14} />}
              {briefingLoading ? "Generating..." : "Generate Briefing"}
            </button>

            {!briefing && !briefingLoading && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: COLORS.textMuted, padding: "24px 0" }}>
                <BookOpen size={32} style={{ opacity: 0.3 }} />
                <div style={{ fontSize: 12, textAlign: "center" }}>Generate an AI briefing connecting the reform pipeline to your current permit gaps.</div>
              </div>
            )}

            {briefingLoading && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: "24px 0" }}>
                <div style={{ width: 36, height: 36, border: `3px solid ${COLORS.border}`, borderTopColor: COLORS.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <div style={{ fontSize: 12, color: COLORS.textSecondary, textAlign: "center" }}>Cross-referencing reforms with your gap analysis...</div>
              </div>
            )}

            {briefing && !briefingLoading && (
              <div style={{ overflowY: "auto" }}>
                <AIPlanOutput text={briefing} />
              </div>
            )}

            <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.textMuted, lineHeight: 1.5 }}>
              Reform statuses reflect publicly announced TGA/ODC proposals. Confirm current requirements with the ODC or TGA before acting.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
