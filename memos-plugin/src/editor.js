import { CONFIG } from './config.js';
import { state } from './state.js';
import { getCurrentSpace, syncThemeClass, escapeHtml } from './utils.js';
import { isLegacyFallbackStatus, getMemosAuthToken } from './api.js';
import {
  clearTargetSpaceCache, resolveTargetSpace, refreshSpaceIndicator,
  hideSpaceInfoPopup, updateSpaceHint, refreshQuickSpaceSelector,
  swipeQuickSpaceSelector
} from './spaces.js';
import { showTypeManager, showCreateSpaceManager } from './space-manager.js';
import {
  tagStore, checkTagAutocomplete, handleTagAutocompleteKeydown, hideTagAutocomplete
} from './tags.js';
import { refreshCardLocally } from './card-render.js';
import { buildCardContentV3, normalizeTags } from './card-model.js';
import { defaultType, activeTypeForNew } from './card-types.js';

let pageScrollLock = null;
let spaceSwipeAnimationTimer = null;

function animateSpaceSwipe(direction) {
  const header = document.getElementById('lc-modal-header');
  if (!header) return;
  header.classList.remove('lc-space-swipe-next', 'lc-space-swipe-previous');
  void header.offsetWidth;
  header.classList.add(direction > 0 ? 'lc-space-swipe-next' : 'lc-space-swipe-previous');
  clearTimeout(spaceSwipeAnimationTimer);
  spaceSwipeAnimationTimer = setTimeout(() => {
    header.classList.remove('lc-space-swipe-next', 'lc-space-swipe-previous');
    spaceSwipeAnimationTimer = null;
  }, 260);
}

function lockPageScroll() {
  if (pageScrollLock) return;
  const root = document.documentElement;
  const body = document.body;
  const lock = {
    rootOverflow: root.style.overflow,
    bodyOverflow: body.style.overflow,
    bodyPosition: body.style.position,
    bodyTop: body.style.top,
    bodyWidth: body.style.width,
    scrollY: window.scrollY || window.pageYOffset || 0
  };
  pageScrollLock = lock;
  root.style.overflow = 'hidden';
  body.style.overflow = 'hidden';
  body.style.position = 'fixed';
  body.style.top = `-${lock.scrollY}px`;
  body.style.width = '100%';

  const preventBackgroundScroll = (event) => {
    const target = event.target;
    const inDialog = target && target.closest && target.closest('.lc-modal-dialog');
    if (inDialog) return;
    event.preventDefault();
  };
  document.addEventListener('touchmove', preventBackgroundScroll, { capture: true, passive: false });
  document.addEventListener('wheel', preventBackgroundScroll, { capture: true, passive: false });
  lock.preventBackgroundScroll = preventBackgroundScroll;
}

