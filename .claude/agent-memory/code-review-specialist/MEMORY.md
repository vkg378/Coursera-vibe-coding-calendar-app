# Code Review Specialist Memory — Calendar App

## Project Overview
- Vanilla JS/HTML/CSS calendar app, no build tools, no dependencies
- Three main files: `index.html`, `style.css`, `app.js`
- Tasks tracked in `tasks/todo.md` (Phases 1–11; Phase 11 Tailwind migration not yet started)
- All localStorage data is stored under key `calendarEvents`

## Architecture Patterns
- Single flat state object in `app.js` (currentYear, currentMonth, events, modalMode, editingId, selectedColor)
- Full re-render on every state change (`renderAll()` or `renderGrid()`)
- Events stored as plain objects: `{ id, title, date, startTime, endTime, description, color }`
- Color selection tracked in `state.selectedColor`, not via form field value

## Known Issues (First Review — 2026-03-01)
- **XSS risk**: `chip.textContent` is safe, but `innerHTML` is used in mini-cal nav buttons (SVG only — low risk)
- **localStorage not validated**: No schema validation on `loadEvents()` — malformed/injected data accepted as-is
- **`today` frozen at startup**: `const today = new Date()` is module-level; multi-day sessions show wrong "today"
- **Duplicate `getEventsForDate` call**: Called twice per day cell in `renderGrid()` for cells with events
- **`hexToRgb` dead function**: Defined at line 460 but never used — should be removed
- **`console.log` in production**: Line 634 `init()` logs to console unconditionally
- **Missing delete confirmation**: `handleDelete()` deletes immediately with no undo or confirm dialog
- **`more-events` click opens "Add" modal**: Should show all events for the day, not open add form
- **No `aria-live` on modal title**: Screen readers may not announce mode switch (Add vs Edit)
- **`role="row"` on weekday-row `<div>`**: Missing required `role="rowgroup"` wrapper for valid grid semantics
- **No `aria-rowindex`/`aria-colindex`**: Grid cells have `role="gridcell"` but no row context
- **Color swatch lookup is fragile**: Uses `aria-label` reverse-lookup to find color on click — brittle pattern

## Recurring Patterns to Watch
- The codebase uses `innerHTML = ''` to wipe containers before re-render — OK for this scale, but loses event listeners if not re-attached
- All DOM lookups use `getElementById` — no caching, repeated per render cycle
- Validation is submit-only (no real-time field feedback)

## Conventions Observed
- CSS custom properties for all colors/spacing (Google Calendar palette)
- Semantic class names matching BEM-lite style (`.modal-form`, `.form-group`, `.event-chip`)
- WCAG AA contrast verified in comments; contrast ratios annotated in code

## Details File
See `patterns.md` for deeper notes.
