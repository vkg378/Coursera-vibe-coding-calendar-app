# Calendar App - Implementation Checklist

## Tasks

### Phase 1: Project Scaffolding
- [x] 1.1 Create `index.html` with semantic shell (doctype, head, link to CSS/JS, body skeleton)
  - **AC:** File opens in browser with no console errors; title shows "Calendar App"
- [x] 1.2 Create `style.css` with `:root` custom properties and CSS reset (box-sizing, margin 0)
  - **AC:** Custom properties defined; body has background color from variable
- [x] 1.3 Create `app.js` with `DOMContentLoaded` listener and initial `state` object
  - **AC:** Console log fires on page load confirming script loaded

### Phase 2: Calendar Header
- [x] 2.1 Render month/year heading from `state.currentMonth` / `state.currentYear`
  - **AC:** Heading displays "February 2026" for default state (today's date)
- [x] 2.2 Wire Prev / Next buttons to decrement/increment month (with year rollover)
  - **AC:** Clicking Prev from January 2026 shows December 2025; Next from December shows January next year
- [x] 2.3 Add "Today" button that resets to current real-world month/year
  - **AC:** Clicking Today always shows the month containing today's date

### Phase 3: Calendar Grid
- [x] 3.1 Implement `getCalendarDays(year, month)` returning a 35 or 42-element array (with leading/trailing padding days)
  - **AC:** January 2026 returns 35 cells starting from correct weekday; February 2026 returns 35 cells
- [x] 3.2 Render the weekday header row (Sun–Sat)
  - **AC:** Seven labels appear above the grid
- [x] 3.3 Render grid cells with day numbers; style other-month cells as muted
  - **AC:** Grid shows correct number of rows; padding days are visually distinct
- [x] 3.4 Highlight today's cell with a circle on the day number
  - **AC:** Today's date has a highlighted circle; no other days are highlighted

### Phase 4: localStorage Layer
- [x] 4.1 Implement `loadEvents()` and `saveEvents(events)` with JSON parse/stringify
  - **AC:** Calling `saveEvents([{...}])` then `loadEvents()` returns the same object
- [x] 4.2 Initialize `state.events` from `loadEvents()` on app start
  - **AC:** Events persist across hard page refresh

### Phase 5: Event Display on Grid
- [x] 5.1 Implement `getEventsForDate(dateStr)` returning events sorted by startTime
  - **AC:** Events on a date appear sorted earliest-first
- [x] 5.2 Render up to 3 event chips per day cell; show "+N more" if more exist
  - **AC:** A day with 5 events shows 3 chips and a "+2 more" label
- [x] 5.3 Style event chips (colored pill, ellipsis overflow, pointer cursor)
  - **AC:** Chips visually distinct; long titles truncated without overflow

### Phase 6: Add Event Modal
- [x] 6.1 Create modal HTML (overlay + form: title, date, startTime, endTime, description, color swatches)
  - **AC:** Modal exists in DOM, hidden by default
- [x] 6.2 Open modal when clicking a day cell's empty area; pre-fill date field
  - **AC:** Clicking empty space in a cell opens modal with that cell's date pre-filled
- [x] 6.3 Implement form validation on submit (title required, end > start if set, description max length)
  - **AC:** Empty title shows inline error; invalid end time shows error; valid form submits
- [x] 6.4 On valid submit: create event with `crypto.randomUUID()`, save to localStorage, re-render grid, close modal
  - **AC:** New event appears on the grid immediately; persists on refresh

### Phase 7: Edit / Delete Event
- [x] 7.1 Open modal in edit mode when clicking an event chip; populate all fields
  - **AC:** Clicking a chip opens modal titled "Edit Event" with all fields pre-filled
- [x] 7.2 On save in edit mode: update matching event by id, save, re-render
  - **AC:** Edited event reflects changes immediately on grid
- [x] 7.3 Delete button removes event by id, saves, closes modal, re-renders
  - **AC:** Deleted event disappears from grid; does not reappear on refresh

### Phase 8: Responsive Design
- [x] 8.1 Media query ≤600px: reduce cell min-height, simplify chip display
  - **AC:** On 375px wide viewport calendar is usable; chips visible without overflow
- [x] 8.2 Modal full-width with reduced padding on small screens
  - **AC:** Modal on 375px viewport does not overflow horizontally

### Phase 9: Polish and Edge Cases
- [x] 9.1 Close modal on Escape key and backdrop click
  - **AC:** Pressing Escape closes modal; clicking outside the modal box closes it
- [x] 9.2 Handle months with 28/29/30/31 days correctly (leap year test: Feb 2024 = 29 days)
  - **AC:** February 2024 shows 29 days; February 2025 shows 28 days
- [x] 9.3 Prevent event chip click from triggering day cell click (`stopPropagation`)
  - **AC:** Clicking a chip opens edit modal, not add modal

---

## Acceptance Criteria Summary

| Feature | Criterion |
|---|---|
| Month navigation | Prev/Next/Today buttons change month correctly with year rollover |
| Today highlight | Only today's date shows a circle highlight |
| Event persistence | Events survive hard page refresh via localStorage |
| Event chips | Up to 3 chips per cell; "+N more" label if overflow |
| Add event | Modal pre-fills date; valid event saves and appears immediately |
| Validation | Title required; end time > start time; description ≤ 500 chars |
| Edit event | Chip click opens pre-filled edit modal; save updates grid |
| Delete event | Delete button removes event permanently |
| Responsive | Usable at 375px width; modal fits on screen |
| Modal close | Escape key and backdrop click both close modal |

---

## Accessibility Audit — Phase 10

### A11y Issues Found

#### Color Contrast (WCAG AA requires 4.5:1 for normal text)
- `--gc-text-mid` (`#70757a`) on white = ~4.17:1 — **FAILS** at small sizes (labels 0.78rem, weekday cells 0.75rem, mini weekday 0.7rem, char counter 0.72rem)
- `--gc-text-light` (`#9aa0a6`) on white = ~2.4:1 — **FAILS** (char counter, "other month" mini days)
- Event chip white text on `#2ecc71` (green) = ~2.2:1 — **FAILS**
- Event chip white text on `#f39c12` (orange) = ~2.0:1 — **FAILS**

#### Semantic HTML / ARIA
- Form inputs missing `aria-describedby` linking to error `<span>`s
- Required inputs missing `required` attribute (only visual `*` asterisk)
- Required `<span class="required">*</span>` needs `aria-hidden="true"`
- Mini-calendar day buttons have bare number text — need full date `aria-label` (e.g., "March 5, 2026")
- Mini-calendar weekday single letters ("S","M","T") are ambiguous — need `<abbr title="Sunday">`
- `more-events` is a `<span>` with `cursor:pointer` but is not focusable or keyboard-operable
- Color swatch buttons only expose hex code via `title` — need human-readable `aria-label` (e.g., "Blue")
- `#color-swatches` label has no `for` or `aria-labelledby` linkage
- Calendar grid missing `role="grid"` / `role="row"` / `role="gridcell"`
- Today's cell missing `aria-current="date"`
- Day cells missing `aria-label` with date + event count

#### Focus States
- No explicit `:focus-visible` ring on icon buttons, today pill, create button, mini-day, day-cell, swatches
- Inputs use `outline: none` + `box-shadow` — valid but needs high-contrast mode fallback

#### Keyboard Navigation
- Day cells are `<div>` — not tab-focusable, no Enter/Space handler → mouse-only
- `more-events` span — not tab-focusable
- Modal has no focus trap — Tab can reach elements behind overlay
- Modal close does not return focus to the triggering element

#### Reduced Motion / Toast
- CSS animations (`fadeIn`, `slideUp`, transitions) not wrapped in `prefers-reduced-motion`
- Toast missing `aria-atomic="true"`

---

### Phase 10 Todo Checklist

- [x] 10.1 **CSS — Color contrast**: Darkened `--gc-text-mid` → `#5f6368` (6.05:1) and `--gc-text-light` → `#6a6e73` (5.14:1)
- [x] 10.2 **CSS — Event chip palette**: Replaced all 6 failing chip colors with accessible darker variants (all ≥ 4.67:1); added `COLOR_NAMES` map in JS
- [x] 10.3 **CSS — Focus rings**: Added `:focus-visible` outlines for all interactive elements; added `prefers-reduced-motion` block
- [x] 10.4 **HTML — Form ARIA**: Added `aria-describedby`, `required`, `aria-required` on required inputs; `role="alert"` on error spans; `aria-hidden` on asterisks; `role="group"` + `aria-labelledby` on color swatch container
- [x] 10.5 **JS — Mini-calendar**: Added `aria-label` with full date on day buttons; wrapped weekday initials in `<abbr title="...">`
- [x] 10.6 **JS — Color swatches**: Replaced hex `title` with human-readable `aria-label`; added `aria-pressed` state
- [x] 10.7 **JS — `more-events`**: Changed from `<span>` to `<button type="button">`; added descriptive `aria-label`
- [x] 10.8 **JS — Day cell keyboard**: Added `tabindex="0"` + `role="gridcell"` + Enter/Space handler; `aria-current="date"` on today; `aria-label` with date + event count; `role="grid"` on grid container
- [x] 10.9 **JS — Modal focus trap + return**: Tab/Shift-Tab trapped inside modal; `modalTriggerEl` tracked and focus restored on close; `triggerEl` threaded through all callers
- [x] 10.10 **HTML — Toast**: Added `aria-atomic="true"`

---

## Review Section

### Changes Made

All four files were created from scratch (project was empty):

| File | Purpose |
|---|---|
| `index.html` | Semantic HTML shell — header, calendar grid, modal form, toast element |
| `style.css` | Full visual design: CSS custom properties, 7-col CSS Grid, responsive breakpoints at 768px and 600px |
| `app.js` | All logic: state, localStorage, calendar day math, render functions, modal control, form validation, CRUD handlers |
| `tasks/todo.md` | This file — checklist with acceptance criteria |

### Key Decisions
- **Vanilla JS/HTML/CSS** — no build tools or dependencies; open `index.html` directly in a browser
- **`crypto.randomUUID()`** for event IDs — widely supported, collision-free
- **35/42-cell grid** — `getCalendarDays()` calculates the correct number of weeks automatically
- **Validation on submit** — inline errors below each field; no third-party library
- **Chip overflow** — max 3 chips shown per day; "+N more" label for extras
- **Mobile-first breakpoints** — 768px simplifies grid, 600px switches modal to bottom sheet style
