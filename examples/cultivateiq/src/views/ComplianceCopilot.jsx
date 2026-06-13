import { useState, useEffect, useRef } from "react";
import { MessageSquare, Leaf, Send } from "lucide-react";
import { COLORS, FONTS } from "../constants/theme.js";
import { SectionTitle } from "../components/SectionTitle.jsx";
import { COPILOT_SYSTEM_PROMPT } from "../constants/system-prompts.js";
import { useAnthropic } from "../hooks/useAnthropic.js";

const STARTER_PROMPTS = [
  "Draft a monthly cultivation report for ODC",
  "Generate an SOP for pest management",
  "What are my Q2 2026 reporting obligations?",
  "Help me write a batch incident report",
  "Explain the permit renewal process",
  "What do the 2026-27 TGA reforms mean for us?",
];

export const ComplianceCopilot = ({ pendingPrompt, onPromptConsumed }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const { send: sendToClaude, loading } = useAnthropic();
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    try {
      const reply = await sendToClaude({
        system: COPILOT_SYSTEM_PROMPT,
        messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
      });
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection error. Please check your network and try again." }]);
    }
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
          {STARTER_PROMPTS.map((p) => (
            <button key={p} onClick={() => send(p)} style={{
              padding: "6px 12px", borderRadius: 6, border: `1px solid ${COLORS.border}`,
              background: "transparent", color: COLORS.textSecondary, fontSize: 12,
              fontFamily: FONTS.body, cursor: "pointer", transition: "all 0.15s ease",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.color = COLORS.accent; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textSecondary; }}>
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
      <div style={{ padding: "16px 0 24px", borderTop: `1px solid ${COLORS.border}` }}>
        <div style={{
          display: "flex", gap: 10, background: COLORS.card,
          border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "10px 12px",
          transition: "border-color 0.15s ease",
        }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
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
