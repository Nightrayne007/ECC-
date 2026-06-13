import { useState, useEffect, useRef } from "react";
import { MessageSquare, FileText, Leaf, Zap, BarChart2, ChevronRight, Send, AlertCircle, CheckCircle, Clock, TrendingUp, Shield, BookOpen, Bell, Plus, X, ChevronDown, Loader } from "lucide-react";

const COLORS = {
  bg: "#080D09",
  surface: "#0F1810",
  card: "#141F16",
  cardHover: "#192519",
  border: "#1E3023",
  borderLight: "#2A4030",
  accent: "#3DCC6E",
  accentDim: "#1F6636",
  accentGlow: "rgba(61,204,110,0.12)",
  accentText: "#5DE08A",
  textPrimary: "#E4EDE6",
  textSecondary: "#7A9B82",
  textMuted: "#4A6650",
  danger: "#E05555",
  dangerDim: "rgba(224,85,85,0.12)",
  warning: "#E09A35",
  warningDim: "rgba(224,154,53,0.12)",
  success: "#3DCC6E",
  successDim: "rgba(61,204,110,0.10)",
  purple: "#9B7FE8",
  purpleDim: "rgba(155,127,232,0.12)",
};

const FONTS = {
  display: "'Playfair Display', Georgia, serif",
  body: "'IBM Plex Sans', system-ui, sans-serif",
  mono: "'IBM Plex Mono', 'Courier New', monospace",
};

const gf = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');`;

const globalCSS = `
${gf}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: ${COLORS.bg}; color: ${COLORS.textPrimary}; font-family: ${FONTS.body}; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: ${COLORS.surface}; }
::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: ${COLORS.borderLight}; }
@keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
.fade-up { animation: fadeUp 0.4s ease forwards; }
.pulse { animation: pulse 2s ease-in-out infinite; }
`;

// ─── Data ────────────────────────────────────────────────────────────────────

const COMPLIANCE_TASKS = [
  { id: 1, title: "Monthly cultivation report to ODC", due: "2026-03-31", status: "overdue", priority: "high" },
  { id: 2, title: "Batch record BT-2026-041 sign-off", due: "2026-03-28", status: "due-today", priority: "high" },
  { id: 7, title: "Quarterly compliance review readiness (TGA, effective 1 Jul 2026)", due: "2026-06-15", status: "upcoming", priority: "high" },
  { id: 3, title: "Pest management SOP review", due: "2026-04-05", status: "upcoming", priority: "medium" },
  { id: 8, title: "TGO 93 labelling & packaging SOP gap assessment", due: "2026-05-20", status: "upcoming", priority: "medium" },
  { id: 4, title: "Storage facility temperature logs", due: "2026-04-10", status: "upcoming", priority: "medium" },
  { id: 5, title: "Staff training records update", due: "2026-04-15", status: "upcoming", priority: "low" },
  { id: 6, title: "Annual licence renewal application", due: "2026-06-30", status: "upcoming", priority: "high" },
];

