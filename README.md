# Calendar App

A simple, responsive calendar app built with vanilla HTML, CSS, and JavaScript. No frameworks, no build tools — just open `index.html` in a browser.

![Calendar App](https://img.shields.io/badge/HTML%20%2B%20CSS%20%2B%20JS-Vanilla-blue) ![License](https://img.shields.io/badge/license-MIT-green)

---

## Features

- **Month view** — Navigate months with Prev / Next / Today buttons
- **Add events** — Click any day cell to open the add-event modal, pre-filled with that date
- **Edit events** — Click any event chip to edit its details
- **Delete events** — Remove events from the edit modal with a single click
- **localStorage persistence** — Events survive page refreshes; no backend required
- **Form validation** — Title required, end time must be after start time, description capped at 500 chars
- **Color-coded events** — Pick from 8 colors when creating or editing an event
- **Responsive UI** — Works on desktop, tablet, and mobile (375px+)
- **Keyboard accessible** — Press `Escape` to close the modal; click the backdrop to dismiss

---

## Getting Started

No installation or build step required.

```bash
git clone https://github.com/vkg378/Coursera-vibe-coding-calendar-app.git
cd Coursera-vibe-coding-calendar-app
open index.html        # macOS
# or double-click index.html in your file explorer
```

That's it. The app runs entirely in the browser using the File API.

---

## Project Structure

```
Calendar-App/
├── index.html        # App shell — semantic HTML, modal form, toast element
├── style.css         # All styles: CSS custom properties, grid layout, responsive breakpoints
├── app.js            # All logic: state, rendering, localStorage, validation, event handlers
├── tasks/
│   └── todo.md       # Implementation checklist with acceptance criteria
└── README.md
```

---

## How It Works

### Data Model

Events are stored in `localStorage` under the key `calendarEvents` as a JSON array:

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Team Standup",
    "date": "2026-02-28",
    "startTime": "09:00",
    "endTime": "09:30",
    "description": "Daily sync with the team.",
    "color": "#4a90e2"
  }
]
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | auto | Generated via `crypto.randomUUID()` |
| `title` | string | yes | 1–100 characters |
| `date` | string | yes | ISO format `YYYY-MM-DD` |
| `startTime` | string | yes | 24-hour `HH:MM` |
| `endTime` | string | no | Must be after `startTime` if provided |
| `description` | string | no | Max 500 characters |
| `color` | string | no | Hex color; defaults to `#4a90e2` |

### Calendar Grid

`getCalendarDays(year, month)` generates a 35- or 42-cell array that fills complete weeks, including leading/trailing days from adjacent months. The grid uses CSS:

```css
display: grid;
grid-template-columns: repeat(7, 1fr);
grid-auto-rows: minmax(110px, auto);
```

### Validation

All validation runs on form submit and displays inline errors:

- **Title** — required, trimmed, max 100 chars
- **Date** — required (browser-native date input)
- **Start Time** — required
- **End Time** — optional; if provided, must be strictly later than start time
- **Description** — optional; max 500 chars with live character counter

---

## Customization

All visual tokens live in CSS custom properties at the top of `style.css`:

```css
:root {
  --color-primary:    #4a90e2;
  --color-bg:         #f0f2f5;
  --color-surface:    #ffffff;
  --color-border:     #e0e4ea;
  /* ...more tokens */
}
```

The event color palette is defined as an array in `app.js`:

```js
const COLOR_PALETTE = [
  '#4a90e2', '#e74c3c', '#2ecc71', '#f39c12',
  '#9b59b6', '#1abc9c', '#e91e63', '#607d8b',
];
```

---

## Responsive Breakpoints

| Breakpoint | Changes |
|---|---|
| `≤ 768px` | Smaller day cells, reduced font sizes |
| `≤ 600px` | Minimal day cells, full-width bottom-sheet modal, single-column time fields |

---

## Browser Support

Works in any modern browser that supports:
- CSS Grid
- `localStorage`
- `crypto.randomUUID()`

Tested in Chrome, Firefox, and Safari.

---

## License

MIT — free to use, modify, and distribute.
