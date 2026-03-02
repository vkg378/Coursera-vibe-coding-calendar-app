/* ============================================================
   Calendar App — app.js
   ============================================================ */

// ── 1. Constants ────────────────────────────────────────────
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// All colours verified ≥ 4.5:1 contrast against white (#fff) for chip text.
const COLOR_PALETTE = [
  '#1558d0', // blue   (6.06:1)
  '#c0392b', // red    (5.44:1)
  '#1e8449', // green  (4.71:1)
  '#b45309', // amber  (5.02:1)
  '#9b59b6', // purple (4.67:1)
  '#0e7490', // teal   (5.36:1)
  '#c2185b', // pink   (5.87:1)
  '#455a64', // slate  (7.24:1)
];

const COLOR_NAMES = {
  '#1558d0': 'Blue',
  '#c0392b': 'Red',
  '#1e8449': 'Green',
  '#b45309': 'Amber',
  '#9b59b6': 'Purple',
  '#0e7490': 'Teal',
  '#c2185b': 'Pink',
  '#455a64': 'Slate',
};

const STORAGE_KEY = 'calendarEvents';
const MAX_CHIPS = 3;

// ── 2. State ─────────────────────────────────────────────────
const state = {
  currentYear:   new Date().getFullYear(),
  currentMonth:  new Date().getMonth(), // 0-indexed
  events:        [],
  modalMode:     'add',   // 'add' | 'edit'
  editingId:     null,
  selectedColor: COLOR_PALETTE[0],
};

// ── 3. Storage ───────────────────────────────────────────────

const VALID_HEX  = /^#[0-9a-f]{6}$/i;
const VALID_DATE = /^\d{4}-\d{2}-\d{2}$/;
const VALID_TIME = /^\d{2}:\d{2}$/;

function isValidEvent(e) {
  return (
    e && typeof e === 'object' &&
    typeof e.id === 'string' && e.id.length > 0 &&
    typeof e.title === 'string' && e.title.length > 0 && e.title.length <= 100 &&
    typeof e.date === 'string' && VALID_DATE.test(e.date) &&
    typeof e.startTime === 'string' && VALID_TIME.test(e.startTime) &&
    (!e.endTime || VALID_TIME.test(e.endTime)) &&
    (!e.color || VALID_HEX.test(e.color)) &&
    (!e.description || (typeof e.description === 'string' && e.description.length <= 500))
  );
}

function loadEvents() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(raw) ? raw.filter(isValidEvent) : [];
  } catch {
    return [];
  }
}

function saveEvents(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

// ── 4. Date Helpers ──────────────────────────────────────────

/** Always compute today fresh so long-lived tabs stay correct. */
function getToday() { return new Date(); }

/** Returns array of Date objects filling a full calendar view (35 or 42 cells). */
function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);

  const startOffset = firstDay.getDay(); // 0=Sun
  const totalDays   = lastDay.getDate();
  const totalCells  = Math.ceil((startOffset + totalDays) / 7) * 7;

  const days = [];
  for (let i = 0; i < totalCells; i++) {
    days.push(new Date(year, month, 1 - startOffset + i));
  }
  return days;
}

/** Format a Date as "YYYY-MM-DD" (local time, no timezone shift). */
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isToday(date) {
  return formatDate(date) === formatDate(getToday());
}

// ── 5. Event Data Helpers ────────────────────────────────────

