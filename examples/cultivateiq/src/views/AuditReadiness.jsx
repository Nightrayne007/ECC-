import { useState, useEffect } from "react";
import { ClipboardCheck, Zap, ChevronDown, ShieldAlert } from "lucide-react";
import { COLORS, FONTS } from "../constants/theme.js";
import { Card } from "../components/Card.jsx";
import { Badge } from "../components/Badge.jsx";
import { SectionTitle } from "../components/SectionTitle.jsx";
import { AIPlanOutput } from "../components/AIPlanOutput.jsx";
import { AUDIT_CHECKLIST } from "../data/audit-checklist.js";
import { DOCUMENT_REGISTER } from "../data/document-register.js";
import { buildAuditPrompt } from "../constants/system-prompts.js";
import { useAnthropic } from "../hooks/useAnthropic.js";
import { computeDocStatus } from "../utils/dates.js";

const CHECKLIST_KEY = "cultivateiq.audit.v1";
const STATUS_CYCLE = { incomplete: "in-progress", "in-progress": "complete", complete: "incomplete" };
const STATUS_COLOR = { complete: COLORS.success, "in-progress": COLORS.warning, incomplete: COLORS.danger };
const STATUS_WEIGHT = { complete: 1, "in-progress": 0.5, incomplete: 0 };
const DOC_STATUS_CONFIG = {
  valid: { color: COLORS.success, label: "Valid" },
  "expiring-soon": { color: COLORS.warning, label: "Expiring soon" },
  expired: { color: COLORS.danger, label: "Expired" },
};

function loadChecklist() {
  try {
    const raw = localStorage.getItem(CHECKLIST_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && Array.isArray(parsed)) return parsed;
  } catch {
    // fall through to seed
  }
  return AUDIT_CHECKLIST.map((d) => ({ ...d, items: d.items.map((i) => ({ ...i })) }));
}

