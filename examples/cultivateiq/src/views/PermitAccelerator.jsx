import { useState } from "react";
import { Shield, Zap } from "lucide-react";
import { COLORS, FONTS } from "../constants/theme.js";
import { Card } from "../components/Card.jsx";
import { Badge } from "../components/Badge.jsx";
import { SectionTitle } from "../components/SectionTitle.jsx";
import { AIPlanOutput } from "../components/AIPlanOutput.jsx";
import { PERMIT_GAPS } from "../data/permit-gaps.js";
import { buildPermitAnalysisPrompt } from "../constants/system-prompts.js";
import { useAnthropic } from "../hooks/useAnthropic.js";

export const PermitAccelerator = () => {
  const [aiResult, setAiResult] = useState("");
  const { send, loading: analysing } = useAnthropic();

  const overallPct = Math.round(PERMIT_GAPS.reduce((a, g) => a + g.completion, 0) / PERMIT_GAPS.length);

  const runAnalysis = async () => {
    setAiResult("");
    try {
      const text = await send({
        messages: [{ role: "user", content: buildPermitAnalysisPrompt(PERMIT_GAPS, overallPct) }],
      });
      setAiResult(text);
    } catch {
      setAiResult("Analysis failed. Please check your connection and try again.");
    }
  };

  return (
    <div style={{ padding: "32px 36px", animation: "fadeUp 0.35s ease forwards" }}>
      <SectionTitle sub="AI gap analysis to accelerate your ODC cultivation permit application">Permit Accelerator</SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Left: Readiness meter */}
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Overall Readiness</div>
              <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto 16px" }}>
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r="58" fill="none" stroke={COLORS.border} strokeWidth="10" />
                  <circle cx="70" cy="70" r="58" fill="none" stroke={COLORS.accent} strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 58 * overallPct / 100} ${2 * Math.PI * 58}`}
                    strokeDashoffset={2 * Math.PI * 58 * 0.25}
                    strokeLinecap="round" />
                  <text x="70" y="66" textAnchor="middle" fill={COLORS.textPrimary} fontSize="28" fontFamily="Georgia, serif" fontWeight="700">{overallPct}%</text>
                  <text x="70" y="86" textAnchor="middle" fill={COLORS.textSecondary} fontSize="11" fontFamily="monospace">ready</text>
                </svg>
              </div>
              <Badge color={overallPct >= 80 ? COLORS.success : overallPct >= 60 ? COLORS.warning : COLORS.danger}>
                {overallPct >= 80 ? "Near submission ready" : overallPct >= 60 ? "In progress" : "Significant gaps"}
              </Badge>
            </div>
          </Card>

          {/* Gap bars */}
          <Card>
            <div style={{ fontFamily: FONTS.display, fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Gap Areas</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {PERMIT_GAPS.map((g) => {
                const col = g.completion >= 90 ? COLORS.success : g.completion >= 60 ? COLORS.warning : COLORS.danger;
                return (
                  <div key={g.area}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                      <div style={{ fontSize: 12, color: COLORS.textPrimary }}>{g.area}</div>
                      <div style={{ fontSize: 11, fontFamily: FONTS.mono, color: col }}>{g.completion}%</div>
                    </div>
                    <div style={{ height: 4, background: COLORS.border, borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${g.completion}%`, background: col, borderRadius: 2, transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right: AI Analysis */}
        <div>
          <Card style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontFamily: FONTS.display, fontSize: 18, fontWeight: 600 }}>AI Action Plan</div>
              <button onClick={runAnalysis} disabled={analysing} style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "8px 16px", borderRadius: 8,
                background: analysing ? COLORS.accentDim : COLORS.accent,
                border: "none", color: "#fff", fontSize: 13,
                fontFamily: FONTS.body, cursor: analysing ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
              }}>
                {analysing ? <div style={{ width: 14, height: 14, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> : <Zap size={14} />}
                {analysing ? "Analysing..." : "Run Gap Analysis"}
              </button>
            </div>

            {!aiResult && !analysing && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: COLORS.textMuted }}>
                <Shield size={40} style={{ opacity: 0.3 }} />
                <div style={{ fontSize: 13, textAlign: "center" }}>Click "Run Gap Analysis" to get AI-generated recommendations to accelerate your permit application.</div>
              </div>
            )}

            {analysing && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, border: `3px solid ${COLORS.border}`, borderTopColor: COLORS.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <div style={{ fontSize: 13, color: COLORS.textSecondary }}>Analysing gap areas against ODC requirements...</div>
              </div>
            )}

            {aiResult && (
              <div style={{ flex: 1, overflowY: "auto" }}>
                <AIPlanOutput text={aiResult} />
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
