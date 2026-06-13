import { COLORS, FONTS } from "../constants/theme.js";
import { Card } from "../components/Card.jsx";
import { Badge } from "../components/Badge.jsx";
import { SectionTitle } from "../components/SectionTitle.jsx";
import { INTEL_ITEMS } from "../data/intel-items.js";

export const IntelFeed = ({ onAskCopilot }) => (
  <div style={{ padding: "32px 36px", animation: "fadeUp 0.35s ease forwards" }}>
    <SectionTitle sub="AI-summarised regulatory updates from the ODC, TGA and Dept. of Health">Intel Feed</SectionTitle>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {INTEL_ITEMS.map((item) => (
          <Card key={item.id} hoverable>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Badge color={item.tagColor}>{item.tag}</Badge>
                <span style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: FONTS.mono }}>{item.source}</span>
              </div>
              <span style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: FONTS.mono }}>{item.date}</span>
            </div>
            <div style={{ fontFamily: FONTS.display, fontSize: 16, fontWeight: 600, color: COLORS.textPrimary, marginBottom: 8, lineHeight: 1.3 }}>{item.title}</div>
            <div style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.6 }}>{item.summary}</div>
            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <button style={{ padding: "5px 12px", borderRadius: 6, background: "transparent", border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontSize: 11, fontFamily: FONTS.body, cursor: "pointer" }}>Read more</button>
              <button onClick={() => onAskCopilot(`Tell me more about this update and what it means for our facility — "${item.title}": ${item.summary}`)} style={{ padding: "5px 12px", borderRadius: 6, background: "transparent", border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontSize: 11, fontFamily: FONTS.body, cursor: "pointer" }}>Ask Co-pilot</button>
            </div>
          </Card>
        ))}
      </div>

      {/* Sidebar panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card>
          <div style={{ fontFamily: FONTS.display, fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Market Snapshot</div>
          {[
            { label: "Active cultivators (AU)", value: "32", color: COLORS.success },
            { label: "Licensed, no permit", value: "39", color: COLORS.warning },
            { label: "Applications pending", value: "12", color: COLORS.purple },
            { label: "QLD permits (leading)", value: "11", color: COLORS.accent },
            { label: "VIC permits", value: "10", color: COLORS.accent },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 12, color: COLORS.textSecondary }}>{label}</div>
              <div style={{ fontFamily: FONTS.mono, fontWeight: 600, color, fontSize: 16 }}>{value}</div>
            </div>
          ))}
          <div style={{ marginTop: 10, fontSize: 10, color: COLORS.textMuted, fontFamily: FONTS.mono }}>Source: ODC via ACCG · 25 Mar 2026</div>
        </Card>

        <Card>
          <div style={{ fontFamily: FONTS.display, fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Key Deadlines</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Quarterly review readiness (TGA)", date: "15 Jun 2026", urgent: true },
              { label: "TGO 93 SOP gap assessment", date: "20 Jun 2026", urgent: true },
              { label: "Monthly cultivation report", date: "30 Jun 2026", urgent: false },
              { label: "Licence renewal", date: "30 Jun 2026", urgent: false },
              { label: "Q2 adverse event report", date: "15 Jul 2026", urgent: false },
            ].map((d) => (
              <div key={d.label} style={{ padding: "8px 10px", borderRadius: 7, background: d.urgent ? COLORS.dangerDim : `${COLORS.border}40`, border: `1px solid ${d.urgent ? COLORS.danger + "40" : COLORS.border}` }}>
                <div style={{ fontSize: 12, color: COLORS.textPrimary }}>{d.label}</div>
                <div style={{ fontSize: 11, color: d.urgent ? COLORS.danger : COLORS.textMuted, fontFamily: FONTS.mono, marginTop: 2 }}>{d.date}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  </div>
);