const INTEL_ITEMS = [
  {
    id: 5, date: "26 Mar 2026", source: "TGA",
    title: "TGA confirms quarterly compliance reviews for medicinal cannabis from FY2026-27",
    summary: "Medicinal cannabis has been named a top-tier focus area in the TGA's 2026-27 Compliance Priorities. Cultivation and manufacturing licence holders will move from annual assessments to quarterly desk audits from 1 July 2026 — the most intense review cadence since legalisation in 2016.",
    tag: "Deadline", tagColor: COLORS.danger,
  },
  {
    id: 6, date: "20 Mar 2026", source: "TGA",
    title: "TGO 93 rewrite progresses: GMP-equivalent imports, child-resistant packaging proposed",
    summary: "Consultation on reforms to medicinal cannabis manufacturing, labelling and packaging requirements has closed. TGA is drafting an updated Therapeutic Goods Order No. 93 introducing GMP-equivalence for imported products and mandatory child-resistant closures; transition periods are still being finalised.",
    tag: "Regulatory", tagColor: COLORS.warning,
  },
  {
    id: 1, date: "25 Mar 2026", source: "Office of Drug Control",
    title: "ODC confirms 32 active cultivation facilities across Australia",
    summary: "Queensland leads with 11 permits, Victoria follows with 10. 39 licenced holders remain without a cultivation permit. 12 applications under active consideration.",
    tag: "Market Data", tagColor: COLORS.purple,
  },
  {
    id: 2, date: "18 Mar 2026", source: "TGA",
    title: "Updated GMP guidelines for medicinal cannabis manufacturers",
    summary: "TGA has released updated manufacturing guidance affecting record-keeping obligations for cultivation-to-manufacture supply chains.",
    tag: "Regulatory", tagColor: COLORS.warning,
  },
  {
    id: 3, date: "12 Mar 2026", source: "Narcotic Drugs Act",
    title: "Reminder: Quarterly adverse event reporting windows",
    summary: "Q1 2026 adverse event reports due by 15 April. Ensure all cultivation incidents logged in your QMS are included.",
    tag: "Deadline", tagColor: COLORS.danger,
  },
  {
    id: 4, date: "5 Mar 2026", source: "Dept. of Health",
    title: "Fiji sugar industry cross-border supply chain opportunity",
    summary: "Pacific region regulatory harmonisation discussions continuing. AU cultivators exploring export pathways to Pacific markets.",
    tag: "Opportunity", tagColor: COLORS.success,
  },
];

const BATCH_DATA = [
  { id: "BT-2026-039", strain: "Bedrocan T22", stage: "Flowering", week: 7, thc: "Est. 21.4%", status: "On track", planted: "2026-01-28" },
  { id: "BT-2026-040", strain: "CBD Crew CBD+", stage: "Vegetative", week: 3, thc: "Est. 1.1%", status: "On track", planted: "2026-03-04" },
  { id: "BT-2026-041", strain: "Tilray T9", stage: "Harvest ready", week: 10, thc: "Est. 9.2%", status: "Action needed", planted: "2025-12-18" },
  { id: "BT-2026-038", strain: "Bedrocan T22", stage: "Drying", week: 11, thc: "Tested 22.1%", status: "Complete", planted: "2025-12-10" },
];

const PERMIT_GAPS = [
  { area: "Security systems documentation", completion: 85, status: "In progress" },
  { area: "Standard Operating Procedures", completion: 60, status: "Incomplete" },
  { area: "Personnel qualifications records", completion: 95, status: "Near complete" },
  { area: "Premises floor plan & specifications", completion: 100, status: "Complete" },
  { area: "Waste disposal protocols", completion: 40, status: "Incomplete" },
  { area: "Record-keeping system description", completion: 70, status: "In progress" },
  { area: "TGO 93 labelling & packaging readiness", completion: 30, status: "Incomplete" },
];

