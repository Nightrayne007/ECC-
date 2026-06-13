import { useState, useCallback } from "react";

// Single point of contact with the Anthropic API. Non-streaming, mirroring the
// original fetch blocks. Throws on failure so callers keep their own fallback
// copy; also exposes `error` for components that want to render it directly.
export function useAnthropic() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const send = useCallback(async ({ system, messages, maxTokens = 1000 }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: maxTokens,
          ...(system ? { system } : {}),
          messages,
        }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      const text = data.content?.[0]?.text;
      if (!text) throw new Error("Empty response");
      return text;
    } catch (err) {
      setError(err.message || "Request failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { send, loading, error };
}