function getEventsForDate(dateStr) {
  return state.events
    .filter(e => e.date === dateStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

function getEventById(id) {
  return state.events.find(e => e.id === id) || null;
}

// ── 6. Render Functions ──────────────────────────────────────

function renderHeader() {
  const label = document.getElementById('month-label');
  label.textContent = `${MONTH_NAMES[state.currentMonth]} ${state.currentYear}`;
  document.title = `${MONTH_NAMES[state.currentMonth]} ${state.currentYear} — Calendar`;
}

function renderMiniCalendar() {
  const container = document.getElementById('mini-cal');
  if (!container) return;
  container.innerHTML = '';

  // Header: prev | "Month Year" | next
  const header = document.createElement('div');
  header.className = 'flex items-center justify-between mb-1.5 px-0.5';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'inline-flex items-center justify-center w-7 h-7 rounded-full text-gc-text-mid hover:bg-gc-hover hover:text-gc-text transition-colors focus-visible:outline-2 focus-visible:outline-gc-blue focus-visible:outline-offset-2';
  prevBtn.setAttribute('aria-label', 'Previous month');
  prevBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor"/></svg>`;
  prevBtn.addEventListener('click', e => {
    e.stopPropagation();
    state.currentMonth--;
    if (state.currentMonth < 0) { state.currentMonth = 11; state.currentYear--; }
    renderAll();
  });

  const nextBtn = document.createElement('button');
  nextBtn.className = 'inline-flex items-center justify-center w-7 h-7 rounded-full text-gc-text-mid hover:bg-gc-hover hover:text-gc-text transition-colors focus-visible:outline-2 focus-visible:outline-gc-blue focus-visible:outline-offset-2';
  nextBtn.setAttribute('aria-label', 'Next month');
  nextBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor"/></svg>`;
  nextBtn.addEventListener('click', e => {
    e.stopPropagation();
    state.currentMonth++;
    if (state.currentMonth > 11) { state.currentMonth = 0; state.currentYear++; }
    renderAll();
  });

  const monthSpan = document.createElement('span');
  monthSpan.className = 'text-[0.82rem] font-medium text-gc-text';
  monthSpan.textContent = `${MONTH_NAMES[state.currentMonth]} ${state.currentYear}`;

  header.appendChild(prevBtn);
  header.appendChild(monthSpan);
  header.appendChild(nextBtn);
  container.appendChild(header);

  // Weekday labels: S M T W T F S
  const wRow = document.createElement('div');
  wRow.className = 'grid grid-cols-7 mb-0.5';
  const MINI_WEEKDAYS = [
    ['S', 'Sunday'], ['M', 'Monday'], ['T', 'Tuesday'], ['W', 'Wednesday'],
    ['T', 'Thursday'], ['F', 'Friday'], ['S', 'Saturday'],
  ];
  MINI_WEEKDAYS.forEach(([letter, full]) => {
    const cell = document.createElement('span');
    cell.className = 'text-center text-[0.7rem] font-medium text-gc-text-mid py-0.5';
    const abbr = document.createElement('abbr');
    abbr.title = full;
    abbr.textContent = letter;
    cell.appendChild(abbr);
    wRow.appendChild(cell);
  });
  container.appendChild(wRow);

  // Day grid
  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-7 gap-px';
  getCalendarDays(state.currentYear, state.currentMonth).forEach(date => {
    const btn = document.createElement('button');
    const otherMonth = date.getMonth() !== state.currentMonth;
    const todayCell  = isToday(date);

    btn.className = [
      'flex items-center justify-center w-full aspect-square rounded-full text-[0.75rem] cursor-pointer transition-colors',
      'focus-visible:outline-2 focus-visible:outline-gc-blue focus-visible:outline-offset-2',
      todayCell  ? 'bg-gc-today text-white font-bold hover:bg-gc-blue-hover' :
      otherMonth ? 'text-gc-text-light hover:bg-gc-hover' :
                   'text-gc-text hover:bg-gc-hover',
    ].join(' ');

    btn.textContent = date.getDate();
    btn.setAttribute('aria-label',
      date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
    btn.addEventListener('click', () => {
      state.currentYear  = date.getFullYear();
      state.currentMonth = date.getMonth();
      renderAll();
    });
    grid.appendChild(btn);
  });
  container.appendChild(grid);
}

function renderAll() {
  renderHeader();
  renderGrid();
  renderMiniCalendar();
}

function renderWeekdayRow() {
  const row = document.getElementById('weekday-row');
  row.innerHTML = '';
  DAYS_OF_WEEK.forEach(day => {
    const cell = document.createElement('div');
    cell.className = 'py-2.5 text-center text-[0.75rem] font-medium text-gc-text-mid tracking-wider uppercase';
    cell.textContent = day;
    row.appendChild(cell);
  });
}

function renderGrid() {
  const grid = document.getElementById('calendar-grid');
  grid.innerHTML = '';

  const days = getCalendarDays(state.currentYear, state.currentMonth);

  days.forEach(date => {
    const cell = document.createElement('div');
    const dateStr = formatDate(date);
    const isCurrentMonth = date.getMonth() === state.currentMonth;
    const todayCell = isToday(date);

    cell.className = [
      'border-r border-b border-gc-border relative cursor-pointer overflow-hidden',
      'min-h-[100px] p-1.5 transition-colors',
      'focus-visible:outline-2 focus-visible:outline-gc-blue focus-visible:outline-offset-[-2px]',
      isCurrentMonth
        ? (todayCell ? 'hover:bg-gc-hover/50' : 'hover:bg-[#f8f9fa]')
        : 'bg-[#f8f9fa] cursor-default',
    ].join(' ');

    cell.setAttribute('role', 'gridcell');
    cell.dataset.date = dateStr;

    // Day number
    const numEl = document.createElement('span');
    numEl.className = [
      'inline-flex items-center justify-center w-[1.85rem] h-[1.85rem] rounded-full',
      'text-[0.8rem] font-normal mb-0.5 transition-colors',
      todayCell
        ? 'bg-gc-today text-white font-bold'
        : isCurrentMonth ? 'text-gc-text' : 'text-gc-text-light',
    ].join(' ');
    numEl.textContent = date.getDate();
    cell.appendChild(numEl);

    // Event chips — only for current month
    if (isCurrentMonth) {
      const dayEvents = getEventsForDate(dateStr); // computed once per cell
      const visible   = dayEvents.slice(0, MAX_CHIPS);
      const overflow  = dayEvents.length - MAX_CHIPS;

      visible.forEach(ev => {
        const chip = document.createElement('button');
        chip.className = 'block w-full px-1.5 py-0.5 mb-0.5 rounded text-[0.73rem] font-medium whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer text-white text-left border-0 transition-[filter] hover:brightness-90 focus-visible:outline-2 focus-visible:outline-gc-blue focus-visible:outline-offset-2';
        chip.style.background = ev.color || COLOR_PALETTE[0];
        chip.textContent = ev.startTime ? `${ev.startTime} ${ev.title}` : ev.title;
        chip.dataset.eventId = ev.id;
        chip.addEventListener('click', handleChipClick);
        cell.appendChild(chip);
      });

      if (overflow > 0) {
        const more = document.createElement('button');
        more.type = 'button';
        more.className = 'block w-full text-left px-1.5 py-0.5 text-[0.7rem] text-gc-text-mid rounded hover:bg-gc-hover hover:text-gc-text transition-colors focus-visible:outline-2 focus-visible:outline-gc-blue focus-visible:outline-offset-2';
        more.textContent = `+${overflow} more`;
        more.setAttribute('aria-label',
          `${overflow} more event${overflow === 1 ? '' : 's'} on ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`);
        // Show the first overflowing event in edit modal instead of add modal
        more.addEventListener('click', e => {
          e.stopPropagation();
          const nextEvent = dayEvents[MAX_CHIPS];
          if (nextEvent) openEditModal(nextEvent, more);
        });
        cell.appendChild(more);
      }

      // Keyboard + ARIA
      cell.setAttribute('tabindex', '0');
      const eventCount = dayEvents.length;
      const dateLabel  = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      const eventLabel = eventCount === 0 ? 'No events'
        : eventCount === 1 ? '1 event'
        : `${eventCount} events`;
      cell.setAttribute('aria-label', `${dateLabel}, ${eventLabel}`);
      if (todayCell) cell.setAttribute('aria-current', 'date');

      cell.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModal(dateStr, cell);
        }
      });
    }

    // Click on empty area → add event
    cell.addEventListener('click', handleDayCellClick);

    grid.appendChild(cell);
  });
}

