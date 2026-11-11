import { state } from './state.js';
import { getCardTypes, getAllSpaces, setActiveType, refreshSpaceIndicator } from './spaces.js';
import {
  getMemosAuthToken, createSpace, updateSpaceDescription, listMemosForSpace, patchMemoContent
} from './api.js';
import {
  V3_VERSION, defaultType, markerFromType, sectionKeys, mapSectionKeys
} from './card-types.js';
import { parseCardV3, parseCardMemo } from './card-model.js';
import { escapeHtml, copyText, getCurrentSpace } from './utils.js';

/**
 * R4: the separate management button opens this panel. It lists every card type,
 * edits its section definitions (add / remove / reorder), reorders types,
 * declares unmarked spaces and assists migration of incompatible notes.
 *
 * Panels reuse #lc-space-info-overlay / #lc-space-info-body from editor.js.
 */

let draftType = null;
let migrationPlan = [];
let migrationType = null;
let colorDrag = null;
let currentPageTypeId = null;
let selectCurrentSpaceOnNextRender = false;
const sectionHsv = new WeakMap();

function status(message, isError) {
  const el = document.getElementById('lc-manager-status');
  if (!el) return;
  el.innerText = message;
  el.className = `lc-manager-status${isError ? ' lc-manager-error' : ''}`;
}

function spaceDescriptionFor(name) {
  const space = state.allSpaces.find(s => s.name === name);
  return space ? (space.description || '') : '';
}

/** Keep human-readable prose around the marker when rewriting a description. */
function replaceMarker(description, marker) {
  const text = String(description || '');
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) return `${text.trim()}\n${marker}`.trim();
  return `${text.substring(0, start)}${marker}${text.substring(end + 1)}`;
}

