/* ============================================================
   Calendar App — app.js
   ============================================================ */

// ── 1. Constants ────────────────────────────────────────────
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const COLOR_PALETTE = [
  '#4a90e2', // blue (default)
  '#e74c3c', // red
  '#2ecc71', // green
  '#f39c12', // orange
  '#9b59b6', // purple
  '#1abc9c', // teal
  '#e91e63', // pink
  '#607d8b', // grey-blue
];

const STORAGE_KEY = 'calendarEvents';
const MAX_CHIPS = 3;

// ── 2. State ─────────────────────────────────────────────────
const today = new Date();
const state = {
  currentYear:  today.getFullYear(),
  currentMonth: today.getMonth(), // 0-indexed
  events:       [],
  modalMode:    'add',   // 'add' | 'edit'
  editingId:    null,
  selectedColor: COLOR_PALETTE[0],
};

// ── 3. Storage ───────────────────────────────────────────────
function loadEvents() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveEvents(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

// ── 4. Date Helpers ──────────────────────────────────────────

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
  return formatDate(date) === formatDate(today);
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
}

function renderWeekdayRow() {
  const row = document.getElementById('weekday-row');
  row.innerHTML = '';
  DAYS_OF_WEEK.forEach(day => {
    const cell = document.createElement('div');
    cell.className = 'weekday-cell';
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
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    cell.className = [
      'day-cell',
      !isCurrentMonth ? 'other-month' : '',
      isWeekend       ? 'weekend'     : '',
      isToday(date)   ? 'today'       : '',
    ].filter(Boolean).join(' ');

    cell.dataset.date = dateStr;

    // Day number
    const numEl = document.createElement('span');
    numEl.className = 'day-number';
    numEl.textContent = date.getDate();
    cell.appendChild(numEl);

    // Event chips
    if (isCurrentMonth) {
      const dayEvents = getEventsForDate(dateStr);
      const visible   = dayEvents.slice(0, MAX_CHIPS);
      const overflow  = dayEvents.length - MAX_CHIPS;

      visible.forEach(ev => {
        const chip = document.createElement('button');
        chip.className = 'event-chip';
        chip.style.background = ev.color || COLOR_PALETTE[0];
        chip.textContent = ev.startTime ? `${ev.startTime} ${ev.title}` : ev.title;
        chip.dataset.eventId = ev.id;
        chip.addEventListener('click', handleChipClick);
        cell.appendChild(chip);
      });

      if (overflow > 0) {
        const more = document.createElement('span');
        more.className = 'more-events';
        more.textContent = `+${overflow} more`;
        cell.appendChild(more);
      }
    }

    // Click on empty area of cell → add event
    cell.addEventListener('click', handleDayCellClick);

    grid.appendChild(cell);
  });
}

// ── 7. Modal Control ─────────────────────────────────────────

function openModal(dateStr) {
  state.modalMode = 'add';
  state.editingId = null;

  document.getElementById('modal-title').textContent = 'Add Event';
  document.getElementById('btn-delete').hidden = true;
  document.getElementById('btn-save').textContent = 'Save Event';

  clearForm();
  clearErrors();
  document.getElementById('field-date').value = dateStr || '';
  renderColorSwatches(COLOR_PALETTE[0]);

  showOverlay();
}

function openEditModal(event) {
  state.modalMode = 'edit';
  state.editingId = event.id;

  document.getElementById('modal-title').textContent = 'Edit Event';
  document.getElementById('btn-delete').hidden = false;
  document.getElementById('btn-save').textContent = 'Update Event';

  clearErrors();
  populateForm(event);
  renderColorSwatches(event.color || COLOR_PALETTE[0]);

  showOverlay();
}

function closeModal() {
  document.getElementById('modal-overlay').hidden = true;
  state.modalMode = 'add';
  state.editingId = null;
}

function showOverlay() {
  document.getElementById('modal-overlay').hidden = false;
  document.getElementById('field-title').focus();
}

// ── 8. Form Helpers ──────────────────────────────────────────

function clearForm() {
  document.getElementById('event-form').reset();
  document.getElementById('desc-count').textContent = '0';
  state.selectedColor = COLOR_PALETTE[0];
}

function populateForm(event) {
  document.getElementById('field-title').value = event.title       || '';
  document.getElementById('field-date').value  = event.date        || '';
  document.getElementById('field-start').value = event.startTime   || '';
  document.getElementById('field-end').value   = event.endTime     || '';
  document.getElementById('field-desc').value  = event.description || '';
  document.getElementById('desc-count').textContent =
    (event.description || '').length;
  state.selectedColor = event.color || COLOR_PALETTE[0];
}

function readForm() {
  return {
    title:       document.getElementById('field-title').value.trim(),
    date:        document.getElementById('field-date').value,
    startTime:   document.getElementById('field-start').value,
    endTime:     document.getElementById('field-end').value,
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

  // Mark invalid fields
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
  const el = document.getElementById(id);
  if (invalid) {
    el.classList.add('invalid');
  } else {
    el.classList.remove('invalid');
  }
}

// ── 9. Color Swatches ────────────────────────────────────────

function renderColorSwatches(selectedColor) {
  const container = document.getElementById('color-swatches');
  container.innerHTML = '';
  COLOR_PALETTE.forEach(color => {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = 'color-swatch' + (color === selectedColor ? ' selected' : '');
    swatch.style.background = color;
    swatch.title = color;
    swatch.addEventListener('click', () => {
      state.selectedColor = color;
      container.querySelectorAll('.color-swatch').forEach(s => {
        s.classList.toggle('selected', s.style.background === hexToRgb(color) ||
                                        s.title === color);
      });
    });
    container.appendChild(swatch);
  });
}

/** Browser converts hex to rgb in style; compare by title instead. */
function hexToRgb(hex) {
  // Not actually used — comparison done via title attribute
  return hex;
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
  if (e.target.closest('.event-chip') || e.target.closest('.more-events')) return;

  const cell = e.currentTarget;
  const dateStr = cell.dataset.date;
  // Only allow adding events on current-month cells
  if (cell.classList.contains('other-month')) return;
  openModal(dateStr);
}

function handleChipClick(e) {
  e.stopPropagation(); // prevent day cell click
  const id = e.currentTarget.dataset.eventId;
  const event = getEventById(id);
  if (event) openEditModal(event);
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
    if (state.currentMonth < 0) {
      state.currentMonth = 11;
      state.currentYear--;
    }
    renderHeader();
    renderGrid();
  });

  document.getElementById('btn-next').addEventListener('click', () => {
    state.currentMonth++;
    if (state.currentMonth > 11) {
      state.currentMonth = 0;
      state.currentYear++;
    }
    renderHeader();
    renderGrid();
  });

  document.getElementById('btn-today').addEventListener('click', () => {
    state.currentYear  = today.getFullYear();
    state.currentMonth = today.getMonth();
    renderHeader();
    renderGrid();
  });

  // Modal close buttons
  document.getElementById('btn-modal-close').addEventListener('click', closeModal);
  document.getElementById('btn-cancel').addEventListener('click', closeModal);

  // Close on backdrop click
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !document.getElementById('modal-overlay').hidden) {
      closeModal();
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
    date:        formatDate(today),
    startTime:   '09:00',
    endTime:     '09:30',
    description: 'Daily sync with the team.',
    color:       '#4a90e2',
  };
  saveEvents([sample]);
}

function init() {
  seedSampleEvent();
  state.events = loadEvents();
  renderWeekdayRow();
  renderHeader();
  renderGrid();
  attachGlobalListeners();
  console.log('Calendar App loaded.');
}

document.addEventListener('DOMContentLoaded', init);