// ── 7. Modal Control ─────────────────────────────────────────

let modalTriggerEl = null;

function openModal(dateStr, triggerEl) {
  state.modalMode = 'add';
  state.editingId = null;

  document.getElementById('modal-title').textContent = 'Add Event';
  document.getElementById('btn-delete').hidden = true;
  document.getElementById('btn-save').textContent = 'Save Event';

  clearForm();
  clearErrors();
  document.getElementById('field-date').value = dateStr || '';
  renderColorSwatches(COLOR_PALETTE[0]);

  showOverlay(triggerEl);
}

function openEditModal(event, triggerEl) {
  state.modalMode = 'edit';
  state.editingId = event.id;

  document.getElementById('modal-title').textContent = 'Edit Event';
  document.getElementById('btn-delete').hidden = false;
  document.getElementById('btn-save').textContent = 'Update Event';

  clearErrors();
  populateForm(event);
  renderColorSwatches(event.color || COLOR_PALETTE[0]);

  showOverlay(triggerEl);
}

function closeModal() {
  document.getElementById('modal-overlay').hidden = true;
  state.modalMode = 'add';
  state.editingId = null;
  if (modalTriggerEl) {
    modalTriggerEl.focus();
    modalTriggerEl = null;
  }
}

function showOverlay(triggerEl) {
  modalTriggerEl = triggerEl || null;
  document.getElementById('modal-overlay').hidden = false;
  document.getElementById('field-title').focus();
}

