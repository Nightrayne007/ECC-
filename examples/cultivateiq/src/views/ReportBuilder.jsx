import { useState } from "react";
import { FileText, Zap, Download, Eye, Pencil } from "lucide-react";
import { COLORS, FONTS } from "../constants/theme.js";
import { Card } from "../components/Card.jsx";
import { SectionTitle } from "../components/SectionTitle.jsx";
import { AIPlanOutput } from "../components/AIPlanOutput.jsx";
import { PERMIT_GAPS } from "../data/permit-gaps.js";
import { buildReportPrompt } from "../constants/system-prompts.js";
import { useAnthropic } from "../hooks/useAnthropic.js";
import { toCsv, downloadFile } from "../utils/csv.js";

const REPORT_TYPES = [
  { id: "monthly", label: "Monthly Cultivation Report" },
  { id: "incident", label: "Batch Incident Report" },
  { id: "gap-summary", label: "Permit Gap Summary" },
  { id: "quarterly", label: "Quarterly Review Pack" },
];

const CSV_EXPORTS = [
  {
    label: "Tasks CSV",
    filename: "compliance-tasks.csv",
    columns: [
      { key: "id", label: "ID" }, { key: "title", label: "Title" }, { key: "due", label: "Due" },
      { key: "priority", label: "Priority" }, { key: "status", label: "Status" },
    ],
    rows: (ctx) => ctx.tasks,
  },
  {
    label: "Batches CSV",
    filename: "batches.csv",
    columns: [
      { key: "id", label: "Batch ID" }, { key: "strain", label: "Cultivar" }, { key: "stage", label: "Stage" },
      { key: "week", label: "Week" }, { key: "thc", label: "THC" }, { key: "status", label: "Status" }, { key: "planted", label: "Planted" },
    ],
    rows: (ctx) => ctx.batches,
  },
  {
    label: "Permit Gaps CSV",
    filename: "permit-gaps.csv",
    columns: [
      { key: "area", label: "Area" }, { key: "completion", label: "Completion %" }, { key: "status", label: "Status" },
    ],
    rows: () => PERMIT_GAPS,
  },
];