function hexToHsv(value) {
  const match = String(value || '').match(/^#?([0-9a-f]{6})$/i);
  if (!match) return { h: 198, s: 0.75, v: 0.9 };
  const hex = match[1];
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  if (delta) {
    if (max === r) h = 60 * (((g - b) / delta) % 6);
    else if (max === g) h = 60 * ((b - r) / delta + 2);
    else h = 60 * ((r - g) / delta + 4);
  }
  if (h < 0) h += 360;
  return { h, s: max ? delta / max : 0, v: max };
}

function colorHsvFor(section) {
  if (!sectionHsv.has(section)) sectionHsv.set(section, hexToHsv(section.color));
  return sectionHsv.get(section);
}

function hsvToHex(h, s, v) {
  const chroma = v * s;
  const section = h / 60;
  const x = chroma * (1 - Math.abs((section % 2) - 1));
  const [r1, g1, b1] = section < 1 ? [chroma, x, 0]
    : section < 2 ? [x, chroma, 0]
      : section < 3 ? [0, chroma, x]
        : section < 4 ? [0, x, chroma]
          : section < 5 ? [x, 0, chroma]
            : [chroma, 0, x];
  const m = v - chroma;
  return `#${[r1, g1, b1].map(channel => Math.round((channel + m) * 255)
    .toString(16).padStart(2, '0')).join('')}`;
}

function colorPickerMarkup(section, index) {
  const hsv = colorHsvFor(section);
  return `
    <div class="lc-color-control">
      <input class="lc-form-input" data-field="color" data-sec-index="${index}" value="${escapeHtml(section.color)}" placeholder="#38bdf8" title="Hex colour" />
      <button type="button" class="lc-btn-icon lc-color-picker-toggle" data-action="color-picker-toggle" data-sec-index="${index}" aria-label="Choose section colour" aria-expanded="false">
        <span id="lc-color-swatch-${index}" class="lc-color-swatch" style="background-color:${escapeHtml(section.color)}"></span>
      </button>
      <div id="lc-color-picker-${index}" class="lc-color-picker" data-sec-index="${index}" hidden>
        <div class="lc-color-spectrum" data-color-spectrum="${index}" role="slider" tabindex="0" aria-label="Colour hue and saturation" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(hsv.h / 360 * 100)}"
          style="--lc-picker-hue:${hsv.h}; --lc-picker-brightness:${hsv.v}; --lc-picker-x:${hsv.h / 360 * 100}%; --lc-picker-y:${(1 - hsv.s) * 100}%">
          <span id="lc-color-spectrum-point-${index}" class="lc-color-spectrum-point"></span>
        </div>
        <input class="lc-color-brightness" type="range" min="0" max="100" value="${Math.round(hsv.v * 100)}" orient="vertical" data-color-brightness="${index}" aria-label="Brightness" title="Brightness"
          style="--lc-picker-color:${hsvToHex(hsv.h, hsv.s, 1)}" />
      </div>
    </div>`;
}

function sectionRowHtml(section, index) {
  return `
    <div class="lc-section-row" data-sec-row="${index}">
      <input class="lc-form-input" data-field="key" data-sec-index="${index}" value="${escapeHtml(section.key)}" placeholder="key" title="the key stored in the note" />
      <input class="lc-form-input" data-field="label" data-sec-index="${index}" value="${escapeHtml(section.label)}" placeholder="label" title="display label (the chip code is derived from this)" />
      ${colorPickerMarkup(section, index)}
      <button type="button" class="lc-btn-icon" data-action="section-toggle-hidden" data-sec-index="${index}" title="${section.defaultHidden ? 'Hidden by default — click to show by default' : 'Shown by default — click to hide by default'}">${section.defaultHidden ? '🚫' : '👁'}</button>
      <button type="button" class="lc-btn-icon" data-action="section-up" data-sec-index="${index}" title="Move up">↑</button>
      <button type="button" class="lc-btn-icon" data-action="section-down" data-sec-index="${index}" title="Move down">↓</button>
      <button type="button" class="lc-btn-icon" data-action="section-remove" data-sec-index="${index}" title="Remove">✕</button>
    </div>`;
}

/**
 * One type = one card. The definition editor opens INSIDE the card being
 * edited, so "which one is being edited" is answered by the layout itself —
 * no stale badges, no separate Definition block below.
 */
function typeCardHtml(type, index, total, inUseId) {
  const isNewCardTarget = type.id === inUseId;
  const currentPage = type.id === currentPageTypeId;
  const open = Boolean(draftType && draftType.id === type.id);
  const aliasCount = Object.keys(type.sectionAliases || {}).length;
  return `
    <li class="lc-type-card${open ? ' lc-type-open' : ''}">
      <div class="lc-type-card-head">
        <button type="button" class="lc-type-card-title" data-action="type-edit" data-type-id="${escapeHtml(type.id)}" title="Click to edit this type">
          <b>${escapeHtml(type.name)}</b>
          ${currentPage ? '<span class="lc-type-badge-current">Current space</span>' : ''}
          <span class="lc-type-meta">
            ${escapeHtml(type.spaceName || 'no space')} &middot;
            ${type.sections.length ? type.sections.map(s => escapeHtml(s.label)).join(' · ') : 'no sections yet'} &middot;
            per-language + unified explanations
            ${aliasCount ? ` &middot; ${aliasCount} name alias${aliasCount > 1 ? 'es' : ''}` : ''}
          </span>
        </button>
        <div class="lc-type-row-actions">
          <button type="button" class="lc-btn-icon" data-action="type-up" data-type-id="${escapeHtml(type.id)}" ${index === 0 ? 'disabled' : ''} title="Move up">↑</button>
          <button type="button" class="lc-btn-icon" data-action="type-down" data-type-id="${escapeHtml(type.id)}" ${index === total - 1 ? 'disabled' : ''} title="Move down">↓</button>
          ${isNewCardTarget ? '' : `<button type="button" class="lc-btn lc-btn-secondary" data-action="type-use" data-type-id="${escapeHtml(type.id)}">Use for new cards</button>`}
          <button type="button" class="lc-btn lc-btn-secondary" data-action="type-edit" data-type-id="${escapeHtml(type.id)}">${open ? 'Close' : 'Edit'}</button>
        </div>
      </div>
      ${open ? `<div class="lc-type-card-body">${typeEditorHtml()}</div>` : ''}
    </li>`;
}

function typeEditorHtml() {
  const type = draftType;
  return `
    <div class="lc-manager-grid">
      <label class="lc-form-label">Name <input id="lc-type-name" class="lc-form-input" value="${escapeHtml(type.name)}" /></label>
      <span class="lc-manager-hint">Cards support per-language explanations and one unified explanation.</span>
    </div>
    <div class="lc-editor-block">
      <h4>Language sections</h4>
      <p class="lc-manager-hint">Each section = one key stored in the note + its display label (the short chip code is derived from the label) + colour. The order below is the left-to-right order in cards and the JSON key order. The 👁 / 🚫 button decides whether the section starts open or closed when creating a new card.</p>
      <div id="lc-section-rows">${type.sections.map(sectionRowHtml).join('') || '<p class="lc-manager-hint">No sections yet — add one below.</p>'}</div>
      <button type="button" class="lc-btn lc-btn-secondary" id="lc-add-section-btn">+ Add section</button>
    </div>
    <div class="lc-manager-actions">
      <button type="button" class="lc-btn lc-btn-primary" id="lc-save-type-btn">Save to space description</button>
      <button type="button" class="lc-btn lc-btn-secondary" id="lc-copy-marker-btn">Copy marker JSON</button>
    </div>
    <pre id="lc-marker-preview" class="lc-preview-box">${escapeHtml(markerFromType(draftType))}</pre>
    <p class="lc-manager-hint">Writing requires space administrator rights; otherwise copy this marker into the space description manually.</p>`;
}

/** Clicking the card title toggles its inline definition editor. */
function openTypeEditor(typeId) {
  if (draftType && draftType.id === typeId) {
    draftType = null;
  } else {
    const type = state.types.find(t => t.id === typeId);
    draftType = type ? JSON.parse(JSON.stringify(type)) : null;
  }
  renderTypeList();
}

function renderTypeList() {
  const host = document.getElementById('lc-type-list');
  if (!host) return;
  const types = state.types;
  const inUseType = state.activeType || types[0];
  host.innerHTML = types.map((t, i) => typeCardHtml(t, i, types.length, inUseType && inUseType.id)).join('')
    || '<li>No card types yet — declare a space below.</li>';
}

async function writeTypeMarker(type, successMessage) {
  const marker = markerFromType(type);
  const description = replaceMarker(spaceDescriptionFor(type.spaceName), marker);
  const token = await getMemosAuthToken();
  const res = await updateSpaceDescription(type.spaceName, description, token);
  if (res && res.ok) {
    status(successMessage || 'Marker saved.');
    await getCardTypes({ force: true });
    if (typeof state.onCardTypesChanged === 'function') state.onCardTypesChanged();
    await refreshSpaceIndicator(true);
    await renderManager();
    return true;
  }
  const code = res ? res.status : 'no response';
  status(
    `Could not write the space description (HTTP ${code}). ` +
    (code === 401 || code === 403
      ? 'Admin rights are required — copy the marker below into the space description yourself.'
      : 'The marker JSON is shown below for manual use.'),
    true
  );
  const preview = document.getElementById('lc-marker-preview');
  if (preview) preview.innerText = marker;
  return false;
}

function collectDraft() {
  const name = document.getElementById('lc-type-name');
  if (!draftType) return null;
  if (name && name.value) draftType.name = name.value;
  // sectionAliases are produced by the migration wizard only — keep them as-is.
  draftType.sections = draftType.sections.filter(s => s && s.key);
  if (!draftType.sections.length) {
    status('A card type needs at least one section.', true);
    return null;
  }
  if (draftType.sections.some(section => !/^#[0-9a-f]{6}$/i.test(section.color))) {
    status('Section colours must be six-digit hex values (for example #38bdf8).', true);
    return null;
  }
  const preview = document.getElementById('lc-marker-preview');
  if (preview) preview.innerText = markerFromType(draftType);
  return draftType;
}

function updateSectionColor(index, h, s, v) {
  const section = draftType && draftType.sections[index];
  if (!section) return;
  const nextHsv = {
    h: Math.max(0, Math.min(360, h)),
    s: Math.max(0, Math.min(1, s)),
    v: Math.max(0, Math.min(1, v))
  };
  sectionHsv.set(section, nextHsv);
  section.color = hsvToHex(nextHsv.h, nextHsv.s, nextHsv.v);
  const input = document.querySelector(`[data-field="color"][data-sec-index="${index}"]`);
  const swatch = document.getElementById(`lc-color-swatch-${index}`);
  const spectrum = document.querySelector(`[data-color-spectrum="${index}"]`);
  const point = document.getElementById(`lc-color-spectrum-point-${index}`);
  const brightness = document.querySelector(`[data-color-brightness="${index}"]`);
  if (input) input.value = section.color;
  if (swatch) swatch.style.backgroundColor = section.color;
  if (spectrum) {
    spectrum.style.setProperty('--lc-picker-hue', String(nextHsv.h));
    spectrum.style.setProperty('--lc-picker-brightness', String(nextHsv.v));
    spectrum.style.setProperty('--lc-picker-x', `${nextHsv.h / 360 * 100}%`);
    spectrum.style.setProperty('--lc-picker-y', `${(1 - nextHsv.s) * 100}%`);
    spectrum.setAttribute('aria-valuenow', String(Math.round(nextHsv.h / 360 * 100)));
  }
  if (point) {
    point.style.left = `${nextHsv.h / 360 * 100}%`;
    point.style.top = `${(1 - nextHsv.s) * 100}%`;
  }
  if (brightness) {
    brightness.value = String(Math.round(nextHsv.v * 100));
    brightness.style.setProperty('--lc-picker-color', hsvToHex(nextHsv.h, nextHsv.s, 1));
  }
  const preview = document.getElementById('lc-marker-preview');
  if (preview) preview.innerText = markerFromType(draftType);
}

function updateColorFromPointer(event) {
  if (!colorDrag || !draftType || !draftType.sections[colorDrag.index]) return;
  const rect = colorDrag.spectrum.getBoundingClientRect();
  const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
  const current = colorHsvFor(draftType.sections[colorDrag.index]);
  updateSectionColor(colorDrag.index, x * 360, 1 - y, current.v);
}

function stopColorDrag() {
  colorDrag = null;
  document.removeEventListener('pointermove', updateColorFromPointer);
  document.removeEventListener('pointerup', stopColorDrag);
}

// --- R4 migration wizard: its own window; mappings are chosen per scanned
// note with the real key values visible, never typed blind into a JSON box ---

function migrationOverlay() {
  let overlay = document.getElementById('lc-migration-overlay');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'lc-migration-overlay';
  overlay.className = 'lc-modal-overlay lc-migration-overlay';
  overlay.style.display = 'none';
  overlay.onclick = (e) => {
    if (e.target === overlay) closeMigrationWizard();
  };
  overlay.innerHTML = `
    <div class="lc-modal-dialog lc-migration-dialog">
      <div class="lc-modal-header">
        <div class="lc-modal-title-row">
          <h3 class="lc-modal-title"><span>🔧</span><span id="lc-migration-title">Migrate incompatible notes</span></h3>
        </div>
        <div class="lc-modal-header-actions">
          <button type="button" class="lc-modal-close" id="lc-migration-close-btn" title="Close (Esc)">&times;</button>
        </div>
      </div>
      <div class="lc-modal-body" id="lc-migration-body">
        <p class="lc-manager-hint">Scanning…</p>
      </div>
      <div class="lc-modal-footer">
        <label class="lc-migration-save" title="Persist the choices so future notes / renders match automatically">
          <input type="checkbox" id="lc-migration-save-aliases" checked />
          Save chosen mappings as section aliases
        </label>
        <div style="display:flex; gap:10px;">
          <button type="button" class="lc-btn lc-btn-secondary" id="lc-migration-preview-btn">Preview</button>
          <button type="button" class="lc-btn lc-btn-primary" id="lc-migration-apply-btn">Migrate</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  const closeBtn = document.getElementById('lc-migration-close-btn');
  if (closeBtn) closeBtn.onclick = closeMigrationWizard;
  const previewBtn = document.getElementById('lc-migration-preview-btn');
  if (previewBtn) previewBtn.onclick = showMigrationPreview;
  const applyBtn = document.getElementById('lc-migration-apply-btn');
  if (applyBtn) applyBtn.onclick = runMigration;

  const body = document.getElementById('lc-migration-body');
  if (body) {
    body.addEventListener('change', (e) => {
      const noteIndex = e.target && e.target.getAttribute ? Number(e.target.getAttribute('data-mig-note')) : NaN;
      const rowIndex = e.target && e.target.getAttribute ? Number(e.target.getAttribute('data-mig-row')) : NaN;
      if (Number.isNaN(noteIndex) || Number.isNaN(rowIndex)) return;
      const row = migrationPlan[noteIndex] && migrationPlan[noteIndex].rows[rowIndex];
      if (row) row.target = e.target.value || '__keep';
    });
  }
  document.addEventListener('keydown', (ev) => {
    const el = document.getElementById('lc-migration-overlay');
    if (ev.key === 'Escape' && el && el.style.display !== 'none') {
      closeMigrationWizard();
    }
  }, true);
  return overlay;
}

function closeMigrationWizard() {
  const overlay = document.getElementById('lc-migration-overlay');
  if (overlay) overlay.style.display = 'none';
}

function migrationStatus(message, isError) {
  const el = document.getElementById('lc-migration-status');
  if (!el) return;
  el.innerText = message;
  el.className = `lc-manager-status${isError ? ' lc-manager-error' : ''}`;
}

function collectMigrationMapping(note) {
  const mapping = {};
  (note ? note.rows : []).forEach(row => {
    if (row.target && row.target !== '__keep') mapping[row.key] = row.target;
  });
  return mapping;
}

function migrationCardMarkup(raw, type) {
  const parsed = parseCardV3(raw);
  const legacy = parsed ? null : parseCardMemo(raw, type.spaceName);
  const values = parsed ? parsed.values : (legacy ? legacy.data : null);
  if (!values) return '<p class="lc-manager-hint">Could not render this note as a card.</p>';

  const reserved = ['_t', 'v', '_e', '_u', '_s', '_x', '_eh'];
  const keys = Object.keys(values).filter(key => !reserved.includes(key));
  const sections = [
    ...type.sections.filter(section => keys.includes(section.key)),
    ...keys.filter(key => !type.sections.some(section => section.key === key))
      .map(key => ({ key, label: key, color: '#94a3b8' }))
  ];
  const enabled = parsed && parsed.enabledSections.length
    ? parsed.enabledSections
    : keys.filter(key => String(values[key] || '').trim());
  const visible = sections.filter(section => enabled.includes(section.key));
  const tags = parsed ? parsed.tags : (legacy ? legacy.tags : []);
  return `
    <div class="lc-card-wrapper lc-migration-preview-card">
      <div class="lc-card-grid" style="--lc-cols:${Math.max(1, visible.length)}">
        ${visible.map(section => `
          <div class="lc-card-slot">
            <div class="lc-card-header"><span class="lc-card-badge" style="color:${escapeHtml(section.color)}">${escapeHtml(section.label)}</span></div>
            <div class="lc-card-text">${escapeHtml(String(values[section.key] || '')) || '—'}</div>
          </div>`).join('') || '<p class="lc-manager-hint">No visible language sections.</p>'}
      </div>
      ${tags.length ? `<div class="lc-card-tags">${tags.map(tag => `<span class="lc-tag-chip">${escapeHtml(tag)}</span>`).join('')}</div>` : ''}
    </div>`;
}

function renderMigrationList() {
  const body = document.getElementById('lc-migration-body');
  if (!body) return;
  const type = migrationType;
  if (!migrationPlan.length) {
    body.innerHTML = '<p class="lc-manager-hint">No incompatible notes found in this space.</p><div id="lc-migration-status" class="lc-manager-status"></div>';
    return;
  }
  body.innerHTML = `
    <p class="lc-manager-hint">Every note below belongs to <b>${escapeHtml(type ? type.name : '')}</b> in <b>${escapeHtml(type ? type.spaceName : '')}</b>. Choose a target section separately for each note and key; "keep as-is" leaves the key untouched. Nothing is written until you press Migrate.</p>
    ${migrationPlan.map((note, ni) => `
      <div class="lc-migration-note">
        <div class="lc-migration-note-head">
          <b>${escapeHtml(note.memoName || 'memo')}</b>
          <span class="lc-space-info-uid">${escapeHtml(note.kind)}</span>
        </div>
        ${note.rows.map((row, ri) => `
          <div class="lc-migration-key-row">
            <code class="lc-migration-key">${escapeHtml(row.key)}</code>
            <select class="lc-form-input lc-migration-target" data-mig-note="${ni}" data-mig-row="${ri}">
              <option value="__keep" ${row.target === '__keep' ? 'selected' : ''}>keep as-is</option>
              ${(type ? type.sections : []).map(s => `<option value="${escapeHtml(s.key)}" ${row.target === s.key ? 'selected' : ''}>${escapeHtml(s.label)} (${escapeHtml(s.key)})</option>`).join('')}
            </select>
            <span class="lc-migration-sample">"${escapeHtml(row.sample)}"</span>
          </div>`).join('')}
      </div>`).join('')}
    <div id="lc-migration-preview"></div>
    <div id="lc-migration-status" class="lc-manager-status"></div>`;
}

function showMigrationPreview() {
  const host = document.getElementById('lc-migration-preview');
  if (!host || !migrationType) return;
  host.innerHTML = migrationPlan.map((note, index) => {
    const mapping = collectMigrationMapping(note);
    const after = migratedContent(note.raw, mapping);
    return `
      <section class="lc-migration-preview-note">
        <h4>${escapeHtml(note.memoName || 'memo')}</h4>
        <div class="lc-migration-preview-columns">
          <div class="lc-migration-preview-column">
            <h4>Current card · ${escapeHtml(note.kind)}</h4>
            ${migrationCardMarkup(note.raw, migrationType)}
            <pre class="lc-migration-json">${escapeHtml(note.raw)}</pre>
          </div>
          <div class="lc-migration-preview-column">
            <h4>After migration · V3</h4>
            ${after ? migrationCardMarkup(after, migrationType) : '<p class="lc-manager-error">Could not generate migrated content.</p>'}
            <pre class="lc-migration-json">${escapeHtml(after || '(unparseable)')}</pre>
          </div>
        </div>
      </section>`;
  }).join('') || '<p class="lc-manager-hint">Nothing to preview.</p>';
}

/** Rename keys in the JSON object, keep the tail tags and bump v to 3. */
function migratedContent(rawText, mapping) {
  const start = rawText.indexOf('{');
  const end = rawText.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  let data;
  try { data = JSON.parse(rawText.substring(start, end + 1)); } catch (e) { return null; }
  const mapped = mapSectionKeys(data, mapping);
  mapped._t = data._t || 'lc';
  mapped.v = V3_VERSION;
  return `${rawText.substring(0, start)}${JSON.stringify(mapped)}${rawText.substring(end + 1)}`;
}

async function openMigrationWizard(typeId, memoName) {
  const type = state.types.find(candidate => candidate.id === typeId)
    || (memoName ? null : state.activeType || state.types[0]);
  if (!type || !type.spaceName) {
    status('Pick a card type bound to a space first.', true);
    return;
  }
  migrationType = type;
  const overlay = migrationOverlay();
  overlay.style.display = 'flex';
  const title = document.getElementById('lc-migration-title');
  if (title) {
    title.innerText = memoName
      ? `Migrate note — ${type.name}`
      : `Migrate notes — ${type.name} (${type.spaceName})`;
  }
  const body = document.getElementById('lc-migration-body');
  if (body) body.innerHTML = '<p class="lc-manager-hint">Scanning notes in this space…</p>';
  try {
    const token = await getMemosAuthToken();
    const memos = await listMemosForSpace(type.spaceName, token);
    const keys = sectionKeys(type);
    migrationPlan = memos.filter(memo => !memoName || memo.name === memoName).map(memo => {
      const raw = String(memo.content || '');
      const v3 = parseCardV3(raw);
      const legacy = v3 ? null : parseCardMemo(raw, type.spaceName);
      const values = v3 ? v3.values : (legacy ? legacy.data : null);
      if (!values) return null;
      const rows = Object.keys(values)
        .filter(k => !['_t', 'v', '_e', '_x'].includes(k) && !keys.includes(k))
        .map(k => ({
          key: k,
          sample: String(values[k] || '').replace(/\s+/g, ' ').slice(0, 40),
          // Default to a saved alias when it matches a section; otherwise leave
          // "keep as-is" so the user makes an explicit, visible choice.
          target: type.sectionAliases[k] && keys.includes(type.sectionAliases[k])
            ? type.sectionAliases[k]
            : '__keep'
        }));
      return rows.length
        ? { memoName: memo.name || '', raw, kind: v3 ? 'V3, unknown keys' : 'V2 / legacy keys', rows }
        : null;
    }).filter(Boolean);
    renderMigrationList();
  } catch (err) {
    migrationPlan = [];
    if (body) {
      body.innerHTML = `<p class="lc-manager-error">Could not list memos: ${escapeHtml(err.message)}. Check your token / space permissions.</p>`;
    }
  }
}

async function runMigration() {
  if (!migrationPlan.length) return;
  const token = await getMemosAuthToken();
  let done = 0;
  let failed = 0;
  for (const note of migrationPlan) {
    const mapping = collectMigrationMapping(note);
    const content = migratedContent(note.raw, mapping);
    if (!content) { failed++; continue; }
    try {
      const res = await patchMemoContent(note.memoName, content, token);
      if (res && res.ok) done++; else failed++;
    } catch (e) {
      failed++;
    }
  }

  let aliasNote = '';
  const saveBox = document.getElementById('lc-migration-save-aliases');
  if (saveBox && saveBox.checked && migrationType && done > 0) {
    const agreedMappings = {};
    const conflictingKeys = new Set();
    migrationPlan.forEach(note => {
      Object.entries(collectMigrationMapping(note)).forEach(([key, target]) => {
        if (Object.prototype.hasOwnProperty.call(agreedMappings, key)
          && agreedMappings[key] !== target) {
          conflictingKeys.add(key);
        } else {
          agreedMappings[key] = target;
        }
      });
    });
    conflictingKeys.forEach(key => delete agreedMappings[key]);
    if (Object.keys(agreedMappings).length) {
      migrationType.sectionAliases = { ...migrationType.sectionAliases, ...agreedMappings };
      const ok = await writeTypeMarkerSilently(migrationType);
      if (ok) {
        await getCardTypes({ force: true });
        if (typeof state.onCardTypesChanged === 'function') state.onCardTypesChanged();
        aliasNote = ' Consistent mappings saved as section aliases.';
      } else {
        aliasNote = ' (mappings were NOT saved to the type definition)';
      }
    }
    if (conflictingKeys.size) aliasNote += ' Conflicting per-note mappings were not saved as aliases.';
  }

  const resultMessage = `Migrated ${done} note(s), ${failed} failed.${aliasNote}`;
  migrationPlan = [];
  renderMigrationList();
  migrationStatus(resultMessage, failed > 0);
}

function bindManagerEvents(bodyEl) {
  bodyEl.onclick = async (e) => {
    const target = e.target && e.target.closest ? e.target.closest('button') : null;
    if (!target) return;
    const action = target.getAttribute('data-action') || target.id;
    const typeId = target.getAttribute('data-type-id');
    const index = Number(target.getAttribute('data-sec-index'));

    if (action === 'type-edit') return openTypeEditor(typeId);
    if (action === 'color-picker-toggle') {
      const picker = document.getElementById(`lc-color-picker-${index}`);
      if (picker) {
        picker.hidden = !picker.hidden;
        target.setAttribute('aria-expanded', String(!picker.hidden));
      }
      return;
    }
    if (action === 'type-use') {
      setActiveType(typeId);
      await refreshSpaceIndicator(true);
      return renderManager();
    }
    if (action === 'type-up' || action === 'type-down') return reorderTypes(typeId, action === 'type-up' ? -1 : 1);
    if (action === 'declare-space') {
      const space = state.allSpaces.find(s => s.name === typeId);
      if (!space) return;
      const type = defaultType(space);
      type.id = `type-${String(space.name).replace(/^spaces\//, '')}`;
      type.order = state.types.length * 10 + 10;
      // Declaring a type starts with NO sections — it must not silently
      // inherit JA/EN/ZH. The user defines them in the panel below.
      type.sections = [];
      return writeTypeMarker(type, `Declared ${space.title || space.name} as a card type.`);
    }
    if (action === 'create-space') return createSpaceFromManager();
    if (action === 'section-toggle-hidden') {
      if (!draftType || !draftType.sections[index]) return;
      draftType.sections[index].defaultHidden = !draftType.sections[index].defaultHidden;
      return renderTypeList();
    }
    if (action === 'section-up' || action === 'section-down' || action === 'section-remove') {
      if (!draftType) return;
      const sections = draftType.sections;
      if (action === 'section-remove') sections.splice(index, 1);
      else {
        const swap = index + (action === 'section-up' ? -1 : 1);
        if (swap < 0 || swap >= sections.length) return;
        [sections[index], sections[swap]] = [sections[swap], sections[index]];
      }
      return renderTypeList();
    }
    if (action === 'add-section' || target.id === 'lc-add-section-btn') {
      if (!draftType) return;
      draftType.sections.push({ key: `section${draftType.sections.length + 1}`, label: 'New section', color: '#38bdf8', defaultHidden: false });
      return renderTypeList();
    }
    if (action === 'save-type' || target.id === 'lc-save-type-btn') {
      const type = collectDraft();
      if (type) return writeTypeMarker(type, `Saved ${type.name}.`);
    }
    if (action === 'copy-marker' || target.id === 'lc-copy-marker-btn') {
      const type = collectDraft() || draftType;
      if (type) return copyText(markerFromType(type), target);
    }
    if (action === 'open-migration' || target.id === 'lc-migration-open-btn') {
      const typeSelect = document.getElementById('lc-migration-type-select');
      return openMigrationWizard(typeSelect && typeSelect.value);
    }
  };

  bodyEl.oninput = (e) => {
    const brightnessIndex = e.target && e.target.getAttribute
      ? e.target.getAttribute('data-color-brightness')
      : null;
    if (brightnessIndex !== null) {
      const index = Number(brightnessIndex);
      const section = draftType && draftType.sections[index];
      if (!section) return;
      const hsv = colorHsvFor(section);
      updateSectionColor(index, hsv.h, hsv.s, Number(e.target.value) / 100);
      return;
    }
    const secField = e.target && e.target.getAttribute ? e.target.getAttribute('data-field') : null;
    if (!secField || !draftType) return;
    const index = Number(e.target.getAttribute('data-sec-index'));
    if (!draftType.sections[index]) return;
    if (secField === 'color') {
      const hsv = hexToHsv(e.target.value);
      if (/^#[0-9a-f]{6}$/i.test(e.target.value)) {
        updateSectionColor(index, hsv.h, hsv.s, hsv.v);
      }
      return;
    }
    draftType.sections[index][secField] = e.target.value || '';
    const preview = document.getElementById('lc-marker-preview');
    if (preview) preview.innerText = markerFromType(draftType);
  };
  bodyEl.onpointerdown = (event) => {
    const spectrum = event.target && event.target.closest
      ? event.target.closest('[data-color-spectrum]')
      : null;
    if (!spectrum) return;
    colorDrag = { spectrum, index: Number(spectrum.getAttribute('data-color-spectrum')) };
    updateColorFromPointer(event);
    document.addEventListener('pointermove', updateColorFromPointer);
    document.addEventListener('pointerup', stopColorDrag);
  };
  bodyEl.onkeydown = (event) => {
    const spectrum = event.target && event.target.closest
      ? event.target.closest('[data-color-spectrum]')
      : null;
    if (!spectrum || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const index = Number(spectrum.getAttribute('data-color-spectrum'));
    const section = draftType && draftType.sections[index];
    if (!section) return;
    const hsv = colorHsvFor(section);
    const hueDelta = event.key === 'ArrowLeft' ? -3 : event.key === 'ArrowRight' ? 3 : 0;
    const saturationDelta = event.key === 'ArrowUp' ? 0.03 : event.key === 'ArrowDown' ? -0.03 : 0;
    updateSectionColor(index, hsv.h + hueDelta, hsv.s + saturationDelta, hsv.v);
  };
}

async function createSpaceFromManager() {
  const titleInput = document.getElementById('lc-new-space-title');
  const title = titleInput ? titleInput.value.trim() : '';
  if (!title) {
    status('Enter a name for the new space.', true);
    if (titleInput) titleInput.focus();
    return;
  }

  const button = document.getElementById('lc-create-space-btn');
  if (button) {
    button.disabled = true;
    button.innerText = 'Creating…';
  }

  try {
    const source = draftType || state.activeType || state.types[0] || defaultType(null);
    const type = JSON.parse(JSON.stringify(source));
    type.id = `type-new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    type.name = title;
    type.spaceName = '';
    type.spaceTitle = title;
    type.order = state.types.reduce((max, item) => Math.max(max, item.order), -10) + 10;
    type.sectionAliases = {};

    const token = await getMemosAuthToken();
    const res = await createSpace(title, markerFromType(type), token);
    if (!res || !res.ok) {
      const code = res ? res.status : 'no response';
      let detail = '';
      if (res) {
        const body = await res.text().catch(() => '');
        try {
          const parsed = JSON.parse(body);
          detail = parsed.message || '';
        } catch (e) {
          detail = body.replace(/\s+/g, ' ').trim().slice(0, 160);
        }
      }
      throw new Error(`HTTP ${code}${detail ? ` — ${detail}` : ''}`);
    }

    const created = await res.json();
    if (!created || !created.name) {
      throw new Error('The server created the space but returned no resource name. Reload the page and check the space list.');
    }

    await getCardTypes({ force: true });
    const createdType = state.types.find(item => item.spaceName === created.name);
    if (!createdType) {
      throw new Error('The space was created, but its card type was not returned by the space list. Reload the page to refresh.');
    }
    setActiveType(createdType.id);
    if (typeof state.onQuickTypeSelected === 'function') {
      state.onQuickTypeSelected(createdType);
    }
    await refreshSpaceIndicator(true);
    await renderManager();
    status(`Created "${title}" with the current language sections. It will be used for new cards; your open draft is unchanged.`);
  } catch (err) {
    status(`Could not create space: ${err.message}`, true);
    const currentButton = document.getElementById('lc-create-space-btn');
    if (currentButton) {
      currentButton.disabled = false;
      currentButton.innerText = 'Create & use for new cards';
    }
  }
}

async function reorderTypes(typeId, delta) {
  const types = [...state.types];
  const index = types.findIndex(t => t.id === typeId);
  const swap = index + delta;
  if (index < 0 || swap < 0 || swap >= types.length) return;
  [types[index], types[swap]] = [types[swap], types[index]];
  types.forEach((type, i) => { type.order = i * 10; });
  state.types = types;
  for (const type of types) {
    const ok = await writeTypeMarkerSilently(type);
    if (!ok) return;
  }
  await renderManager();
  status('Type order updated.');
}

async function writeTypeMarkerSilently(type) {
  const marker = markerFromType(type);
  const token = await getMemosAuthToken();
  const res = await updateSpaceDescription(
    type.spaceName, replaceMarker(spaceDescriptionFor(type.spaceName), marker), token
  );
  if (!res || !res.ok) {
    status(`Could not reorder (HTTP ${res ? res.status : 'no response'}). Admin rights are required.`, true);
    return false;
  }
  return true;
}

async function renderManager() {
  const bodyEl = document.getElementById('lc-space-info-body');
  if (!bodyEl) return;
  bodyEl.innerHTML = '<p class="lc-manager-hint">Loading spaces…</p>';
  try {
    const [types, spaces] = await Promise.all([getCardTypes({ force: true }), getAllSpaces(true)]);
    const marked = new Set(types.map(t => t.spaceName));
    const unmarked = spaces.filter(s => !marked.has(s.name));
    const currentPageType = types.find(type => type.spaceName === getCurrentSpace()) || null;
    currentPageTypeId = currentPageType && currentPageType.id;
    // "In use" remains the selected target for new cards; the current page is a separate context.
    const inUseType = state.activeType || types[0];
    const migrationDefaultType = types.find(type => type.spaceName === getCurrentSpace()) || inUseType;
    bodyEl.innerHTML = `
      <div class="lc-manager">
        <p class="lc-manager-hint">Each marked space defines one card type. Click a card to edit its definition inline &mdash; the open card is the one being edited. Definitions live only in the space description, never in notes.</p>
        <div class="lc-manager-section">
          <h4>Create a Language Card space</h4>
          <p class="lc-manager-hint">Create a new Memos space from here. It will start with the current card type's language sections and become the target for new cards.</p>
          <div class="lc-manager-create-space">
            <input id="lc-new-space-title" class="lc-form-input" type="text" maxlength="100" placeholder="Space name" aria-label="New space name" />
            <button type="button" class="lc-btn lc-btn-primary" id="lc-create-space-btn" data-action="create-space">Create &amp; use for new cards</button>
          </div>
        </div>
        <div class="lc-manager-section">
          <h4>Card types (${types.length})</h4>
          <ul class="lc-type-list" id="lc-type-list"></ul>
        </div>
        <div class="lc-manager-section">
          <h4>Spaces without a marker (${unmarked.length})</h4>
          <ul class="lc-space-info-list">
            ${unmarked.map(s => `<li><b>${escapeHtml(s.title || s.name)}</b><span class="lc-space-info-uid">${escapeHtml(s.name)}</span><button type="button" class="lc-btn lc-btn-secondary" data-action="declare-space" data-type-id="${escapeHtml(s.name)}">Declare as card type</button></li>`).join('') || '<li>None</li>'}
          </ul>
        </div>
        <div class="lc-manager-section">
          <h4>Incompatible notes</h4>
          <p class="lc-manager-hint">Choose a card type to scan only its Space. Mappings are chosen per note and key; preview the rendered card and JSON before migrating.</p>
          <label class="lc-form-label" for="lc-migration-type-select">Space to scan</label>
          <select class="lc-form-input" id="lc-migration-type-select">
            ${types.map(type => `<option value="${escapeHtml(type.id)}" ${migrationDefaultType && migrationDefaultType.id === type.id ? 'selected' : ''}>${escapeHtml(type.name)} · ${escapeHtml(type.spaceName || '')}</option>`).join('')}
          </select>
          <button type="button" class="lc-btn lc-btn-secondary" id="lc-migration-open-btn" data-action="open-migration">Open migration wizard…</button>
        </div>
        <div id="lc-manager-status" class="lc-manager-status"></div>
      </div>`;
    bindManagerEvents(bodyEl);
    if (selectCurrentSpaceOnNextRender) {
      draftType = JSON.parse(JSON.stringify(currentPageType || inUseType || null));
      selectCurrentSpaceOnNextRender = false;
    } else if (!draftType || !types.some(t => t.id === draftType.id)) {
      draftType = inUseType ? JSON.parse(JSON.stringify(inUseType)) : null;
    }
    renderTypeList();
  } catch (err) {
    bodyEl.innerHTML = `<p class="lc-manager-error">Could not load spaces: ${escapeHtml(err.message)}. Reload the page and try again.</p>`;
  }
}

async function showTypeManager() {
  const overlay = document.getElementById('lc-space-info-overlay');
  const titleEl = document.getElementById('lc-space-info-title');
  if (!overlay) return;
  if (titleEl) titleEl.innerText = '🃏 Card types & spaces';
  selectCurrentSpaceOnNextRender = true;
  overlay.style.display = 'flex';
  status('');
  await renderManager();
}

async function showCreateSpaceManager() {
  await showTypeManager();
  const input = document.getElementById('lc-new-space-title');
  if (input) {
    input.scrollIntoView({ block: 'center' });
    input.focus();
  }
}

function openIncompatibleMemoMigration(type, memoName) {
  if (!type || !memoName) {
    status('Could not determine the card type or memo to migrate.', true);
    return;
  }
  return openMigrationWizard(type.id, memoName);
}

export {
  showTypeManager, showCreateSpaceManager, renderManager, migratedContent,
  openIncompatibleMemoMigration
};