// Reform pipeline reshaping the cultivation compliance landscape — surfaced in the
// Reform Tracker and used to ground the Co-pilot and AI briefings in the current
// regulatory environment (status as at 27 Mar 2026; confirm specifics with TGA/ODC).
const REFORM_TRACKER = [
  {
    id: 1,
    regulator: "TGA",
    area: "Compliance cadence",
    title: "Quarterly compliance reviews replace the annual cycle",
    status: "Confirmed",
    statusColor: COLORS.danger,
    timeline: "Effective from 1 Jul 2026 (FY2026-27)",
    summary: "Medicinal cannabis has been named a top-tier focus area in the TGA's 2026-27 Compliance Priorities. Cultivation and manufacturing licence holders move from annual assessments to quarterly desk audits.",
    impact: "Cultivation logs, QMS records and batch documentation will need to be audit-ready every quarter from July, not just at annual renewal. Expect the first quarterly review window to open shortly after FY start.",
    actionPrompt: "Draft a quarterly compliance review readiness checklist for our QLD cultivation facility ahead of the TGA's move to quarterly desk audits from 1 July 2026.",
  },
  {
    id: 2,
    regulator: "TGA",
    area: "Manufacturing & labelling",
    title: "TGO 93 rewrite: GMP-equivalent imports & child-resistant packaging",
    status: "Drafting",
    statusColor: COLORS.warning,
    timeline: "Consultation closed — exposure draft & transition period TBC",
    summary: "TGA is finalising a rewritten Therapeutic Goods Order No. 93, introducing GMP-equivalence for imported medicinal cannabis, mandatory child-resistant closures, and clearer active-ingredient label statements, with amendments to the Therapeutic Goods Regulation 1990 and Narcotic Drugs Regulation 2016.",
    impact: "Primary packaging and labelling SOPs for product leaving the cultivation site for manufacture should be reviewed now so the facility isn't caught short once the transition period opens.",
    actionPrompt: "Explain how the proposed TGO 93 rewrite (GMP-equivalence, child-resistant packaging, clearer labelling) could affect a QLD cultivation permit holder supplying dried flower to manufacturers, and what SOP changes to prepare now.",
  },
  {
    id: 3,
    regulator: "TGA / ODC",
    area: "SAS, AP & compounding",
    title: "SAS/AP streamlining and Category 5 (>98% THC) removal proposal",
    status: "Under development",
    statusColor: COLORS.purple,
    timeline: "Narcotic Drugs Regulation 2016 amendments in development",
    summary: "Proposed reforms would drop the TGO 93 declaration form from Special Access Scheme and Authorised Prescriber applications, require prior SAS approval before extemporaneous compounding, and — per AMA-backed recommendations — remove Category 5 (>98% THC) products from the framework entirely.",
    impact: "No direct change to the cultivation licence, but removal of Category 5 could soften manufacturer demand for isolate-grade, ultra-high-THC inputs — worth factoring into strain planning for future high-THC batches.",
    actionPrompt: "If Category 5 (>98% THC) medicinal cannabis products are removed from the TGO 93 framework, how might that affect demand for ultra-high-THC cultivars, and should we adjust our cultivation strain mix?",
  },
  {
    id: 4,
    regulator: "ODC",
    area: "Enforcement",
    title: "Heightened site inspections and enforcement activity",
    status: "Active now",
    statusColor: COLORS.danger,
    timeline: "Ongoing through 2026",
    summary: "Recent enforcement action against non-compliant licence holders has produced fines exceeding $100,000, alongside a marked increase in unannounced inspection frequency across the cultivation sector.",
    impact: "Security documentation, SOP currency and record-keeping need to withstand an unannounced inspection at any time — this overlaps directly with the open items in your Permit Accelerator gap analysis.",
    actionPrompt: "Given heightened ODC enforcement and unannounced inspections, what should we have ready at all times, and how should our current permit gap areas be prioritised in response?",
  },
];

// ─── Shared Components ────────────────────────────────────────────────────────

const Badge = ({ children, color = COLORS.accent, bg }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "2px 8px", borderRadius: 4,
    fontSize: 11, fontFamily: FONTS.mono, fontWeight: 500, letterSpacing: "0.04em",
    color: color, background: bg || `${color}18`,
    border: `1px solid ${color}30`,
  }}>{children}</span>
);

const Card = ({ children, style, onClick, hoverable }) => {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => hoverable && setHov(true)}
      onMouseLeave={() => hoverable && setHov(false)}
      style={{
        background: hov ? COLORS.cardHover : COLORS.card,
        border: `1px solid ${hov ? COLORS.borderLight : COLORS.border}`,
        borderRadius: 12, padding: "20px 24px",
        transition: "all 0.2s ease",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}>{children}</div>
  );
};

const StatCard = ({ label, value, sub, icon: Icon, color = COLORS.accent, anim }) => (
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

const SectionTitle = ({ children, sub }) => (
  <div style={{ marginBottom: 20 }}>
    <h2 style={{ fontFamily: FONTS.display, fontSize: 24, fontWeight: 600, color: COLORS.textPrimary }}>{children}</h2>
    {sub && <p style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 4 }}>{sub}</p>}
  </div>
);

