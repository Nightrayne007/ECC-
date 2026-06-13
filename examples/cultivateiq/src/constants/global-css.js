import { COLORS, FONTS } from "./theme.js";

// Fonts are loaded via <link> tags in index.html.
export const globalCSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: ${COLORS.bg}; color: ${COLORS.textPrimary}; font-family: ${FONTS.body}; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: ${COLORS.surface}; }
::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: ${COLORS.borderLight}; }
@keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
.fade-up { animation: fadeUp 0.4s ease forwards; }
.pulse { animation: pulse 2s ease-in-out infinite; }
`;
