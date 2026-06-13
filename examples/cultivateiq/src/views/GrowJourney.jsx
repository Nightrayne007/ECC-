import { useState } from "react";
import { ArrowRight, ShieldCheck, ShieldAlert, Link2, UserCheck, AlertTriangle } from "lucide-react";
import { COLORS, FONTS } from "../constants/theme.js";
import { Card } from "../components/Card.jsx";
import { Badge } from "../components/Badge.jsx";
import { SectionTitle } from "../components/SectionTitle.jsx";
import { Stepper } from "../components/Stepper.jsx";
import { Modal } from "../components/Modal.jsx";
import { WeatherWidget } from "../components/WeatherWidget.jsx";
import { GROW_STAGE_ORDER, STAGE_TARGETS, GROWTH_METRICS_SEED, stageKeyForLabel } from "../data/batch-data.js";
import { PERSONNEL, QA_CHECK_TYPES } from "../data/personnel.js";
import { useQaLedger } from "../hooks/useQaLedger.js";
import { diffDays, parseDate } from "../utils/dates.js";

const inputStyle = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  background: COLORS.surface, border: `1px solid ${COLORS.border}`,
  color: COLORS.textPrimary, fontSize: 13, fontFamily: FONTS.body, outline: "none",
};

const labelStyle = {
  fontSize: 11, color: COLORS.textMuted, fontFamily: FONTS.mono,
  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6,
};

const personName = (id) => PERSONNEL.find((p) => p.id === id)?.name || id;

