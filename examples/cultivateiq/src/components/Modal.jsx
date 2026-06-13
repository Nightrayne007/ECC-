import { X } from "lucide-react";
import { COLORS, FONTS } from "../constants/theme.js";

export const Modal = ({ open, onClose, title, children, width = 480 }) => {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(8,13,9,0.75)", backdropFilter: "blur(2px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width, maxWidth: "92vw", maxHeight: "86vh", overflowY: "auto",
          background: COLORS.card, border: `1px solid ${COLORS.borderLight}`,
          borderRadius: 12, padding: "20px 24px",
          animation: "fadeUp 0.25s ease forwards",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: FONTS.display, fontSize: 18, fontWeight: 600, color: COLORS.textPrimary }}>{title}</div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: COLORS.textMuted, padding: 4, display: "flex" }}>
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
