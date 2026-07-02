import type { AuditEntryOut, CallDetailOut, CallSummaryOut } from "../types/call";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`${path} failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function fetchCalls(): Promise<CallSummaryOut[]> {
  return getJson<CallSummaryOut[]>("/api/calls");
}

export function fetchCallDetail(id: string): Promise<CallDetailOut> {
  return getJson<CallDetailOut>(`/api/calls/${id}`);
}

export function fetchAuditTrail(id: string): Promise<AuditEntryOut[]> {
  return getJson<AuditEntryOut[]>(`/api/audit/${id}`);
}