// ── 8. Form Helpers ──────────────────────────────────────────

/**
 * Read the three time selects for a given prefix ('field-start' | 'field-end')
 * and return a 24-hour "HH:MM" string, or '' if any part is unset.
 */
function getTimeValue(prefix) {
  const hour = document.getElementById(`${prefix}-hour`).value;
  const min  = document.getElementById(`${prefix}-min`).value;
  const ampm = document.getElementById(`${prefix}-ampm`).value;
  if (!hour || !min || !ampm) return '';
  let h = parseInt(hour, 10);
  if (ampm === 'AM' && h === 12) h = 0;
  if (ampm === 'PM' && h !== 12) h += 12;
  return `${String(h).padStart(2, '0')}:${min}`;
}

/**
 * Populate the three time selects for a given prefix from a 24-hour "HH:MM" string.
 * Clears all three selects when timeStr is empty or invalid.
 * Minutes are rounded to the nearest 5-minute step.
 */
function setTimeValue(prefix, timeStr) {
  const hourEl = document.getElementById(`${prefix}-hour`);
  const minEl  = document.getElementById(`${prefix}-min`);
  const ampmEl = document.getElementById(`${prefix}-ampm`);

  if (!timeStr || !VALID_TIME.test(timeStr)) {
    hourEl.value = '';
    minEl.value  = '';
    ampmEl.value = '';
    return;
  }

  let [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;

  // Round minute to nearest 5-minute step available in the select
  const roundedM = Math.min(55, Math.round(m / 5) * 5);
  const minStr   = String(roundedM).padStart(2, '0');

  hourEl.value = String(h);
  minEl.value  = minStr;
  ampmEl.value = ampm;
}

function clearForm() {
  document.getElementById('event-form').reset();
  setTimeValue('field-start', '');
  setTimeValue('field-end', '');
  document.getElementById('desc-count').textContent = '0';
  state.selectedColor = COLOR_PALETTE[0];
}

function populateForm(event) {
  document.getElementById('field-title').value = event.title       || '';
  document.getElementById('field-date').value  = event.date        || '';
  setTimeValue('field-start', event.startTime || '');
  setTimeValue('field-end',   event.endTime   || '');
  document.getElementById('field-desc').value  = event.description || '';
  document.getElementById('desc-count').textContent =
    (event.description || '').length;
  state.selectedColor = event.color || COLOR_PALETTE[0];
}

function readForm() {
  return {
    title:       document.getElementById('field-title').value.trim(),
    date:        document.getElementById('field-date').value,
    startTime:   getTimeValue('field-start'),
    endTime:     getTimeValue('field-end'),
    description: document.getElementById('field-desc').value.trim(),
    color:       state.selectedColor,
  };
}

function validateForm(data) {
  const errors = {};

  if (!data.title) {
    errors.title = 'Title is required.';
  } else if (data.title.length > 100) {
    errors.title = 'Title must be 100 characters or fewer.';
  }

  if (!data.date) {
    errors.date = 'Date is required.';
  }

  if (!data.startTime) {
    errors.start = 'Start time is required.';
  }

  // HH:MM strings from <input type="time"> are zero-padded, so lexicographic
  // comparison is equivalent to chronological comparison for this format.
  if (data.endTime && data.startTime && data.endTime <= data.startTime) {
    errors.end = 'End time must be after start time.';
  }

  if (data.description.length > 500) {
    errors.desc = 'Description must be 500 characters or fewer.';
  }

  return errors;
}

function showErrors(errors) {
  document.getElementById('err-title').textContent = errors.title || '';
  document.getElementById('err-date').textContent  = errors.date  || '';
  document.getElementById('err-start').textContent = errors.start || '';
  document.getElementById('err-end').textContent   = errors.end   || '';
  document.getElementById('err-desc').textContent  = errors.desc  || '';

  toggleInvalid('field-title', !!errors.title);
  toggleInvalid('field-date',  !!errors.date);
  toggleInvalid('field-start', !!errors.start);
  toggleInvalid('field-end',   !!errors.end);
  toggleInvalid('field-desc',  !!errors.desc);
}

function clearErrors() {
  showErrors({});
}

function toggleInvalid(id, invalid) {
  // Time fields are split into three selects; mark all three.
  const ids = (id === 'field-start' || id === 'field-end')
    ? [`${id}-hour`, `${id}-min`, `${id}-ampm`]
    : [id];
  ids.forEach(sid => {
    const el = document.getElementById(sid);
    if (el) el.classList.toggle('invalid', invalid);
  });
}

// ── 9. Color Swatches ────────────────────────────────────────

function renderColorSwatches(selectedColor) {
  const container = document.getElementById('color-swatches');
  container.innerHTML = '';
  COLOR_PALETTE.forEach(color => {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    const isSelected = color === selectedColor;
    // Store color in data attribute for reliable identity lookups
    swatch.dataset.color = color;
    swatch.className = [
      'w-[1.65rem] h-[1.65rem] rounded-full cursor-pointer border-2 transition-transform',
      'hover:scale-110 focus-visible:outline-2 focus-visible:outline-gc-blue focus-visible:outline-offset-2',
      isSelected ? 'border-gc-text scale-110' : 'border-transparent',
    ].join(' ');
    swatch.style.background = color;
    swatch.setAttribute('aria-label', COLOR_NAMES[color] || color);
    swatch.setAttribute('aria-pressed', String(isSelected));
    swatch.addEventListener('click', () => {
      state.selectedColor = color;
      container.querySelectorAll('[data-color]').forEach(s => {
        const pressed = s.dataset.color === color;
        s.classList.toggle('border-gc-text', pressed);
        s.classList.toggle('scale-110', pressed);
        s.classList.toggle('border-transparent', !pressed);
        s.setAttribute('aria-pressed', String(pressed));
      });
    });
    container.appendChild(swatch);
  });
}

// ── 10. Toast ────────────────────────────────────────────────

let toastTimer = null;

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}

