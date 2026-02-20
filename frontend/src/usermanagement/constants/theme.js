/**
 * Unified design tokens for User Management components.
 *
 * All values are derived from the single app-wide THEME object so that
 * every section of the app renders with the same "Bioluminescent Abyss"
 * colour palette. Never hard-code colours here — always reference THEME.
 */
import { THEME } from '../../utils/theme.jsx';

export const T = Object.freeze({
    // ── Backgrounds ──────────────────────────────────────────────────────────
    bg:          THEME.bg,               // #030A0E  ink-black
    surface:     THEME.surface,          // #0A1A20  deep surface
    surfaceHigh: THEME.surfaceRaised,    // #162D38  raised surface

    // ── Borders / Grid ───────────────────────────────────────────────────────
    border:      THEME.grid,             // #0E2830
    borderHigh:  THEME.gridAlt,          // #163840

    // ── Primary — bioluminescent teal ────────────────────────────────────────
    primary:     THEME.primary,          // #00D2B4
    primaryDim:  THEME.primaryFaint,     // rgba(0,210,180,0.07)

    // ── Accent — abyssal amber (maps old purple → warm gold) ─────────────────
    accent:      THEME.secondary,        // #E8A830

    // ── Semantic colours ─────────────────────────────────────────────────────
    success:     THEME.success,          // #26D98A
    successDim:  `${THEME.success}26`,   // 15% opacity

    warning:     THEME.warning,          // #FFB830
    warningDim:  `${THEME.warning}26`,   // 15% opacity

    danger:      THEME.danger,           // #FF4E6A
    dangerDim:   `${THEME.danger}26`,    // 15% opacity

    info:        THEME.info,             // #30A8E8
    infoDim:     `${THEME.info}26`,      // 15% opacity

    // ── Typography ───────────────────────────────────────────────────────────
    text:        THEME.textMain,         // #EEF6F4
    textSub:     THEME.textMuted,        // #7DADA3
    textDim:     THEME.textDim,          // #3A6060
});