// Renders a numbered AI action plan / briefing with accent highlights for steps.
const AIPlanOutput = ({ text }) => (
  <>
    {text.split("\n").map((line, i) => {
      if (line.match(/^\d+\./)) return (
        <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12, padding: "10px 12px", background: COLORS.accentGlow, borderRadius: 8, border: `1px solid ${COLORS.accentDim}` }}>
          <div style={{ fontSize: 12, color: COLORS.accent, fontFamily: FONTS.mono, fontWeight: 600, flexShrink: 0, marginTop: 1 }}>{line.match(/^\d+/)[0]}.</div>
          <div style={{ fontSize: 13, color: COLORS.textPrimary, lineHeight: 1.6 }}>{line.replace(/^\d+\.\s*\*\*[^*]+\*\*:?\s*/, "").replace(/\*\*/g, "")}</div>
        </div>
      );
      if (line === "") return <div key={i} style={{ height: 4 }} />;
      return <div key={i} style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.6, marginBottom: 4 }}>{line.replace(/\*\*/g, "")}</div>;
    })}
  </>
);

// ─── Sidebar ─────────────────────────────────────────────────────────────────

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: BarChart2 },
  { id: "copilot", label: "Compliance Co-pilot", icon: MessageSquare },
  { id: "permit", label: "Permit Accelerator", icon: Shield },
  { id: "batches", label: "Cultivation Log", icon: Leaf },
  { id: "reforms", label: "Reform Tracker", icon: TrendingUp },
  { id: "intel", label: "Intel Feed", icon: Zap },
];

