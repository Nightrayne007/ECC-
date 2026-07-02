import { useEffect, useState } from "react";
import { fetchCalls } from "../api/client";
import CallTable from "../components/CallTable";
import type { CallSummaryOut } from "../types/call";

export default function CallListPage() {
  const [calls, setCalls] = useState<CallSummaryOut[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCalls()
      .then(setCalls)
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <p style={{ color: "var(--status-critical)" }}>{error}</p>;
  if (!calls) return <p style={{ color: "var(--text-muted)" }}>Loading…</p>;

  return (
    <div>
      <h2 className="mb-4 text-base font-medium">Calls</h2>
      <CallTable calls={calls} />
    </div>
  );
}