const LineChart = ({ series, color, unit, height = 80 }) => {
  const points = series.filter((v) => v !== null && v !== undefined);
  if (points.length < 2) return <div style={{ fontSize: 11, color: COLORS.textMuted }}>Not enough data</div>;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const w = 280;
  const coords = points
    .map((v, i) => `${(i / (points.length - 1)) * w},${height - ((v - min) / range) * (height - 10) - 5}`)
    .join(" ");
  return (
    <div>
      <svg width={w} height={height} style={{ display: "block" }}>
        <polyline points={coords} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        {points.map((v, i) => (
          <circle key={i} cx={(i / (points.length - 1)) * w} cy={height - ((v - min) / range) * (height - 10) - 5} r="2.5" fill={color} />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: COLORS.textMuted, fontFamily: FONTS.mono, marginTop: 2 }}>
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
};

export const GrowJourney = ({ batches, advanceBatchStage, selectedId, setSelectedId }) => {
  const { entries, integrity, addCheck, addOverride, latestCheckFor } = useQaLedger();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [qaForm, setQaForm] = useState({ checkType: QA_CHECK_TYPES[0], performedBy: "", verifiedBy: "", notes: "" });
  const [qaError, setQaError] = useState("");
  const [overrideForm, setOverrideForm] = useState({ reason: "", requestedBy: "", approvedBy: "" });
  const [overrideError, setOverrideError] = useState("");

  const batch = batches.find((b) => b.id === selectedId) || batches[0];
  if (!batch) return null;

  const currentKey = stageKeyForLabel(batch.stage);
  const currentIdx = GROW_STAGE_ORDER.findIndex((s) => s.key === currentKey);
  const isTerminal = currentKey === "harvested";
  const nextStage = !isTerminal && currentIdx >= 0 ? GROW_STAGE_ORDER[currentIdx + 1] : null;

  const steps = GROW_STAGE_ORDER.map((stage, i) => {
    const hist = batch.stageHistory.find((e) => e.stage === stage.key);
    let status = "upcoming";
    let meta = stage.targetDays ? `target ${stage.targetDays}d` : "";
    if (hist && hist.actualDays !== null) {
      status = "done";
      meta = `${hist.actualDays}d / ${stage.targetDays}d`;
    } else if (hist) {
      status = "active";
      const elapsed = Math.max(0, diffDays(parseDate(hist.enteredOn), new Date()));
      meta = stage.targetDays ? `${elapsed}d of ${stage.targetDays}d` : `day ${elapsed}`;
    } else if (i < currentIdx) {
      status = "done";
    }
    return { label: stage.label, status, meta };
  });

  const stageCheck = latestCheckFor(batch.id, currentKey);
  const hasStageQa = stageCheck && stageCheck.payload.kind === "four-eyes-check";
  const batchEntries = entries.filter((e) => e.payload.batchId === batch.id).slice().reverse();
  const metrics = GROWTH_METRICS_SEED[batch.id] || [];
  const latestMetrics = metrics[metrics.length - 1];

  const submitQa = async () => {
    setQaError("");
    try {
      await addCheck({
        batchId: batch.id,
        stageKey: currentKey,
        checkType: qaForm.checkType,
        performedBy: qaForm.performedBy,
        verifiedBy: qaForm.verifiedBy,
        notes: qaForm.notes,
      });
      setQaForm({ checkType: QA_CHECK_TYPES[0], performedBy: "", verifiedBy: "", notes: "" });
    } catch (err) {
      setQaError(err.message);
    }
  };

  const requestAdvance = () => {
    if (hasStageQa) setConfirmOpen(true);
    else setOverrideOpen(true);
  };

  const confirmAdvance = () => {
    advanceBatchStage(batch.id);
    setConfirmOpen(false);
  };

  const submitOverride = async () => {
    setOverrideError("");
    try {
      await addOverride({
        batchId: batch.id,
        stageKey: currentKey,
        reason: overrideForm.reason,
        requestedBy: overrideForm.requestedBy,
        approvedBy: overrideForm.approvedBy,
        refHash: stageCheck ? stageCheck.hash : null,
      });
      advanceBatchStage(batch.id);
      setOverrideForm({ reason: "", requestedBy: "", approvedBy: "" });
      setOverrideOpen(false);
    } catch (err) {
      setOverrideError(err.message);
    }
  };

  return (
    <div style={{ padding: "32px 36px", animation: "fadeUp 0.35s ease forwards" }}>
      <SectionTitle sub="Seed-to-harvest tracking with four-eyes QA sign-offs on a tamper-evident ledger">Grow Journey</SectionTitle>

      {/* Batch selector */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {batches.map((b) => {
          const isSel = b.id === batch.id;
          return (
            <button key={b.id} onClick={() => setSelectedId(b.id)} style={{
              padding: "7px 14px", borderRadius: 7, cursor: "pointer",
              background: isSel ? COLORS.accentGlow : "transparent",
              border: `1px solid ${isSel ? COLORS.accent : COLORS.border}`,
              color: isSel ? COLORS.accent : COLORS.textSecondary,
              fontSize: 12, fontFamily: FONTS.mono, transition: "all 0.15s ease",
            }}>
              {b.id} · {b.strain}
            </button>
          );
        })}
      </div>

      {/* Journey stepper */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div style={{ fontFamily: FONTS.display, fontSize: 17, fontWeight: 600 }}>
            {batch.id} — {batch.strain}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: FONTS.mono }}>Planted {batch.planted}</span>
            {!isTerminal && nextStage && (
              <button onClick={requestAdvance} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8,
                background: hasStageQa ? COLORS.accent : COLORS.warningDim,
                border: hasStageQa ? "none" : `1px solid ${COLORS.warning}50`,
                color: hasStageQa ? "#fff" : COLORS.warning, fontSize: 12, fontFamily: FONTS.body, cursor: "pointer",
              }}>
                Advance to {nextStage.label} <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>
        <Stepper steps={steps} />
        {!isTerminal && (
          <div style={{ marginTop: 18, fontSize: 11, color: hasStageQa ? COLORS.accent : COLORS.warning, display: "flex", alignItems: "center", gap: 6 }}>
            {hasStageQa ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
            {hasStageQa
              ? `Stage exit cleared — four-eyes QA recorded for ${batch.stage} (${personName(stageCheck.payload.performedBy)} / verified ${personName(stageCheck.payload.verifiedBy)}).`
              : `No four-eyes QA check recorded for ${batch.stage} yet — advancing will require a documented override with second-person approval.`}
          </div>
        )}
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, marginBottom: 20 }}>
        {/* Growth metrics */}
        <Card>
          <div style={{ fontFamily: FONTS.display, fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Growth Metrics</div>
          {metrics.length === 0 && <div style={{ fontSize: 12, color: COLORS.textMuted }}>No readings recorded for this batch yet.</div>}
          {metrics.length > 0 && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 16 }}>
                <div>
                  <div style={labelStyle}>Room temperature (°C)</div>
                  <LineChart series={metrics.map((m) => m.tempC)} color={COLORS.accent} unit="°C" />
                </div>
                <div>
                  <div style={labelStyle}>Relative humidity (%)</div>
                  <LineChart series={metrics.map((m) => m.humidityPct)} color={COLORS.purple} unit="%" />
                </div>
              </div>
              {latestMetrics && (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Badge color={COLORS.warning}>Light {latestMetrics.lightHours}h</Badge>
                  {latestMetrics.ec !== null && <Badge color={COLORS.accentText}>EC {latestMetrics.ec}</Badge>}
                  {latestMetrics.ph !== null && <Badge color={COLORS.purple}>pH {latestMetrics.ph}</Badge>}
                  <Badge color={COLORS.textMuted}>Last reading {latestMetrics.date}</Badge>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Weather */}
        <WeatherWidget stageTarget={STAGE_TARGETS[currentKey]} />
      </div>

      {/* Four-eyes QA ledger */}
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 20 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <UserCheck size={16} color={COLORS.accent} />
            <div style={{ fontFamily: FONTS.display, fontSize: 16, fontWeight: 600 }}>Record Four-Eyes QA Check</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div style={labelStyle}>Check type</div>
              <select value={qaForm.checkType} onChange={(e) => setQaForm({ ...qaForm, checkType: e.target.value })} style={inputStyle}>
                {QA_CHECK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <div style={labelStyle}>Performed by</div>
              <select value={qaForm.performedBy} onChange={(e) => setQaForm({ ...qaForm, performedBy: e.target.value })} style={inputStyle}>
                <option value="">Select person...</option>
                {PERSONNEL.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.role}</option>)}
              </select>
            </div>
            <div>
              <div style={labelStyle}>Verified by (must differ)</div>
              <select value={qaForm.verifiedBy} onChange={(e) => setQaForm({ ...qaForm, verifiedBy: e.target.value })} style={inputStyle}>
                <option value="">Select person...</option>
                {PERSONNEL.filter((p) => p.id !== qaForm.performedBy).map((p) => <option key={p.id} value={p.id}>{p.name} — {p.role}</option>)}
              </select>
            </div>
            <div>
              <div style={labelStyle}>Notes</div>
              <textarea value={qaForm.notes} onChange={(e) => setQaForm({ ...qaForm, notes: e.target.value })} rows={2} placeholder="Observations, counts, deviations..." style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            {qaError && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "8px 10px", borderRadius: 7, background: COLORS.dangerDim, border: `1px solid ${COLORS.danger}30`, fontSize: 12, color: COLORS.danger }}>
                <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} /> {qaError}
              </div>
            )}
            <button onClick={submitQa} disabled={!qaForm.performedBy || !qaForm.verifiedBy} style={{
              padding: "10px 16px", borderRadius: 8,
              background: qaForm.performedBy && qaForm.verifiedBy ? COLORS.accent : COLORS.accentDim,
              border: "none", color: "#fff", fontSize: 13, fontFamily: FONTS.body,
              cursor: qaForm.performedBy && qaForm.verifiedBy ? "pointer" : "not-allowed",
            }}>
              Sign & Append to Ledger
            </button>
            <div style={{ fontSize: 10, color: COLORS.textMuted, lineHeight: 1.5 }}>
              Entries are hash-chained and append-only. Demo ledger lives in browser storage — production deployments should anchor the chain head to a server or distributed ledger.
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Link2 size={16} color={COLORS.accent} />
              <div style={{ fontFamily: FONTS.display, fontSize: 16, fontWeight: 600 }}>QA Ledger — {batch.id}</div>
            </div>
            {integrity && (
              <Badge color={integrity.valid ? COLORS.success : COLORS.danger}>
                {integrity.valid ? "Chain verified" : `CHAIN BROKEN at #${integrity.brokenAt}`}
              </Badge>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 420, overflowY: "auto" }}>
            {batchEntries.length === 0 && (
              <div style={{ fontSize: 12, color: COLORS.textMuted, textAlign: "center", padding: "20px 0" }}>
                No QA entries for this batch yet. Record the first four-eyes check on the left.
              </div>
            )}
            {batchEntries.map((entry) => {
              const p = entry.payload;
              const isOverride = p.kind === "override";
              const stageLabel = GROW_STAGE_ORDER.find((s) => s.key === p.stageKey)?.label || p.stageKey;
              return (
                <div key={entry.hash} style={{
                  padding: "10px 12px", borderRadius: 8,
                  background: isOverride ? COLORS.warningDim : `${COLORS.border}40`,
                  border: `1px solid ${isOverride ? COLORS.warning + "40" : COLORS.border}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Badge color={isOverride ? COLORS.warning : COLORS.accent}>{isOverride ? "Override" : "QA Check"}</Badge>
                      <span style={{ fontSize: 11, color: COLORS.textSecondary }}>{stageLabel}</span>
                    </div>
                    <span style={{ fontSize: 10, color: COLORS.textMuted, fontFamily: FONTS.mono }}>
                      {new Date(entry.timestamp).toLocaleString("en-AU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {isOverride ? (
                    <>
                      <div style={{ fontSize: 12, color: COLORS.textPrimary, lineHeight: 1.5, marginBottom: 4 }}>{p.reason}</div>
                      <div style={{ fontSize: 11, color: COLORS.textSecondary }}>
                        Requested {personName(p.requestedBy)} · Approved {personName(p.approvedBy)}
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 12, color: COLORS.textPrimary, marginBottom: 4 }}>{p.checkType}{p.notes ? ` — ${p.notes}` : ""}</div>
                      <div style={{ fontSize: 11, color: COLORS.textSecondary }}>
                        Performed {personName(p.performedBy)} · Verified {personName(p.verifiedBy)}
                      </div>
                    </>
                  )}
                  <div style={{ fontSize: 9, color: COLORS.textMuted, fontFamily: FONTS.mono, marginTop: 6, display: "flex", gap: 10 }}>
                    <span>#{entry.index}</span>
                    <span>hash {entry.hash.slice(0, 12)}…</span>
                    <span>prev {entry.prevHash.slice(0, 12)}…</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Confirm advance */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title={`Advance ${batch.id}?`}>
        <div style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.6, marginBottom: 16 }}>
          Move from <strong style={{ color: COLORS.textPrimary }}>{batch.stage}</strong> to{" "}
          <strong style={{ color: COLORS.textPrimary }}>{nextStage?.label}</strong>. The current stage's duration will be locked into the batch record. Stage QA is cleared by a four-eyes check on the ledger.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={confirmAdvance} style={{ flex: 1, padding: "10px 16px", borderRadius: 8, background: COLORS.accent, border: "none", color: "#fff", fontSize: 13, fontFamily: FONTS.body, cursor: "pointer" }}>Advance Stage</button>
          <button onClick={() => setConfirmOpen(false)} style={{ flex: 1, padding: "10px 16px", borderRadius: 8, background: "transparent", border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontSize: 13, fontFamily: FONTS.body, cursor: "pointer" }}>Cancel</button>
        </div>
      </Modal>

      {/* Override required */}
      <Modal open={overrideOpen} onClose={() => setOverrideOpen(false)} title="QA Override Required" width={520}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "10px 12px", borderRadius: 8, background: COLORS.warningDim, border: `1px solid ${COLORS.warning}30`, marginBottom: 14 }}>
          <ShieldAlert size={15} color={COLORS.warning} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12, color: COLORS.textPrimary, lineHeight: 1.5 }}>
            No four-eyes QA check is recorded for <strong>{batch.stage}</strong>. Advancing without one requires a documented override, approved by a second person. The override is permanently appended to the tamper-evident ledger.
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={labelStyle}>Reason for override (required)</div>
            <textarea value={overrideForm.reason} onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })} rows={3} placeholder="e.g. QA Manager off-site; visual inspection completed by two senior staff, formal check to follow within 24h..." style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={labelStyle}>Requested by</div>
              <select value={overrideForm.requestedBy} onChange={(e) => setOverrideForm({ ...overrideForm, requestedBy: e.target.value })} style={inputStyle}>
                <option value="">Select person...</option>
                {PERSONNEL.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <div style={labelStyle}>Approved by (must differ)</div>
              <select value={overrideForm.approvedBy} onChange={(e) => setOverrideForm({ ...overrideForm, approvedBy: e.target.value })} style={inputStyle}>
                <option value="">Select person...</option>
                {PERSONNEL.filter((p) => p.id !== overrideForm.requestedBy).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          {overrideError && (
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "8px 10px", borderRadius: 7, background: COLORS.dangerDim, border: `1px solid ${COLORS.danger}30`, fontSize: 12, color: COLORS.danger }}>
              <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} /> {overrideError}
            </div>
          )}
          <button onClick={submitOverride} style={{
            padding: "10px 16px", borderRadius: 8, background: COLORS.warning,
            border: "none", color: "#16100A", fontWeight: 600, fontSize: 13, fontFamily: FONTS.body, cursor: "pointer",
          }}>
            Record Override & Advance Stage
          </button>
        </div>
      </Modal>
    </div>
  );
};