// ── 11. Event Handlers ───────────────────────────────────────

function handleDayCellClick(e) {
  // Ignore clicks that originated on a chip or more-link
  if (e.target.closest('[data-event-id]') || e.target.closest('[aria-label*="more event"]')) return;

  const cell = e.currentTarget;
  const dateStr = cell.dataset.date;
  // Only allow adding events on current-month cells
  if (!cell.hasAttribute('tabindex')) return; // other-month cells have no tabindex
  openModal(dateStr, cell);
}

function handleChipClick(e) {
  e.stopPropagation(); // prevent day cell click
  const btn = e.currentTarget;
  const id = btn.dataset.eventId;
  const event = getEventById(id);
  if (event) openEditModal(event, btn);
}

function handleFormSubmit(e) {
  e.preventDefault();
  const data = readForm();
  const errors = validateForm(data);

  if (Object.keys(errors).length > 0) {
    showErrors(errors);
    return;
  }

  clearErrors();

  if (state.modalMode === 'add') {
    const newEvent = {
      id: crypto.randomUUID(),
      ...data,
    };
    state.events.push(newEvent);
    showToast('Event added.');
  } else {
    state.events = state.events.map(ev =>
      ev.id === state.editingId ? { id: ev.id, ...data } : ev
    );
    showToast('Event updated.');
  }

  saveEvents(state.events);
  closeModal();
  renderGrid();
}

