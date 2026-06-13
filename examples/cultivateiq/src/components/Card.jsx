import { useState } from "react";
import { COLORS } from "../constants/theme.js";

export const Card = ({ children, style, onClick, hoverable }) => {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => hoverable && setHov(true)}
      onMouseLeave={() => hoverable && setHov(false)}
      style={{
        background: hov ? COLORS.cardHover : COLORS.card,
        border: `1px solid ${hov ? COLORS.borderLight : COLORS.border}`,
        borderRadius: 12, padding: "20px 24px",
        transition: "all 0.2s ease",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}>{children}</div>
  );
};
