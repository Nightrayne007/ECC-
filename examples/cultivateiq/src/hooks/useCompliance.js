import { useState, useEffect, useMemo, useCallback } from "react";
import { COMPLIANCE_TASKS } from "../data/compliance-tasks.js";
import { BATCH_DATA, GROW_STAGE_ORDER, GROW_JOURNEY_SEED, stageKeyForLabel } from "../data/batch-data.js";
import { computeTaskStatus, diffDays, parseDate, toISODate } from "../utils/dates.js";

const STORAGE_KEY = "cultivateiq.compliance.v1";
const PRIORITY_WEIGHT = { high: 3, medium: 2, low: 1 };

function seedState() {
  return {
    version: 1,
    tasks: COMPLIANCE_TASKS.map((t) => ({ ...t, completed: false, snoozedUntil: null })),
    batches: BATCH_DATA.map((b) => ({
      ...b,
      stageHistory: GROW_JOURNEY_SEED[b.id] ? GROW_JOURNEY_SEED[b.id].map((e) => ({ ...e })) : [],
    })),
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.tasks) || !Array.isArray(parsed.batches)) {
      return seedState();
    }
    return parsed;
  } catch {
    return seedState();
  }
}

function nextBatchId(batches) {
  const year = new Date().getFullYear();
  const max = batches.reduce((acc, b) => {
    const n = Number(b.id.split("-").pop());
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 0);
  return `BT-${year}-${String(max + 1).padStart(3, "0")}`;
}

export function useCompliance() {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error("Failed to persist compliance state:", err);
    }
  }, [state]);

  const today = new Date();

  // Derived views: task status and batch week are computed on read so the UI
  // stays live against the real clock.
  const tasks = useMemo(
    () => state.tasks.map((t) => ({ ...t, status: computeTaskStatus(t, today) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.tasks, toISODate(today)]
  );

  const batches = useMemo(
    () =>
      state.batches.map((b) => ({
        ...b,
        week: b.status === "Complete" ? b.week : Math.max(1, Math.ceil(diffDays(parseDate(b.planted), today) / 7)),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.batches, toISODate(today)]
  );

  const complianceScore = useMemo(() => {
    const active = tasks.filter((t) => !t.completed);
    if (active.length === 0) return 100;
    const totalWeight = active.reduce((a, t) => a + (PRIORITY_WEIGHT[t.priority] || 1), 0);
    const overdueWeight = active
      .filter((t) => t.status === "overdue")
      .reduce((a, t) => a + (PRIORITY_WEIGHT[t.priority] || 1), 0);
    return Math.round((100 * (totalWeight - overdueWeight)) / totalWeight);
  }, [tasks]);

  const completeTask = useCallback((id) => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, completed: true } : t)),
    }));
  }, []);

  const snoozeTask = useCallback((id, days = 7) => {
    const until = new Date();
    until.setDate(until.getDate() + days);
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, snoozedUntil: toISODate(until) } : t)),
    }));
  }, []);

  const addTask = useCallback(({ title, due, priority }) => {
    setState((s) => ({
      ...s,
      tasks: [
        ...s.tasks,
        {
          id: s.tasks.reduce((a, t) => Math.max(a, t.id), 0) + 1,
          title,
          due,
          priority: priority || "medium",
          completed: false,
          snoozedUntil: null,
        },
      ],
    }));
  }, []);

  const advanceBatchStage = useCallback((batchId) => {
    setState((s) => ({
      ...s,
      batches: s.batches.map((b) => {
        if (b.id !== batchId) return b;
        const currentKey = stageKeyForLabel(b.stage);
        const idx = GROW_STAGE_ORDER.findIndex((st) => st.key === currentKey);
        if (idx === -1 || idx >= GROW_STAGE_ORDER.length - 1) return b;
        const next = GROW_STAGE_ORDER[idx + 1];
        const nowISO = toISODate(new Date());
        const history = b.stageHistory.map((e, i) =>
          i === b.stageHistory.length - 1 && e.actualDays === null
            ? { ...e, actualDays: Math.max(0, diffDays(parseDate(e.enteredOn), new Date())) }
            : e
        );
        history.push({ stage: next.key, enteredOn: nowISO, targetDays: next.targetDays, actualDays: null });
        return {
          ...b,
          stage: next.label,
          stageHistory: history,
          status: next.key === "harvested" ? "Complete" : b.status === "Action needed" ? "On track" : b.status,
        };
      }),
    }));
  }, []);

  const addBatch = useCallback(({ strain, planted }) => {
    setState((s) => {
      const first = GROW_STAGE_ORDER[0];
      const plantedISO = planted || toISODate(new Date());
      return {
        ...s,
        batches: [
          {
            id: nextBatchId(s.batches),
            strain,
            stage: first.label,
            week: 1,
            thc: "Pending",
            status: "On track",
            planted: plantedISO,
            stageHistory: [{ stage: first.key, enteredOn: plantedISO, targetDays: first.targetDays, actualDays: null }],
          },
          ...s.batches,
        ],
      };
    });
  }, []);

  return { tasks, batches, complianceScore, completeTask, snoozeTask, addTask, advanceBatchStage, addBatch };
}
