import type {
  AuditEntryOut,
  CallDetailOut,
  CallSummaryOut,
  MediaSessionOut,
  MediaSessionSummaryOut,
} from "../types/call";

export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

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

export function fetchCallMedia(id: string): Promise<MediaSessionSummaryOut[]> {
  return getJson<MediaSessionSummaryOut[]>(`/api/calls/${id}/media`);
}

export async function requestMediaSession(callId: string, mediaType: string): Promise<MediaSessionOut> {
  const response = await fetch(`${API_BASE}/api/calls/${callId}/media-sessions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ media_type: mediaType }),
  });
  if (!response.ok) {
    throw new Error(`request media session failed: ${response.status}`);
  }
  return response.json() as Promise<MediaSessionOut>;
}