export const AuditReadiness = ({ tasks, batches }) => {
  const [checklist, setChecklist] = useState(loadChecklist);
  const [openDomain, setOpenDomain] = useState(AUDIT_CHECKLIST[0].domain);
  const [auditResult, setAuditResult] = useState("");
  const { send, loading } = useAnthropic();

  useEffect(() => {
    try {
      localStorage.setItem(CHECKLIST_KEY, JSON.stringify(checklist));
    } catch (err) {
      console.error("Failed to persist audit checklist:", err);
    }
  }, [checklist]);

  const allItems = checklist.flatMap((d) => d.items);
  const readinessPct = Math.round(
    (100 * allItems.reduce((a, i) => a + (STATUS_WEIGHT[i.status] || 0), 0)) / Math.max(1, allItems.length)
  );

  const documents = DOCUMENT_REGISTER.map((d) => ({ ...d, status: computeDocStatus(d, new Date(), 30) }));

  const cycleItem = (domainName, itemId) => {
    setChecklist((cl) =>
      cl.map((d) =>
        d.domain !== domainName
          ? d
          : { ...d, items: d.items.map((i) => (i.id === itemId ? { ...i, status: STATUS_CYCLE[i.status] || "incomplete" } : i)) }
      )
    );
  };

  const runMockAudit = async () => {
    setAuditResult("");
    try {
      const text = await send({
        messages: [{ role: "user", content: buildAuditPrompt(checklist, documents, { tasks, batches }) }],
        maxTokens: 1500,
      });
      setAuditResult(text);
    } catch {
      setAuditResult("Mock audit failed. Please check your connection and try again.");
    }
  };

  return (
    <div style={{ padding: "32px 36px", animation: "fadeUp 0.35s ease forwards" }}>
      <SectionTitle sub="Stay inspection-ready for the TGA's quarterly compliance reviews — checklist, document register and AI mock audit">Audit Readiness</SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Left: readiness + checklist */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ position: "relative", width: 96, height: 96, flexShrink: 0 }}>
                <svg width="96" height="96" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="40" fill="none" stroke={COLORS.border} strokeWidth="8" />
                  <circle cx="48" cy="48" r="40" fill="none"
                    stroke={readinessPct >= 80 ? COLORS.success : readinessPct >= 60 ? COLORS.warning : COLORS.danger}
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 40 * readinessPct / 100} ${2 * Math.PI * 40}`}
                    strokeDashoffset={2 * Math.PI * 40 * 0.25}
                    strokeLinecap="round" />
                  <text x="48" y="54" textAnchor="middle" fill={COLORS.textPrimary} fontSize="20" fontFamily="Georgia, serif" fontWeight="700">{readinessPct}%</text>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: FONTS.display, fontSize: 17, fontWeight: 600, marginBottom: 4 }}>Quarterly review readiness</div>
                <div style={{ fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.5 }}>
                  First TGA quarterly desk audit window expected shortly after 1 Jul 2026. Click checklist items to cycle their status — progress persists on this device.
                </div>
              </div>
            </div>
          </Card>

          {checklist.map((d) => {
            const isOpen = openDomain === d.domain;
            const done = d.items.filter((i) => i.status === "complete").length;
            return (
              <Card key={d.domain} style={{ padding: "14px 20px" }}>
                <div onClick={() => setOpenDomain(isOpen ? null : d.domain)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                  <div style={{ fontFamily: FONTS.display, fontSize: 15, fontWeight: 600 }}>{d.domain}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: FONTS.mono }}>{done}/{d.items.length}</span>
                    <ChevronDown size={14} color={COLORS.textMuted} style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s ease" }} />
                  </div>
                </div>
                {isOpen && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12, animation: "fadeUp 0.2s ease forwards" }}>
                    {d.items.map((item) => (
                      <button key={item.id} onClick={() => cycleItem(d.domain, item.id)} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
                        padding: "8px 10px", borderRadius: 7, cursor: "pointer", textAlign: "left",
                        background: `${COLORS.border}40`, border: `1px solid ${COLORS.border}`,
                      }}>
                        <span style={{ fontSize: 12, color: COLORS.textPrimary, lineHeight: 1.4 }}>{item.label}</span>
                        <Badge color={STATUS_COLOR[item.status]}>{item.status}</Badge>
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Right: document register + mock audit */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <div style={{ fontFamily: FONTS.display, fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Document Register</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {documents.map((d) => {
                const cfg = DOC_STATUS_CONFIG[d.status];
                return (
                  <div key={d.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
                    padding: "8px 10px", borderRadius: 7,
                    background: d.status === "expired" ? COLORS.dangerDim : `${COLORS.border}40`,
                    border: `1px solid ${d.status === "expired" ? COLORS.danger + "30" : COLORS.border}`,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: COLORS.textPrimary, lineHeight: 1.4 }}>{d.name}</div>
                      <div style={{ fontSize: 10, color: COLORS.textMuted, fontFamily: FONTS.mono, marginTop: 2 }}>{d.category} · expires {d.expires} · {d.owner}</div>
                    </div>
                    <Badge color={cfg.color}>{cfg.label}</Badge>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldAlert size={16} color={COLORS.warning} />
                <div style={{ fontFamily: FONTS.display, fontSize: 16, fontWeight: 600 }}>AI Mock Audit</div>
              </div>
              <button onClick={runMockAudit} disabled={loading} style={{
                display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 8,
                background: loading ? COLORS.accentDim : COLORS.accent,
                border: "none", color: "#fff", fontSize: 13, fontFamily: FONTS.body,
                cursor: loading ? "not-allowed" : "pointer",
              }}>
                {loading ? <div style={{ width: 14, height: 14, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> : <Zap size={14} />}
                {loading ? "Auditing..." : "Run Mock Audit"}
              </button>
            </div>

            {!auditResult && !loading && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: COLORS.textMuted, padding: "24px 0" }}>
                <ClipboardCheck size={36} style={{ opacity: 0.3 }} />
                <div style={{ fontSize: 12, textAlign: "center", maxWidth: 300 }}>
                  An AI auditor interrogates your checklist, document register and overdue tasks, then returns findings ordered by risk.
                </div>
              </div>
            )}

            {loading && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "24px 0" }}>
                <div style={{ width: 36, height: 36, border: `3px solid ${COLORS.border}`, borderTopColor: COLORS.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <div style={{ fontSize: 12, color: COLORS.textSecondary }}>Reviewing your facility like a TGA auditor would...</div>
              </div>
            )}

            {auditResult && !loading && (
              <div style={{ flex: 1, overflowY: "auto" }}>
                <AIPlanOutput text={auditResult} />
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