export const ReportBuilder = ({ tasks, batches }) => {
  const [reportType, setReportType] = useState("monthly");
  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.id || null);
  const [draftText, setDraftText] = useState("");
  const [mode, setMode] = useState("edit"); // "edit" | "preview"
  const { send, loading } = useAnthropic();

  const selectedBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];

  const generate = async () => {
    setDraftText("");
    setMode("edit");
    try {
      const text = await send({
        messages: [{
          role: "user",
          content: buildReportPrompt(reportType, { tasks, batches, permitGaps: PERMIT_GAPS, selectedBatch }),
        }],
        maxTokens: 2000,
      });
      setDraftText(text);
    } catch {
      setDraftText("Draft generation failed. Please check your connection and try again.");
    }
  };

  const exportMarkdown = () => {
    const name = REPORT_TYPES.find((r) => r.id === reportType)?.label.toLowerCase().replace(/\s+/g, "-") || "report";
    downloadFile(`${name}.md`, draftText, "text/markdown");
  };

  return (
    <div style={{ padding: "32px 36px", animation: "fadeUp 0.35s ease forwards" }}>
      <SectionTitle sub="AI-drafted ODC report packs seeded from live facility data — edit, then export">Report Builder</SectionTitle>

      {/* Report type chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        {REPORT_TYPES.map((r) => (
          <button key={r.id} onClick={() => setReportType(r.id)} style={{
            padding: "7px 14px", borderRadius: 7, cursor: "pointer",
            background: reportType === r.id ? COLORS.accentGlow : "transparent",
            border: `1px solid ${reportType === r.id ? COLORS.accent : COLORS.border}`,
            color: reportType === r.id ? COLORS.accent : COLORS.textSecondary,
            fontSize: 12, fontFamily: FONTS.body, transition: "all 0.15s ease",
          }}>
            {r.label}
          </button>
        ))}
        {reportType === "incident" && (
          <select value={selectedBatchId || ""} onChange={(e) => setSelectedBatchId(e.target.value)} style={{
            padding: "7px 12px", borderRadius: 7, background: COLORS.surface,
            border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary,
            fontSize: 12, fontFamily: FONTS.mono, outline: "none",
          }}>
            {batches.map((b) => <option key={b.id} value={b.id}>{b.id} — {b.strain}</option>)}
          </select>
        )}
        <button onClick={generate} disabled={loading} style={{
          display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 8,
          background: loading ? COLORS.accentDim : COLORS.accent, marginLeft: "auto",
          border: "none", color: "#fff", fontSize: 13, fontFamily: FONTS.body,
          cursor: loading ? "not-allowed" : "pointer",
        }}>
          {loading ? <div style={{ width: 14, height: 14, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> : <Zap size={14} />}
          {loading ? "Drafting..." : "Generate Draft"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
        {/* Draft editor / preview */}
        <Card style={{ display: "flex", flexDirection: "column", minHeight: 480 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontFamily: FONTS.display, fontSize: 16, fontWeight: 600 }}>Draft</div>
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { id: "edit", label: "Edit", icon: Pencil },
                { id: "preview", label: "Preview", icon: Eye },
              ].map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setMode(id)} style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 6,
                  background: mode === id ? COLORS.accentGlow : "transparent",
                  border: `1px solid ${mode === id ? COLORS.accent : COLORS.border}`,
                  color: mode === id ? COLORS.accent : COLORS.textSecondary,
                  fontSize: 11, fontFamily: FONTS.body, cursor: "pointer",
                }}>
                  <Icon size={12} /> {label}
                </button>
              ))}
            </div>
          </div>

          {!draftText && !loading && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: COLORS.textMuted }}>
              <FileText size={40} style={{ opacity: 0.3 }} />
              <div style={{ fontSize: 13, textAlign: "center", maxWidth: 320 }}>
                Pick a report type and click "Generate Draft". The AI seeds the document with your live task, batch and permit data.
              </div>
            </div>
          )}

          {loading && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, border: `3px solid ${COLORS.border}`, borderTopColor: COLORS.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <div style={{ fontSize: 13, color: COLORS.textSecondary }}>Drafting with live facility data...</div>
            </div>
          )}

          {draftText && !loading && mode === "edit" && (
            <textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              style={{
                flex: 1, minHeight: 420, padding: "14px 16px", borderRadius: 8,
                background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                color: COLORS.textPrimary, fontSize: 13, fontFamily: FONTS.mono,
                lineHeight: 1.7, outline: "none", resize: "vertical",
              }}
            />
          )}

          {draftText && !loading && mode === "preview" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "4px 2px" }}>
              <AIPlanOutput text={draftText} />
            </div>
          )}
        </Card>

        {/* Export panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <div style={{ fontFamily: FONTS.display, fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Export Draft</div>
            <button onClick={exportMarkdown} disabled={!draftText} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%",
              padding: "10px 14px", borderRadius: 8,
              background: draftText ? COLORS.accent : COLORS.accentDim,
              border: "none", color: "#fff", fontSize: 13, fontFamily: FONTS.body,
              cursor: draftText ? "pointer" : "not-allowed",
            }}>
              <Download size={14} /> Markdown (.md)
            </button>
            <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 8, lineHeight: 1.5 }}>
              Exports the editable draft above, including any changes you've made.
            </div>
          </Card>

          <Card>
            <div style={{ fontFamily: FONTS.display, fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Export Data (CSV)</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 12, lineHeight: 1.5 }}>
              Structured data behind the narrative — for spreadsheets or ODC templates.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {CSV_EXPORTS.map((exp) => (
                <button key={exp.label} onClick={() => downloadFile(exp.filename, toCsv(exp.rows({ tasks, batches }), exp.columns), "text/csv")} style={{
                  display: "flex", alignItems: "center", gap: 7, padding: "8px 12px", borderRadius: 7,
                  background: "transparent", border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary,
                  fontSize: 12, fontFamily: FONTS.body, cursor: "pointer", transition: "all 0.15s ease",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.color = COLORS.accent; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textSecondary; }}>
                  <Download size={12} /> {exp.label}
                </button>
              ))}
            </div>
          </Card>

          <div style={{ fontSize: 10, color: COLORS.textMuted, lineHeight: 1.5, padding: "0 4px" }}>
            Drafts require review by the responsible officer before submission to the ODC. AI output may contain placeholders to complete.
          </div>
        </div>
      </div>
    </div>
  );
};