function handleDelete() {
  if (!state.editingId) return;
  if (!confirm('Delete this event? This cannot be undone.')) return;
  state.events = state.events.filter(ev => ev.id !== state.editingId);
  saveEvents(state.events);
  showToast('Event deleted.');
  closeModal();
  renderGrid();
}

// ── 12. Global Listeners ─────────────────────────────────────

function attachGlobalListeners() {
  // Month navigation
  document.getElementById('btn-prev').addEventListener('click', () => {
    state.currentMonth--;
    if (state.currentMonth < 0) { state.currentMonth = 11; state.currentYear--; }
    renderAll();
  });

  document.getElementById('btn-next').addEventListener('click', () => {
    state.currentMonth++;
    if (state.currentMonth > 11) { state.currentMonth = 0; state.currentYear++; }
    renderAll();
  });

  document.getElementById('btn-today').addEventListener('click', () => {
    const now = getToday();
    state.currentYear  = now.getFullYear();
    state.currentMonth = now.getMonth();
    renderAll();
  });

  // Modal close buttons
  document.getElementById('btn-modal-close').addEventListener('click', closeModal);
  document.getElementById('btn-cancel').addEventListener('click', closeModal);

  // Close on backdrop click
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });

  // Escape closes modal; Tab is trapped inside modal
  document.addEventListener('keydown', e => {
    const overlay = document.getElementById('modal-overlay');
    if (overlay.hidden) return;

    if (e.key === 'Escape') {
      closeModal();
      return;
    }

    if (e.key === 'Tab') {
      const modal = document.getElementById('modal');
      const focusable = Array.from(modal.querySelectorAll(
        'button:not([hidden]), input, textarea, [tabindex="0"]'
      )).filter(el => !el.disabled);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    }
  });

  // Form submit
  document.getElementById('event-form').addEventListener('submit', handleFormSubmit);

  // Delete button
  document.getElementById('btn-delete').addEventListener('click', handleDelete);

  // Description char counter
  document.getElementById('field-desc').addEventListener('input', e => {
    document.getElementById('desc-count').textContent = e.target.value.length;
  });
}

// ── 13. Init ─────────────────────────────────────────────────

function seedSampleEvent() {
  if (loadEvents().length > 0) return; // only seed on first load
  const sample = {
    id:          crypto.randomUUID(),
    title:       'Team Standup',
    date:        formatDate(getToday()),
    startTime:   '09:00',
    endTime:     '09:30',
    description: 'Daily sync with the team.',
    color:       COLOR_PALETTE[0],
  };
  saveEvents([sample]);
}

function init() {
  seedSampleEvent();
  state.events = loadEvents();
  renderWeekdayRow();
  renderAll();
  attachGlobalListeners();
  // Wire sidebar Create button to open today's modal
  const sidebarCreate = document.getElementById('btn-create-sidebar');
  if (sidebarCreate) {
    sidebarCreate.addEventListener('click', () => openModal(formatDate(getToday()), sidebarCreate));
  }
}

document.addEventListener('DOMContentLoaded', init);
