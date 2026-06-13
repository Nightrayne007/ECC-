import { useState, useEffect, useCallback } from "react";
import { appendEntry, verifyChain } from "../utils/ledger.js";

const STORAGE_KEY = "cultivateiq.qaledger.v1";

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Append-only four-eyes QA ledger. Entries are hash-chained (see utils/ledger)
// so QA sign-offs cannot be edited after the fact: corrections happen via
// "override" entries that reference the original hash and require a reason
// plus a second, different approver.
export function useQaLedger() {
  const [entries, setEntries] = useState(loadEntries);
  // integrity: null while verifying, then { valid, brokenAt }
  const [integrity, setIntegrity] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (err) {
      console.error("Failed to persist QA ledger:", err);
    }
    let cancelled = false;
    verifyChain(entries).then((result) => {
      if (!cancelled) setIntegrity(result);
    });
    return () => {
      cancelled = true;
    };
  }, [entries]);

  const addCheck = useCallback(
    async ({ batchId, stageKey, checkType, performedBy, verifiedBy, notes }) => {
      if (!performedBy || !verifiedBy) throw new Error("Both a performer and a verifier are required.");
      if (performedBy === verifiedBy) {
        throw new Error("Four-eyes rule: the verifier must be a different person from the performer.");
      }
      const next = await appendEntry(entries, {
        kind: "four-eyes-check",
        batchId,
        stageKey,
        checkType,
        performedBy,
        verifiedBy,
        notes: notes || "",
      });
      setEntries(next);
      return next[next.length - 1];
    },
    [entries]
  );

  const addOverride = useCallback(
    async ({ batchId, stageKey, reason, requestedBy, approvedBy, refHash }) => {
      if (!reason || reason.trim().length < 10) {
        throw new Error("An override requires a documented reason (at least 10 characters).");
      }
      if (!requestedBy || !approvedBy) throw new Error("Overrides require a requester and an approver.");
      if (requestedBy === approvedBy) {
        throw new Error("Four-eyes rule: the override approver must be a different person from the requester.");
      }
      const next = await appendEntry(entries, {
        kind: "override",
        batchId,
        stageKey,
        reason: reason.trim(),
        requestedBy,
        approvedBy,
        refHash: refHash || null,
      });
      setEntries(next);
      return next[next.length - 1];
    },
    [entries]
  );

  // Latest valid four-eyes check (or stage-advance override) for a batch+stage.
  const latestCheckFor = useCallback(
    (batchId, stageKey) => {
      for (let i = entries.length - 1; i >= 0; i--) {
        const p = entries[i].payload;
        if (p.batchId === batchId && p.stageKey === stageKey && (p.kind === "four-eyes-check" || p.kind === "override")) {
          return entries[i];
        }
      }
      return null;
    },
    [entries]
  );

  return { entries, integrity, addCheck, addOverride, latestCheckFor };
}
