import { useState, useEffect, useMemo } from "react";
import { REFORM_TRACKER } from "../data/reform-tracker.js";
import { DOCUMENT_REGISTER } from "../data/document-register.js";
import { diffDays, parseDate } from "../utils/dates.js";

const CONFIG_KEY = "cultivateiq.alertConfig.v1";
const SEVERITY_RANK = { overdue: 0, critical: 1, upcoming: 2 };

function loadLeadDays() {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && Number.isFinite(parsed.leadDays) ? parsed.leadDays : 7;
  } catch {
    return 7;
  }
}

// Derives a unified alert list from live task state, reform key dates, and
// document expiries. Pure derivation — only the lead-time config persists.
export function useAlerts({ tasks }) {
  const [leadDays, setLeadDays] = useState(loadLeadDays);

  useEffect(() => {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify({ leadDays }));
    } catch (err) {
      console.error("Failed to persist alert config:", err);
    }
  }, [leadDays]);

  const alerts = useMemo(() => {
    const today = new Date();
    const list = [];

    tasks
      .filter((t) => !t.completed && t.status !== "snoozed")
      .forEach((t) => {
        const days = diffDays(today, parseDate(t.due));
        if (days < 0) {
          list.push({ id: `task-${t.id}`, type: "task", severity: "overdue", title: t.title, dueDate: t.due, daysRemaining: days, view: "dashboard" });
        } else if (days <= leadDays) {
          list.push({ id: `task-${t.id}`, type: "task", severity: days <= 1 ? "critical" : "upcoming", title: t.title, dueDate: t.due, daysRemaining: days, view: "dashboard" });
        }
      });

    REFORM_TRACKER.filter((r) => r.keyDate).forEach((r) => {
      const days = diffDays(today, parseDate(r.keyDate));
      if (days >= 0 && days <= leadDays) {
        list.push({ id: `reform-${r.id}`, type: "reform", severity: days <= 1 ? "critical" : "upcoming", title: r.title, dueDate: r.keyDate, daysRemaining: days, view: "reforms" });
      }
    });

    DOCUMENT_REGISTER.forEach((d) => {
      const days = diffDays(today, parseDate(d.expires));
      if (days < 0) {
        list.push({ id: `doc-${d.id}`, type: "document", severity: "overdue", title: `${d.name} expired`, dueDate: d.expires, daysRemaining: days, view: "audit" });
      } else if (days <= leadDays) {
        list.push({ id: `doc-${d.id}`, type: "document", severity: days <= 1 ? "critical" : "upcoming", title: `${d.name} expiring`, dueDate: d.expires, daysRemaining: days, view: "audit" });
      }
    });

    return list.sort(
      (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] || a.daysRemaining - b.daysRemaining
    );
  }, [tasks, leadDays]);

  return { alerts, leadDays, setLeadDays };
}