function unlockPageScroll() {
  if (!pageScrollLock) return;
  const lock = pageScrollLock;
  pageScrollLock = null;
  document.removeEventListener('touchmove', lock.preventBackgroundScroll, true);
  document.removeEventListener('wheel', lock.preventBackgroundScroll, true);
  document.documentElement.style.overflow = lock.rootOverflow;
  document.body.style.overflow = lock.bodyOverflow;
  document.body.style.position = lock.bodyPosition;
  document.body.style.top = lock.bodyTop;
  document.body.style.width = lock.bodyWidth;
  if (typeof window.scrollTo === 'function') window.scrollTo(0, lock.scrollY);
}

  /** Sections of the card currently being edited (V2 falls back to CONFIG). */
  function currentSections() {
    return (state.editingType && state.editingType.sections) || CONFIG.languages;
  }

  function toggleModalLocalLang(key) {
    if (state.modalActiveLangs.includes(key)) {
      if (state.modalActiveLangs.length <= 1) return; // At least one
      state.modalActiveLangs = state.modalActiveLangs.filter(k => k !== key);
    } else {
      const next = [...state.modalActiveLangs, key];
      state.modalActiveLangs = currentSections().map(s => s.key).filter(k => next.includes(k));
    }
    // Update only the modal editor UI without affecting global state or outside cards
    updateModalEditorSlots();
  }

  /** Update modal editor slots (STRICTLY LOCAL TO THIS MODAL SESSION) */
  function updateModalEditorSlots() {
    const sections = currentSections();
    const activeCount = sections.filter(s => state.modalActiveLangs.includes(s.key)).length;
    const editorGrid = document.getElementById('lc-editor-grid');
    if (editorGrid) {
      editorGrid.style.setProperty('--lc-editor-cols', Math.max(1, activeCount));
    }
    const explanationGrid = document.getElementById('lc-explanation-inputs');
    if (explanationGrid) {
      explanationGrid.style.setProperty('--lc-explanation-cols', Math.max(1, activeCount));
    }

    sections.forEach(s => {
      const slotEl = document.getElementById(`lc-editor-col-${s.key}`);
      const pillBtn = document.getElementById(`lc-modal-toggle-${s.key}`);
      const explanationSlot = document.getElementById(`lc-explanation-slot-${s.key}`);
      const isAct = state.modalActiveLangs.includes(s.key);
      if (slotEl) {
        // If toggled off in this modal, takes NO space on the x-axis!
        slotEl.style.display = isAct ? 'flex' : 'none';
      }
      if (pillBtn) {
        pillBtn.classList.toggle('active', isAct);
        pillBtn.style.borderColor = isAct ? s.color : 'transparent';
        pillBtn.style.color = isAct ? s.color : 'var(--lc-text-muted)';
      }
      if (explanationSlot) explanationSlot.style.display = isAct ? 'flex' : 'none';
    });

    updatePreview();
  }

  /**
   * Per-section explanations follow their language columns; the unified
   * explanation is a separate full-width row beneath them.
   */
  function renderExplanationArea(type, explanations, unifiedExplanation, enabled) {
    const host = document.getElementById('lc-explanation-area');
    if (!host) return;
    if (state.editingVersion !== 3) {
      host.innerHTML = '';
      return;
    }
    const sectionInputs = currentSections().map(s => `
      <div id="lc-explanation-slot-${escapeHtml(s.key)}" class="lc-explanation-slot" data-lc-explanation-slot="${escapeHtml(s.key)}">
        <label class="lc-form-label">${escapeHtml(s.label)}</label>
        <textarea id="lc-explain-${escapeHtml(s.key)}" class="lc-explanation-input" rows="2" placeholder="Explanation for ${escapeHtml(s.label)}">${escapeHtml((explanations && explanations[s.key]) || '')}</textarea>
      </div>`).join('');
    host.innerHTML = `
      <div class="lc-explanation-panel">
        <div class="lc-explanation-toggle-row">
          <button type="button" id="lc-explanation-toggle" class="lc-modal-lang-chip ${enabled ? 'active' : ''}" title="Show / hide explanation for this card">Explanation</button>
          <span class="lc-modal-lang-label">per-language + unified</span>
        </div>
        <div id="lc-explanation-inputs" class="lc-explanation-inputs" style="display:${enabled ? 'grid' : 'none'}; --lc-explanation-cols:${Math.max(1, currentSections().length)}">
          ${sectionInputs}
        </div>
        <div class="lc-unified-explanation-slot" style="display:${enabled ? 'flex' : 'none'}">
          <label class="lc-form-label">Unified explanation</label>
          <textarea id="lc-explain-unified" class="lc-explanation-input" rows="2" placeholder="Explanation for the whole card">${escapeHtml(unifiedExplanation || '')}</textarea>
        </div>
      </div>`;
    const toggle = document.getElementById('lc-explanation-toggle');
    if (toggle) toggle.onclick = toggleExplanation;
  }

  function toggleExplanation() {
    state.explanationEnabled = !state.explanationEnabled;
    const btn = document.getElementById('lc-explanation-toggle');
    if (btn) btn.classList.toggle('active', state.explanationEnabled);
    const inputs = document.getElementById('lc-explanation-inputs');
    if (inputs) inputs.style.display = state.explanationEnabled ? 'grid' : 'none';
    const unifiedSlot = document.querySelector('.lc-unified-explanation-slot');
    if (unifiedSlot) unifiedSlot.style.display = state.explanationEnabled ? 'flex' : 'none';
    updatePreview();
  }

  /** Build the section chips + inputs from the active card type. */
  function renderEditorForType(type, values, explanations, unifiedExplanation, enabled) {
    const chips = document.getElementById('lc-modal-lang-bar');
    if (chips) {
      chips.innerHTML = `<span class="lc-modal-lang-label">This note:</span>` + type.sections.map(s => `
        <button type="button" id="lc-modal-toggle-${escapeHtml(s.key)}" class="lc-modal-lang-chip active" style="border-color:${s.color}; color:${s.color}">
          ${escapeHtml(s.code)}
        </button>`).join('');
      type.sections.forEach(s => {
        const btn = document.getElementById(`lc-modal-toggle-${s.key}`);
        if (btn) {
          btn.onclick = (e) => {
            e.stopPropagation();
            toggleModalLocalLang(s.key);
          };
        }
      });
    }

    const grid = document.getElementById('lc-editor-grid');
    if (grid) {
      grid.innerHTML = type.sections.map(s => `
        <div class="lc-editor-slot" id="lc-editor-col-${escapeHtml(s.key)}">
          <div class="lc-slot-header">
            <span class="lc-slot-badge" style="color: ${s.color};">${escapeHtml(s.label)} (${escapeHtml(s.key)})</span>
            <span class="lc-slot-hint">${escapeHtml(s.code)}</span>
          </div>
          <textarea id="lc-input-${escapeHtml(s.key)}" class="lc-slot-textarea" placeholder="${escapeHtml(s.placeholder || '')}" rows="3"></textarea>
        </div>`).join('');
      type.sections.forEach(s => {
        const el = document.getElementById(`lc-input-${s.key}`);
        if (el) el.value = String((values && values[s.key]) || '');
      });
    }

    renderExplanationArea(type, explanations, unifiedExplanation, enabled);
    bindEditorInputs(type.sections.map(s => s.key));
  }

  function applyQuickSelectedType(type) {
    const overlay = document.getElementById('lc-modal-overlay');
    if (!overlay || overlay.style.display === 'none' || state.editingMemoName) return;

    const previousSections = currentSections();
    const values = {};
    const explanations = {};
    previousSections.forEach(section => {
      values[section.key] = document.getElementById(`lc-input-${section.key}`)?.value || '';
      explanations[section.key] = document.getElementById(`lc-explain-${section.key}`)?.value || '';
    });
    const unifiedExplanation = document.getElementById('lc-explain-unified')?.value || '';
    const previousActive = new Set(state.modalActiveLangs);

    state.editingType = type;
    state.activeType = type;
    const keys = type.sections.map(section => section.key);
    state.modalActiveLangs = keys.filter(key => previousActive.has(key));
    if (!state.modalActiveLangs.length) {
      state.modalActiveLangs = keys.filter(key => !type.sections.some(section => (
        section.key === key && section.defaultHidden
      )));
    }
    if (!state.modalActiveLangs.length && keys.length) state.modalActiveLangs = [...keys];

    renderEditorForType(type, values, explanations, unifiedExplanation, state.explanationEnabled);
    updateModalEditorSlots();
    updateSpaceHint(type.spaceName, type.spaceTitle);
    const title = document.getElementById('lc-modal-title-text');
    if (title) title.innerText = `New · ${type.name}`;
    refreshQuickSpaceSelector();
  }

  /** Live preview, tag autocomplete & keyboard events for dynamic inputs. */
  function bindEditorInputs(keys) {
    const ids = [
      ...keys.map(k => `lc-input-${k}`),
      ...keys.map(k => `lc-explain-${k}`),
      'lc-explain-unified'
    ];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', () => {
        updatePreview();
        checkTagAutocomplete(el);
      });
      el.addEventListener('click', () => {
        checkTagAutocomplete(el);
      });
      el.addEventListener('keyup', (e) => {
        if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
          checkTagAutocomplete(el);
        }
      });
      el.addEventListener('blur', () => {
        setTimeout(() => {
          const dropdown = document.getElementById('lc-tag-dropdown');
          if (dropdown && !dropdown.contains(document.activeElement)) {
            hideTagAutocomplete();
          }
        }, 180);
      });
      el.addEventListener('keydown', (e) => {
        if (handleTagAutocompleteKeydown(e, el)) return;
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
          e.preventDefault();
          saveCard();
        }
        if (e.key === 'Escape') closeModal();
      });
    });
  }

  function bindTagsInput() {
    const el = document.getElementById('lc-input-tags');
    if (!el) return;
    el.addEventListener('input', () => {
      updatePreview();
      checkTagAutocomplete(el);
    });
    el.addEventListener('click', () => checkTagAutocomplete(el));
    el.addEventListener('keyup', (e) => {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) checkTagAutocomplete(el);
    });
    el.addEventListener('blur', () => {
      setTimeout(() => {
        const dropdown = document.getElementById('lc-tag-dropdown');
        if (dropdown && !dropdown.contains(document.activeElement)) hideTagAutocomplete();
      }, 180);
    });
    el.addEventListener('keydown', (e) => {
      if (handleTagAutocompleteKeydown(e, el)) return;
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        saveCard();
      }
      if (e.key === 'Escape') closeModal();
    });
  }

  function injectCreatorUI() {
    if (document.getElementById('lc-floating-bar')) return;

    if (CONFIG.dedicatedSpaceKeyword) {
      if (!window.location.pathname.includes(CONFIG.dedicatedSpaceKeyword)) return;
    }

    // 1. Floating container: the global language pills were removed in V3 (R5.1).
    const bar = document.createElement('div');
    bar.id = 'lc-floating-bar';
    bar.className = 'lc-floating-bar';
    bar.innerHTML = `
      <button id="lc-fab-btn" class="lc-fab">
        <span>🔤</span><span>New Card</span>
      </button>
    `;
    document.body.appendChild(bar);
    document.getElementById('lc-fab-btn').onclick = async () => {
      await refreshSpaceIndicator(true);
      openModal();
    };

    // 2. Modal overlay: sections and explanation are rendered from the type.
    const overlay = document.createElement('div');
    overlay.id = 'lc-modal-overlay';
    overlay.className = 'lc-modal-overlay';
    overlay.style.display = 'none';
    overlay.onclick = (e) => {
      if (e.target === overlay) closeModal();
    };
    let swipeStart = null;
    let horizontalSwipe = false;
    overlay.addEventListener('touchstart', (e) => {
      if (state.editingMemoName || document.getElementById('lc-space-info-overlay')?.style.display === 'flex') return;
      const target = e.target;
      if (!target || !target.closest || !target.closest('.lc-modal-header')) return;
      const touch = e.touches && e.touches[0];
      swipeStart = touch ? { x: touch.clientX, y: touch.clientY } : null;
      horizontalSwipe = false;
    }, { passive: true });
    overlay.addEventListener('touchmove', (e) => {
      if (!swipeStart) return;
      const touch = e.touches && e.touches[0];
      if (!touch) return;
      const dx = touch.clientX - swipeStart.x;
      const dy = touch.clientY - swipeStart.y;
      if (Math.abs(dx) >= 10 && Math.abs(dx) > Math.abs(dy)) {
        horizontalSwipe = true;
        e.preventDefault();
        e.stopPropagation();
      }
    }, { passive: false });
    overlay.addEventListener('touchend', (e) => {
      if (!swipeStart) return;
      const touch = e.changedTouches && e.changedTouches[0];
      const dx = touch ? touch.clientX - swipeStart.x : 0;
      const dy = touch ? touch.clientY - swipeStart.y : 0;
      swipeStart = null;
      if (horizontalSwipe && Math.abs(dx) >= 35 && Math.abs(dx) > Math.abs(dy)) {
        const direction = dx < 0 ? 1 : -1;
        if (swipeQuickSpaceSelector(direction)) animateSpaceSwipe(direction);
      }
      horizontalSwipe = false;
    }, { passive: true });
    overlay.addEventListener('touchcancel', () => {
      swipeStart = null;
      horizontalSwipe = false;
    }, { passive: true });

    overlay.innerHTML = `
      <div class="lc-modal-dialog">
        <div class="lc-modal-header" id="lc-modal-header">
          <div class="lc-modal-title-row">
            <h3 class="lc-modal-title">
              <span>🔤</span>
              <span id="lc-modal-title-text">New Language Card</span>
            </h3>
            <div class="lc-space-controls">
              <button type="button" id="lc-space-indicator" class="lc-space-indicator lc-si-loading" title="Manage card types and spaces">
              <span id="lc-space-indicator-text">⏳ Checking card types…</span>
              </button>
              <div class="lc-space-select">
                <button type="button" id="lc-space-select-btn" class="lc-space-select-btn" aria-expanded="false" aria-controls="lc-space-select-panel">
                  <span id="lc-space-select-text">Loading spaces…</span><span aria-hidden="true">⌄</span>
                </button>
                <div id="lc-space-select-panel" class="lc-space-select-panel" hidden>
                  <div id="lc-space-select-options" class="lc-space-select-options"></div>
                  <button type="button" id="lc-add-space-btn" class="lc-space-select-add">＋ Add new space</button>
                </div>
              </div>
            </div>
          </div>

          <div class="lc-modal-header-actions">
            <div class="lc-modal-lang-bar" id="lc-modal-lang-bar" title="Sections for this card only"></div>
            <button class="lc-modal-close" id="lc-modal-close-btn" title="Close (Esc)">&times;</button>
          </div>
        </div>

        <div class="lc-modal-body">
          <div id="lc-modal-error" style="display:none; color:#ef4444; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); border-radius:8px; padding:8px 12px; font-size:13px;"></div>

          <div class="lc-editor-grid" id="lc-editor-grid"></div>
          <div id="lc-explanation-area"></div>

          <div class="lc-form-group" style="margin-top: 4px;">
            <label class="lc-form-label">Tags (separated by space or comma)</label>
            <input type="text" id="lc-input-tags" class="lc-form-input" placeholder="e.g. #vocab #daily #reading" autocomplete="off" />
          </div>

          <div class="lc-form-group">
            <label class="lc-form-label" style="display:flex; justify-content:space-between;">
              <span>Memos Payload Preview</span>
              <span id="lc-space-hint" style="font-weight: normal; font-size: 11px; opacity: 0.8;"></span>
            </label>
            <div id="lc-json-preview" class="lc-preview-box">{"_t":"lc","v":3}</div>
          </div>

        </div>

        <div class="lc-modal-footer">
          <div style="font-size: 12px; color: var(--lc-text-muted);">
            Shortcut: <kbd style="background:rgba(128,128,128,0.2); padding:2px 6px; border-radius:4px;">Ctrl</kbd> + <kbd style="background:rgba(128,128,128,0.2); padding:2px 6px; border-radius:4px;">Enter</kbd>
          </div>
          <div style="display:flex; gap:10px;">
            <button class="lc-btn lc-btn-secondary" id="lc-btn-cancel">Cancel</button>
            <button class="lc-btn lc-btn-primary" id="lc-btn-save">Save Card</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // 3. Shared overlay used by the card type / space manager (R4).
    const infoOverlay = document.createElement('div');
    infoOverlay.id = 'lc-space-info-overlay';
    infoOverlay.className = 'lc-modal-overlay lc-space-info-overlay';
    infoOverlay.style.display = 'none';
    infoOverlay.onclick = (e) => {
      if (e.target === infoOverlay) hideSpaceInfoPopup();
    };
    infoOverlay.innerHTML = `
      <div class="lc-modal-dialog lc-space-info-dialog">
        <div class="lc-modal-header">
          <div class="lc-modal-title-row">
            <h3 class="lc-modal-title"><span id="lc-space-info-title">Card types & spaces</span></h3>
          </div>
          <div class="lc-modal-header-actions">
            <button class="lc-modal-close" id="lc-space-info-close-btn" title="Close (Esc)">&times;</button>
          </div>
        </div>
        <div class="lc-modal-body" id="lc-space-info-body"></div>
        <div class="lc-modal-footer">
          <div style="font-size: 12px; color: var(--lc-text-muted);">Definitions live only in space descriptions.</div>
          <div style="display:flex; gap:10px;">
            <button class="lc-btn lc-btn-primary" id="lc-space-info-ok-btn">Done</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(infoOverlay);

    document.getElementById('lc-space-info-close-btn').onclick = hideSpaceInfoPopup;
    document.getElementById('lc-space-info-ok-btn').onclick = hideSpaceInfoPopup;

    const spaceIndicator = document.getElementById('lc-space-indicator');
    if (spaceIndicator) {
      spaceIndicator.onclick = async (e) => {
        e.stopPropagation();
        await refreshSpaceIndicator(true);
        showTypeManager();
      };
    }
    state.onQuickTypeSelected = applyQuickSelectedType;
    const spaceSelectButton = document.getElementById('lc-space-select-btn');
    const spaceSelectPanel = document.getElementById('lc-space-select-panel');
    const spaceSelect = document.getElementById('lc-space-select');
    if (spaceSelectButton && spaceSelectPanel) {
      spaceSelectButton.onclick = async (e) => {
        e.stopPropagation();
        await refreshSpaceIndicator(true);
        spaceSelectPanel.hidden = !spaceSelectPanel.hidden;
        spaceSelectButton.setAttribute('aria-expanded', String(!spaceSelectPanel.hidden));
      };
    }
    document.addEventListener('pointerdown', (e) => {
      if (!spaceSelectPanel || spaceSelectPanel.hidden) return;
      if (spaceSelect && e.target && spaceSelect.contains(e.target)) return;
      spaceSelectPanel.hidden = true;
      if (spaceSelectButton) spaceSelectButton.setAttribute('aria-expanded', 'false');
    }, true);
    const addSpaceButton = document.getElementById('lc-add-space-btn');
    if (addSpaceButton) {
      addSpaceButton.onclick = async (e) => {
        e.stopPropagation();
        if (spaceSelectPanel) spaceSelectPanel.hidden = true;
        if (spaceSelectButton) spaceSelectButton.setAttribute('aria-expanded', 'false');
        await showCreateSpaceManager();
      };
    }
    refreshSpaceIndicator();

    document.getElementById('lc-modal-close-btn').onclick = closeModal;
    document.getElementById('lc-btn-cancel').onclick = closeModal;
    document.getElementById('lc-btn-save').onclick = saveCard;
    bindTagsInput();
    refreshQuickSpaceSelector();
  }

  /**
   * Open the editor. V3 cards are rendered from the space's card type;
   * V2 cards keep the legacy three-section payload so old notes are untouched.
   */
  function openModal(editData, initialLangs) {
    syncThemeClass();
    const overlay = document.getElementById('lc-modal-overlay');
    if (!overlay) return;
    lockPageScroll();
    overlay.style.display = 'flex';
    clearError();
    refreshSpaceIndicator();

    state.editingMemoName = editData && editData.name ? editData.name : null;
    const isV3Edit = Boolean(editData && editData.version === 3);
    state.editingVersion = isV3Edit ? 3 : (state.editingMemoName ? 2 : 3);
    const type = state.editingVersion === 3
      ? ((isV3Edit && editData.type) || state.activeType || activeTypeForNew(state.types, getCurrentSpace()))
      : defaultType(null);
    state.editingType = type;
    if (state.editingVersion === 3) state.activeType = type;
    const quickSelect = document.getElementById('lc-space-select');
    if (quickSelect) quickSelect.style.display = state.editingMemoName ? 'none' : '';
    refreshQuickSpaceSelector();

    const titleText = document.getElementById('lc-modal-title-text');
    if (titleText) {
      titleText.innerText = state.editingMemoName
        ? `Edit · ${type.name}`
        : `New · ${type.name}`;
    }
    const saveBtn = document.getElementById('lc-btn-save');
    if (saveBtn) saveBtn.innerText = state.editingMemoName ? 'Update Card' : 'Save Card';

    const keys = type.sections.map(s => s.key);
    const values = {};
    if (isV3Edit) {
      keys.forEach(k => { values[k] = (editData.values && editData.values[k]) || ''; });
    } else {
      CONFIG.languages.forEach(l => { values[l.key] = (editData && editData[l.key]) || ''; });
    }
    const tagsEl = document.getElementById('lc-input-tags');
    if (tagsEl) tagsEl.value = (editData && editData.tags) || '';

    state.explanationEnabled = isV3Edit ? editData.showExplanation !== false : true;
    // New cards open with the sections the type shows by default; sections
    // flagged hidden-by-default (e.g. JA in the stock three-section type)
    // start closed. Editing a card shows what that card actually holds.
    state.modalActiveLangs = initialLangs && initialLangs.length
      ? keys.filter(k => initialLangs.includes(k))
      : keys.filter(k => !type.sections.some(s => s.key === k && s.defaultHidden));
    if (!state.modalActiveLangs.length) state.modalActiveLangs = [...keys];
    renderEditorForType(
      type,
      values,
      isV3Edit ? editData.explanations : {},
      isV3Edit ? editData.unifiedExplanation : '',
      state.explanationEnabled
    );
    updateModalEditorSlots();
    updateSpaceHint(type.spaceName, type.spaceTitle);

    hideTagAutocomplete();
    tagStore.scanPage();
    tagStore.fetchServer();

    const firstKey = state.modalActiveLangs.includes('en') ? 'en' : state.modalActiveLangs[0];
    const firstInput = document.getElementById(`lc-input-${firstKey}`);
    if (firstInput) setTimeout(() => firstInput.focus(), 60);
  }

  function closeModal() {
    hideTagAutocomplete();
    const overlay = document.getElementById('lc-modal-overlay');
    if (overlay) overlay.style.display = 'none';
    unlockPageScroll();
  }

  function buildCardPayload() {
    const rawTags = (document.getElementById('lc-input-tags')?.value || '').trim();
    const sections = currentSections();

    if (state.editingVersion === 3 && state.editingType) {
      const type = state.editingType;
      const values = {};
      sections.forEach(s => {
        values[s.key] = (document.getElementById(`lc-input-${s.key}`)?.value || '').trim();
      });
      const explanations = {};
      sections.forEach(s => {
        explanations[s.key] = (document.getElementById(`lc-explain-${s.key}`)?.value || '').trim();
      });
      const unifiedExplanation = (document.getElementById('lc-explain-unified')?.value || '').trim();
      const result = buildCardContentV3(
        type,
        values,
        explanations,
        state.explanationEnabled,
        rawTags,
        state.modalActiveLangs,
        unifiedExplanation
      );
      return { content: result.content, tags: result.tags, hasAny: result.hasAny, data: result.data };
    }

    // V2 payload (editing an old note keeps its original format).
    const data = { _t: CONFIG.typeIdentifier, v: CONFIG.cardVersion };
    let hasAny = false;
    CONFIG.languages.forEach((lang) => {
      const val = (document.getElementById(`lc-input-${lang.key}`)?.value || '').trim();
      if (val) {
        data[lang.key] = val;
        hasAny = true;
      }
    });
    const tags = normalizeTags(rawTags);
    const content = JSON.stringify(data) + (tags ? `\n${tags}` : '');
    return { data, tags, content, hasAny: hasAny };
  }

  function updatePreview() {
    const previewEl = document.getElementById('lc-json-preview');
    if (!previewEl) return;
    const { content } = buildCardPayload();
    previewEl.innerText = content;
  }

  function showError(msg) {
    const errBox = document.getElementById('lc-modal-error');
    if (errBox) {
      errBox.innerText = msg;
      errBox.style.display = 'block';
    }
  }

  function clearError() {
    const errBox = document.getElementById('lc-modal-error');
    if (errBox) {
      errBox.innerText = '';
      errBox.style.display = 'none';
    }
  }

  async function saveCard() {
    clearError();
    const { content, hasAny } = buildCardPayload();
    if (!hasAny) {
      showError('Please fill in at least one language slot!');
      return;
    }

    const saveBtn = document.getElementById('lc-btn-save');
    saveBtn.disabled = true;
    saveBtn.innerText = 'Saving...';

    const isEdit = Boolean(state.editingMemoName);
    const payload = {
      content: content,
      visibility: 'PRIVATE'
    };
    let url = '/api/memos';
    let method = 'POST';
    // Edit mode PATCHes the existing memo; the path takes the bare id, not "memos/xxx"
    const bareId = isEdit ? (state.editingMemoName || '').replace(/^memos\//, '').trim() : '';
    const usePatch = isEdit && bareId.length > 0;
    if (usePatch) {
      url = `/api/memos/${encodeURIComponent(bareId)}?updateMask=content`;
      method = 'PATCH';
    } else {
      // V3: the active card type's space wins; otherwise URL space / personal space.
      let dedicatedSpace = state.editingType && state.editingType.spaceName;
      try {
        const resolved = await resolveTargetSpace();
        dedicatedSpace = dedicatedSpace || resolved.space;
      } catch (e) {
        console.warn('[LanguageCard] target space resolution failed', e);
      }
      const targetSpace = dedicatedSpace || getCurrentSpace();
      if (targetSpace) payload.space = targetSpace;
    }

    try {
      let token = await getMemosAuthToken();

      const sendRequest = async (authToken, requestUrl) => {
        const headers = {
          'Content-Type': 'application/json'
        };
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }
        try {
          return await fetch(requestUrl || url, {
            method: method,
            headers: headers,
            credentials: 'include',
            body: JSON.stringify(payload)
          });
        } catch (networkErr) {
          throw new Error(`Network error (${method} ${requestUrl || url}): ${networkErr.message}`);
        }
      };

      let res = await sendRequest(token);

      // If unauthorized (token might have expired just now), attempt silent refresh once and retry
      if (res.status === 401) {
        clearTargetSpaceCache();
        token = await getMemosAuthToken(true);
        if (token) {
          res = await sendRequest(token);
        }
      }

      // Memos 26.10+ serves the API under /api/...; older builds (e.g. 0.31)
      // only know /api/v1/... and answer the new path with 404 (26.10 answers
      // the legacy path with 410 Gone), so accept both.
      if (isLegacyFallbackStatus(res.status) && url.startsWith('/api/')) {
        const legacyUrl = url.replace(/^\/api\//, '/api/v1/');
        res = await sendRequest(token, legacyUrl);
        url = legacyUrl; // keep error reporting below accurate
      }

      if (res.status === 403) {
        // Likely lost membership of the dedicated space: drop the cached target
        clearTargetSpaceCache();
      }

      if (!res.ok) {
        const rawBody = await res.text().catch(() => '');
        let serverMsg = '';
        try {
          const errJson = JSON.parse(rawBody);
          serverMsg = errJson.message || errJson.code || '';
        } catch (_) { /* not JSON */ }
        console.error('[LanguageCard] Save failed', {
          page: window.location.href,
          request: `${method} ${url}`,
          absoluteUrl: res.url || url,
          status: res.status,
          statusText: res.statusText,
          usePatch,
          space: payload.space || null,
          hasAuthToken: Boolean(token),
          responseBody: rawBody.slice(0, 1000)
        });
        const bodySnippet = (serverMsg || rawBody).replace(/\s+/g, ' ').trim().slice(0, 200);
        throw new Error(
          `HTTP ${res.status}${res.statusText ? ' ' + res.statusText : ''}` +
          ` — ${method} ${res.url || url}` +
          (bodySnippet ? ` — ${bodySnippet}` : '') +
          ` (page: ${window.location.href})`
        );
      }

      // Register all tags from this saved card into tagStore
      const savedRawTags = (document.getElementById('lc-input-tags')?.value || '').trim();
      if (savedRawTags) {
        savedRawTags.split(/[\s,]+/).forEach(t => tagStore.add(t));
      }
      currentSections().forEach(s => {
        const txt = document.getElementById(`lc-input-${s.key}`)?.value || '';
        (txt.match(/#[^\s#]+/g) || []).forEach(t => tagStore.add(t));
      });

      [...currentSections().map(s => `lc-input-${s.key}`), 'lc-input-tags'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      // Edit mode: repaint the source card locally so the new content shows at once
      if (usePatch) {
        refreshCardLocally(state.editingMemoName, content);
      }
      state.editingMemoName = null;
      closeModal();
      // No page reload needed: Memos updates the feed on its own.
    } catch (err) {
      showError('Failed to save card: ' + err.message);
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerText = state.editingMemoName ? 'Update Card' : 'Save Card';
    }
  }

export {
  injectCreatorUI, openModal, closeModal, buildCardPayload,
  updatePreview, showError, clearError, saveCard, toggleExplanation
};