const Sidebar = ({ active, setActive }) => (
  <div style={{
    width: 220, flexShrink: 0, background: COLORS.surface,
    borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column",
    height: "100vh", position: "sticky", top: 0,
  }}>
    {/* Logo */}
    <div style={{ padding: "28px 24px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
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
    <div style={{ padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
      <div style={{ fontSize: 10, color: COLORS.textMuted, fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Active Facility</div>
      <div style={{ fontSize: 13, color: COLORS.textSecondary, fontWeight: 500 }}>Suncoast Botanicals Pty Ltd</div>
      <div style={{ marginTop: 6 }}><Badge color={COLORS.accent}>QLD · Permit Active</Badge></div>
    </div>

    {/* Nav */}
    <nav style={{ padding: "12px 12px", flex: 1 }}>
      {NAV.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button key={id} onClick={() => setActive(id)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer",
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
    <div style={{ padding: "16px 20px", borderTop: `1px solid ${COLORS.border}` }}>
      <div style={{ fontSize: 10, color: COLORS.textMuted, fontFamily: FONTS.mono }}>ODC LICENCE</div>
      <div style={{ fontSize: 12, color: COLORS.textSecondary, fontFamily: FONTS.mono, marginTop: 2 }}>MC-2024-QLD-0047</div>
    </div>
  </div>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────

const Dashboard = ({ setActive, onAskCopilot }) => {
  const [reformBannerDismissed, setReformBannerDismissed] = useState(false);
  const overdue = COMPLIANCE_TASKS.filter(t => t.status === "overdue").length;

  return (
    <div style={{ padding: "32px 36px", animation: "fadeUp 0.35s ease forwards" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: FONTS.mono, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Friday, 27 March 2026</div>
        <h1 style={{ fontFamily: FONTS.display, fontSize: 32, fontWeight: 700, color: COLORS.textPrimary }}>Good morning, Rayneol</h1>
        <p style={{ fontSize: 14, color: COLORS.textSecondary, marginTop: 4 }}>Your facility has {overdue} overdue task{overdue !== 1 ? "s" : ""} requiring attention.</p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        <StatCard label="Compliance Score" value="78%" sub="↑ 4% from last month" icon={Shield} color={COLORS.accent} anim="fadeUp 0.3s ease forwards" />
        <StatCard label="Active Batches" value="3" sub="1 harvest-ready" icon={Leaf} color={COLORS.purple} anim="fadeUp 0.35s ease forwards" />
        <StatCard label="Overdue Tasks" value={overdue} sub="Immediate action needed" icon={AlertCircle} color={COLORS.danger} anim="fadeUp 0.4s ease forwards" />
        <StatCard label="Permit Status" value="Active" sub="Renewal in 95 days" icon={CheckCircle} color={COLORS.success} anim="fadeUp 0.45s ease forwards" />
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
            <Badge color={overdue > 0 ? COLORS.danger : COLORS.accent}>{overdue} overdue</Badge>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {COMPLIANCE_TASKS.slice(0, 5).map(task => {
              const statusConfig = {
                overdue: { color: COLORS.danger, label: "Overdue", bg: COLORS.dangerDim },
                "due-today": { color: COLORS.warning, label: "Due today", bg: COLORS.warningDim },
                upcoming: { color: COLORS.textMuted, label: "Upcoming", bg: "transparent" },
              }[task.status];
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
                    <Badge color={statusConfig.color}>{statusConfig.label}</Badge>
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
            {BATCH_DATA.map(b => {
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
            { label: "Draft ODC Report", icon: FileText, view: "copilot" },
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
              onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.color = COLORS.accent; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textSecondary; }}>
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Compliance Co-pilot (AI Chat) ────────────────────────────────────────────

const STARTER_PROMPTS = [
  "Draft a monthly cultivation report for ODC",
  "Generate an SOP for pest management",
  "What are my Q1 2026 reporting obligations?",
  "Help me write a batch incident report",
  "Explain the permit renewal process",
  "What do the 2026-27 TGA reforms mean for us?",
];

const SYSTEM_PROMPT = `You are CultivateIQ's Compliance Co-pilot — an expert AI assistant specialising in Australian medicinal cannabis regulatory compliance.

Your expertise covers:
- The Narcotic Drugs Act 1967 (Cth) and associated regulations
- Office of Drug Control (ODC) requirements for medicinal cannabis licence holders and permit holders
- TGA manufacturing and quality standards as they relate to cannabis cultivation
- Standard Operating Procedure (SOP) drafting for cannabis cultivation facilities
- Batch record keeping, cultivation logs, and QMS documentation
- Adverse event reporting requirements
- Permit application processes and common gap areas
- Australian state-specific requirements (Queensland, Victoria, etc.)
- The incoming TGA/ODC reform pipeline for 2026-27 (see "Regulatory landscape watch" below)

The user's facility context:
- Facility: Suncoast Botanicals Pty Ltd
- Location: Queensland
- ODC Licence: MC-2024-QLD-0047 (active)
- Status: Active cultivation permit holder
- Current date: 27 March 2026

Regulatory landscape watch (status as at 27 March 2026 — confirm specifics with TGA/ODC before acting):
- TGA's 2026-27 Compliance Priorities name medicinal cannabis as a top enforcement focus, moving licence holders from annual to quarterly compliance reviews effective 1 July 2026.
- TGA is finalising a rewrite of Therapeutic Goods Order No. 93 (Standard for Medicinal Cannabis), introducing GMP-equivalence requirements for imported products, mandatory child-resistant closures, and clearer active-ingredient labelling, with flow-on amendments to the Therapeutic Goods Regulation 1990 and Narcotic Drugs Regulation 2016. Consultation has closed; the exposure draft and transition period are still pending.
- Proposed amendments would remove the TGO 93 declaration form from Special Access Scheme (SAS) and Authorised Prescriber applications, require prior SAS approval before extemporaneous compounding, and (per AMA-backed recommendations) remove Category 5 (>98% THC) products from the framework entirely.
- ODC/TGA enforcement activity has intensified, with fines exceeding $100,000 issued to non-compliant licence holders and a marked increase in unannounced site inspections.

When relevant, connect the user's questions to this reform pipeline and flag preparatory actions — but always note where exact transition dates or drafting details are still subject to confirmation by the TGA or ODC.

Your responses should be:
- Specific, practical, and actionable
- Written with regulatory precision
- Formatted with clear sections using markdown when helpful
- Aware that Queensland leads cultivation with 11 permits, Victoria has 10

When drafting documents, use professional Australian regulatory language. Always note if something requires verification with a qualified lawyer or the ODC directly.`;

const ComplianceCopilot = ({ pendingPrompt, onPromptConsumed }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "I encountered an error. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Please check your network and try again." }]);
    }
    setLoading(false);
  };

  // Allow other views (Reform Tracker, Intel Feed) to hand off a prefilled question.
  useEffect(() => {
    if (pendingPrompt) {
      send(pendingPrompt);
      onPromptConsumed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPrompt]);

  const formatMessage = (text) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("# ")) return <div key={i} style={{ fontFamily: FONTS.display, fontSize: 18, fontWeight: 600, color: COLORS.textPrimary, margin: "12px 0 6px" }}>{line.slice(2)}</div>;
      if (line.startsWith("## ")) return <div key={i} style={{ fontFamily: FONTS.body, fontSize: 14, fontWeight: 600, color: COLORS.accentText, margin: "10px 0 4px" }}>{line.slice(3)}</div>;
      if (line.startsWith("### ")) return <div key={i} style={{ fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: COLORS.textSecondary, margin: "8px 0 2px" }}>{line.slice(4)}</div>;
      if (line.startsWith("- ") || line.startsWith("* ")) return <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: COLORS.textPrimary, margin: "2px 0", paddingLeft: 4 }}><span style={{ color: COLORS.accent, flexShrink: 0, marginTop: 2 }}>·</span><span>{line.slice(2)}</span></div>;
      if (line.match(/^\d+\. /)) return <div key={i} style={{ fontSize: 13, color: COLORS.textPrimary, margin: "2px 0", paddingLeft: 4 }}>{line}</div>;
      if (line === "") return <div key={i} style={{ height: 6 }} />;
      return <div key={i} style={{ fontSize: 13, color: COLORS.textPrimary, lineHeight: 1.7 }}>{line}</div>;
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", padding: "28px 36px 0", animation: "fadeUp 0.35s ease forwards" }}>
      <div style={{ marginBottom: 20 }}>
        <SectionTitle sub="AI-powered regulatory guidance and document drafting for Australian cannabis compliance">Compliance Co-pilot</SectionTitle>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {STARTER_PROMPTS.map(p => (
            <button key={p} onClick={() => send(p)} style={{
              padding: "6px 12px", borderRadius: 6, border: `1px solid ${COLORS.border}`,
              background: "transparent", color: COLORS.textSecondary, fontSize: 12,
              fontFamily: FONTS.body, cursor: "pointer", transition: "all 0.15s ease",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.color = COLORS.accent; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textSecondary; }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", marginBottom: 16, paddingRight: 4 }}>
        {messages.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: COLORS.accentGlow, border: `1px solid ${COLORS.accentDim}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <MessageSquare size={28} color={COLORS.accent} />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: FONTS.display, fontSize: 20, color: COLORS.textPrimary, marginBottom: 6 }}>Your compliance expert, always on</div>
              <div style={{ fontSize: 13, color: COLORS.textSecondary, maxWidth: 380 }}>Ask anything about ODC requirements, draft reports and SOPs, or get guidance on your permit obligations and the incoming TGA reforms.</div>
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{
            display: "flex", gap: 12, marginBottom: 20,
            flexDirection: m.role === "user" ? "row-reverse" : "row",
            animation: "fadeUp 0.25s ease forwards",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: m.role === "user" ? COLORS.accentDim : COLORS.surface,
              border: `1px solid ${m.role === "user" ? COLORS.accent + "40" : COLORS.border}`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
              color: m.role === "user" ? COLORS.accent : COLORS.textSecondary,
              fontFamily: FONTS.mono,
            }}>
              {m.role === "user" ? "R" : <Leaf size={14} color={COLORS.accent} />}
            </div>
            <div style={{
              maxWidth: "72%",
              background: m.role === "user" ? COLORS.accentGlow : COLORS.card,
              border: `1px solid ${m.role === "user" ? COLORS.accent + "30" : COLORS.border}`,
              borderRadius: 12, padding: "12px 16px",
            }}>
              {m.role === "assistant" ? formatMessage(m.content) : (
                <div style={{ fontSize: 13, color: COLORS.textPrimary }}>{m.content}</div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 12, marginBottom: 20, animation: "fadeUp 0.25s ease forwards" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: COLORS.surface, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Leaf size={14} color={COLORS.accent} />
            </div>
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "14px 18px", display: "flex", gap: 6, alignItems: "center" }}>
              {[0, 0.2, 0.4].map((d, i) => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.accent, animation: `pulse 1.2s ease-in-out ${d}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "16px 0 24px",
        borderTop: `1px solid ${COLORS.border}`,
      }}>
        <div style={{
          display: "flex", gap: 10, background: COLORS.card,
          border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "10px 12px",
          transition: "border-color 0.15s ease",
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask about ODC requirements, draft an SOP, or get compliance guidance..."
            rows={1}
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: COLORS.textPrimary, fontSize: 13, fontFamily: FONTS.body,
              resize: "none", lineHeight: 1.6,
            }}
          />
          <button onClick={() => send()} disabled={!input.trim() || loading} style={{
            padding: "6px 14px", borderRadius: 7,
            background: input.trim() && !loading ? COLORS.accent : COLORS.accentDim,
            border: "none", cursor: input.trim() && !loading ? "pointer" : "not-allowed",
            color: "#fff", display: "flex", alignItems: "center", gap: 6, fontSize: 13,
            fontFamily: FONTS.body, transition: "all 0.15s ease",
          }}>
            <Send size={14} />
          </button>
        </div>
        <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 6, textAlign: "center" }}>Always verify critical compliance decisions with the ODC or a qualified lawyer.</div>
      </div>
    </div>
  );
};

// ─── Permit Accelerator ───────────────────────────────────────────────────────

const PermitAccelerator = () => {
  const [analysing, setAnalysing] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [done, setDone] = useState(false);

  const overallPct = Math.round(PERMIT_GAPS.reduce((a, g) => a + g.completion, 0) / PERMIT_GAPS.length);

  const runAnalysis = async () => {
    setAnalysing(true);
    setAiResult("");
    setDone(false);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are an expert in Australian ODC medicinal cannabis permit applications.

A facility has these gap areas with completion percentages:
${PERMIT_GAPS.map(g => `- ${g.area}: ${g.completion}% complete (${g.status})`).join("\n")}

Overall readiness: ${overallPct}%

Note: TGA is also moving cultivation licence holders to quarterly compliance reviews from FY2026-27 and is rewriting Therapeutic Goods Order No. 93 (GMP-equivalence for imports, child-resistant packaging, clearer labelling). Factor these incoming obligations into your prioritisation where relevant.

Provide a prioritised action plan (3-4 specific actions) to reach permit application readiness. Be concise, practical, and specific to ODC requirements. Format with numbered actions and brief explanations.`
          }],
        }),
      });
      const data = await res.json();
      setAiResult(data.content?.[0]?.text || "Analysis unavailable.");
    } catch {
      setAiResult("Analysis failed. Please check your connection and try again.");
    }
    setAnalysing(false);
    setDone(true);
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
              {PERMIT_GAPS.map(g => {
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

// ─── Cultivation Log ──────────────────────────────────────────────────────────

const CultivationLog = () => {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ padding: "32px 36px", animation: "fadeUp 0.35s ease forwards" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <SectionTitle sub="Active cultivation batches and ODC-compliant record keeping">Cultivation Log</SectionTitle>
        <button style={{
          display: "flex", alignItems: "center", gap: 7, padding: "9px 16px",
          borderRadius: 8, background: COLORS.accent, border: "none",
          color: "#fff", fontSize: 13, fontFamily: FONTS.body, cursor: "pointer",
        }}>
          <Plus size={14} /> New Batch
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {BATCH_DATA.map(b => {
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
                      ["Last log", "26 Mar 2026"],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: FONTS.mono, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{k}</div>
                        <div style={{ fontSize: 13, color: COLORS.textPrimary, fontFamily: FONTS.mono }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ padding: "7px 14px", borderRadius: 7, background: "transparent", border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontSize: 12, fontFamily: FONTS.body, cursor: "pointer" }}>Add Log Entry</button>
                    <button style={{ padding: "7px 14px", borderRadius: 7, background: "transparent", border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontSize: 12, fontFamily: FONTS.body, cursor: "pointer" }}>View Full Record</button>
                    <button style={{ padding: "7px 14px", borderRadius: 7, background: COLORS.accentGlow, border: `1px solid ${COLORS.accentDim}`, color: COLORS.accent, fontSize: 12, fontFamily: FONTS.body, cursor: "pointer" }}>Export ODC Report</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Reform Tracker ───────────────────────────────────────────────────────────

const ReformTracker = ({ onAskCopilot }) => {
  const [expanded, setExpanded] = useState(REFORM_TRACKER[0].id);
  const [briefing, setBriefing] = useState("");
  const [briefingLoading, setBriefingLoading] = useState(false);

  const runBriefing = async () => {
    setBriefingLoading(true);
    setBriefing("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are advising an Australian medicinal cannabis cultivation permit holder (Suncoast Botanicals Pty Ltd, Queensland, ODC licence MC-2024-QLD-0047) on incoming TGA/ODC regulatory reforms.

Reform pipeline:
${REFORM_TRACKER.map(r => `- [${r.regulator}] ${r.title} — ${r.status} (${r.timeline}). ${r.summary}`).join("\n")}

Current permit gap areas:
${PERMIT_GAPS.map(g => `- ${g.area}: ${g.completion}% complete (${g.status})`).join("\n")}

Provide a prioritised 90-day readiness briefing (3-4 numbered actions) connecting the reform pipeline to this facility's existing gaps. Be concise and practical, and note where reform details are still subject to confirmation by the TGA/ODC.`
          }],
        }),
      });
      const data = await res.json();
      setBriefing(data.content?.[0]?.text || "Briefing unavailable.");
    } catch {
      setBriefing("Briefing failed. Please check your connection and try again.");
    }
    setBriefingLoading(false);
  };

  return (
    <div style={{ padding: "32px 36px", animation: "fadeUp 0.35s ease forwards" }}>
      <SectionTitle sub="Tracking TGA and ODC reform proposals reshaping medicinal cannabis cultivation compliance">Reform Tracker</SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>
        {/* Timeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {REFORM_TRACKER.map(item => {
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
                      onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.color = COLORS.accent; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textSecondary; }}>
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
              Reform statuses reflect publicly announced TGA/ODC proposals as at 27 Mar 2026. Confirm current requirements with the ODC or TGA before acting.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ─── Intel Feed ───────────────────────────────────────────────────────────────

const IntelFeed = ({ onAskCopilot }) => (
  <div style={{ padding: "32px 36px", animation: "fadeUp 0.35s ease forwards" }}>
    <SectionTitle sub="AI-summarised regulatory updates from the ODC, TGA and Dept. of Health">Intel Feed</SectionTitle>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {INTEL_ITEMS.map(item => (
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
              { label: "Q1 adverse event report", date: "15 Apr 2026", urgent: true },
              { label: "Monthly cultivation report", date: "31 Mar 2026", urgent: true },
              { label: "TGO 93 SOP gap assessment", date: "20 May 2026", urgent: false },
              { label: "Quarterly review readiness (TGA)", date: "15 Jun 2026", urgent: false },
              { label: "Licence renewal", date: "30 Jun 2026", urgent: false },
            ].map(d => (
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

// ─── App Root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [active, setActive] = useState("dashboard");
  const [pendingPrompt, setPendingPrompt] = useState(null);

  const askCopilot = (prompt) => {
    setPendingPrompt(prompt);
    setActive("copilot");
  };

  const VIEW = {
    dashboard: <Dashboard setActive={setActive} onAskCopilot={askCopilot} />,
    copilot: <ComplianceCopilot pendingPrompt={pendingPrompt} onPromptConsumed={() => setPendingPrompt(null)} />,
    permit: <PermitAccelerator />,
    batches: <CultivationLog />,
    reforms: <ReformTracker onAskCopilot={askCopilot} />,
    intel: <IntelFeed onAskCopilot={askCopilot} />,
  };

  return (
    <>
      <style>{globalCSS}</style>
      <div style={{ display: "flex", minHeight: "100vh", background: COLORS.bg }}>
        <Sidebar active={active} setActive={setActive} />
        <main style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
          {VIEW[active]}
        </main>
      </div>
    </>
  );
}
