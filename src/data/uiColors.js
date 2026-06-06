// ============================================================
// ARISE UI COLOR TOKENS
// Zentrale Design-Tokens für Lesbarkeit und Konsistenz.
// Rank-Farben bleiben in ranks.js für Akzente.
// ============================================================

export const UI = {
  // --- Text ---
  text:       "#e5e7eb",   // Primary text — immer gut lesbar
  textStrong: "#f8fafc",   // Überschriften, wichtige Werte
  textSub:    "#94a3b8",   // Secondary / Labels
  textMuted:  "#64748b",   // Dezent — sichtbar aber zurückhaltend
  textDim:    "#475569",   // Sehr dezent — nur für echte Hintergrundelemente
  textDisabled:"#334155",  // Disabled-Only — kaum sichtbar, nur für inaktive Controls

  // --- Panels / Surfaces ---
  panel:       "rgba(255,255,255,0.035)",
  panelStrong: "rgba(255,255,255,0.06)",
  panelHover:  "rgba(255,255,255,0.055)",

  // --- Borders ---
  border:      "rgba(148,163,184,0.15)",
  borderStrong:"rgba(148,163,184,0.28)",
  borderDim:   "rgba(148,163,184,0.08)",

  // --- Status ---
  success: "#22c55e",
  warn:    "#f59e0b",
  danger:  "#ef4444",
  info:    "#3b82f6",
  muted:   "#6b7280",

  // --- Accent (rank-unabhängig) ---
  cyan:    "#00ffff",
  violet:  "#8b5cf6",
  gold:    "#f59e0b",
};
