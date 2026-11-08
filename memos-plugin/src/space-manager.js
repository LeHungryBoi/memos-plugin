import { state } from './state.js';
import { getCardTypes, getAllSpaces, setActiveType, refreshSpaceIndicator } from './spaces.js';
import {
  getMemosAuthToken, updateSpaceDescription, listMemosForSpace, patchMemoContent
} from './api.js';
import {
  V3_VERSION, defaultType, markerFromType, sectionKeys, mapSectionKeys, typeForSpace
} from './card-types.js';
import { parseCardV3, parseCardMemo } from './card-model.js';
import { escapeHtml, copyText, getCurrentSpace } from './utils.js';

/**
 * R4: the green space indicator opens this panel. It lists every card type,
 * edits its section definitions (add / remove / reorder), reorders types,
 * declares unmarked spaces and assists migration of incompatible notes.
 *
 * Panels reuse #lc-space-info-overlay / #lc-space-info-body from editor.js.
 */

let draftType = null;
let migrationPlan = [];
let migrationType = null;

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

function sectionRowHtml(section, index) {
  return `
    <div class="lc-section-row" data-sec-row="${index}">
      <input class="lc-form-input" data-field="key" data-sec-index="${index}" value="${escapeHtml(section.key)}" placeholder="key" title="the key stored in the note" />
      <input class="lc-form-input" data-field="label" data-sec-index="${index}" value="${escapeHtml(section.label)}" placeholder="label" title="display label (the chip code is derived from this)" />
      <input class="lc-form-input" data-field="color" data-sec-index="${index}" value="${escapeHtml(section.color)}" placeholder="#38bdf8" title="colour" />
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
  const inUse = type.id === inUseId;
  const open = Boolean(draftType && draftType.id === type.id);
  const aliasCount = Object.keys(type.sectionAliases || {}).length;
  return `
    <li class="lc-type-card${inUse ? ' lc-type-in-use' : ''}${open ? ' lc-type-open' : ''}">
      <div class="lc-type-card-head">
        <button type="button" class="lc-type-card-title" data-action="type-edit" data-type-id="${escapeHtml(type.id)}" title="Click to edit this type">
          <b>${escapeHtml(type.name)}</b>
          ${inUse ? '<span class="lc-type-badge-use">In use</span>' : ''}
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
          ${inUse ? '' : `<button type="button" class="lc-btn lc-btn-secondary" data-action="type-use" data-type-id="${escapeHtml(type.id)}">Use for new cards</button>`}
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
      <label class="lc-form-label">Order <input id="lc-type-order" class="lc-form-input" type="number" value="${type.order}" /></label>
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
  const inUseType = typeForSpace(types, getCurrentSpace()) || state.activeType || types[0];
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
  const order = document.getElementById('lc-type-order');
  if (!draftType) return null;
  if (name && name.value) draftType.name = name.value;
  if (order && order.value !== '') draftType.order = Number(order.value) || 0;
  // sectionAliases are produced by the migration wizard only — keep them as-is.
  draftType.sections = draftType.sections.filter(s => s && s.key);
  if (!draftType.sections.length) {
    status('A card type needs at least one section.', true);
    return null;
  }
  const preview = document.getElementById('lc-marker-preview');
  if (preview) preview.innerText = markerFromType(draftType);
  return draftType;
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

function collectMigrationMapping() {
  const mapping = {};
  migrationPlan.forEach(note => note.rows.forEach(row => {
    if (row.target && row.target !== '__keep') mapping[row.key] = row.target;
  }));
  return mapping;
}

function renderMigrationList() {
  const body = document.getElementById('lc-migration-body');
  if (!body) return;
  const type = migrationType;
  if (!migrationPlan.length) {
    body.innerHTML = '<p class="lc-manager-hint">No incompatible notes found in this space.</p>';
    return;
  }
  body.innerHTML = `
    <p class="lc-manager-hint">Every note below carries keys that don't match a section of <b>${escapeHtml(type ? type.name : '')}</b>. Choose, per key, which section it should become &mdash; you can see the actual value next to it. "keep as-is" leaves the key untouched. Nothing is written until you press Migrate.</p>
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
    <pre id="lc-migration-preview" class="lc-preview-box"></pre>
    <div id="lc-migration-status" class="lc-manager-status"></div>`;
}

function showMigrationPreview() {
  const mapping = collectMigrationMapping();
  const host = document.getElementById('lc-migration-preview');
  if (!host) return;
  host.innerText = migrationPlan.map(note => {
    const before = note.raw.slice(0, 140);
    const after = migratedContent(note.raw, mapping) || '(unparseable)';
    return `${note.memoName}\n  before: ${before}\n  after:  ${after.slice(0, 140)}`;
  }).join('\n\n') || 'Nothing to preview.';
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

async function openMigrationWizard() {
  const type = state.activeType || state.types[0];
  if (!type || !type.spaceName) {
    status('Pick a card type bound to a space first.', true);
    return;
  }
  migrationType = type;
  const overlay = migrationOverlay();
  overlay.style.display = 'flex';
  const title = document.getElementById('lc-migration-title');
  if (title) title.innerText = `Migrate notes — ${type.name} (${type.spaceName})`;
  const body = document.getElementById('lc-migration-body');
  if (body) body.innerHTML = '<p class="lc-manager-hint">Scanning notes in this space…</p>';
  try {
    const token = await getMemosAuthToken();
    const memos = await listMemosForSpace(type.spaceName, token);
    const keys = sectionKeys(type);
    migrationPlan = memos.map(memo => {
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
  const mapping = collectMigrationMapping();
  if (!migrationPlan.length) return;
  const token = await getMemosAuthToken();
  let done = 0;
  let failed = 0;
  for (const note of migrationPlan) {
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
  if (saveBox && saveBox.checked && migrationType && Object.keys(mapping).length && done > 0) {
    migrationType.sectionAliases = { ...migrationType.sectionAliases, ...mapping };
    const ok = await writeTypeMarkerSilently(migrationType);
    if (ok) {
      await getCardTypes({ force: true });
      aliasNote = ' Mappings saved as section aliases.';
    } else {
      aliasNote = ' (mappings were NOT saved to the type definition)';
    }
  }

  migrationStatus(`Migrated ${done} note(s), ${failed} failed.${aliasNote}`, failed > 0);
  migrationPlan = [];
  renderMigrationList();
}

function bindManagerEvents(bodyEl) {
  bodyEl.onclick = async (e) => {
    const target = e.target && e.target.closest ? e.target.closest('button') : null;
    if (!target) return;
    const action = target.getAttribute('data-action') || target.id;
    const typeId = target.getAttribute('data-type-id');
    const index = Number(target.getAttribute('data-sec-index'));

    if (action === 'type-edit') return openTypeEditor(typeId);
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
    if (action === 'open-migration' || target.id === 'lc-migration-open-btn') return openMigrationWizard();
  };

  bodyEl.addEventListener('input', (e) => {
    const secField = e.target && e.target.getAttribute ? e.target.getAttribute('data-field') : null;
    if (!secField || !draftType) return;
    const index = Number(e.target.getAttribute('data-sec-index'));
    if (draftType.sections[index]) draftType.sections[index][secField] = e.target.value || '';
    const preview = document.getElementById('lc-marker-preview');
    if (preview) preview.innerText = markerFromType(draftType);
  });
}

async function reorderTypes(typeId, delta) {
  const types = [...state.types];
  const index = types.findIndex(t => t.id === typeId);
  const swap = index + delta;
  if (index < 0 || swap < 0 || swap >= types.length) return;
  [types[index], types[swap]] = [types[swap], types[index]];
  const changed = [types[index], types[swap]];
  types.forEach((type, i) => { type.order = i * 10; });
  state.types = types;
  for (const type of changed) {
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
    // "In use" = the type of the space the editor is on.
    const inUseType = typeForSpace(types, getCurrentSpace()) || state.activeType || types[0];
    bodyEl.innerHTML = `
      <div class="lc-manager">
        <p class="lc-manager-hint">Each marked space defines one card type. Click a card to edit its definition inline &mdash; the open card is the one being edited. Definitions live only in the space description, never in notes.</p>
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
          <p class="lc-manager-hint">Notes whose keys don't match this type can be migrated in a dedicated window: the scanner lists each note with its real key values, and you choose per key which section it should become.</p>
          <button type="button" class="lc-btn lc-btn-secondary" id="lc-migration-open-btn" data-action="open-migration">Open migration wizard…</button>
        </div>
        <div id="lc-manager-status" class="lc-manager-status"></div>
      </div>`;
    bindManagerEvents(bodyEl);
    if (!draftType || !types.some(t => t.id === draftType.id)) {
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
  overlay.style.display = 'flex';
  status('');
  await renderManager();
}

export { showTypeManager, renderManager, migratedContent };
