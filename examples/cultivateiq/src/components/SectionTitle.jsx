import { COLORS, FONTS } from "../constants/theme.js";

export const SectionTitle = ({ children, sub }) => (
  <div style={{ marginBottom: 20 }}>
    <h2 style={{ fontFamily: FONTS.display, fontSize: 24, fontWeight: 600, color: COLORS.textPrimary }}>{children}</h2>
    {sub && <p style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 4 }}>{sub}</p>}
  </div>
);
