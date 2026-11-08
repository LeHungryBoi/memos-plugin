import { CONFIG } from './config.js';
import { state, getGlobalEnabledLangs, toggleGlobalLang } from './state.js';
import { getCardHeaderJson, getCurrentSpace, syncThemeClass, copyText } from './utils.js';
import { isLegacyFallbackStatus, getMemosAuthToken } from './api.js';
import {
  clearTargetSpaceCache, resolveTargetSpace, refreshSpaceIndicator,
  showSpaceInfoPopup, hideSpaceInfoPopup, updateSpaceHint
} from './spaces.js';
import {
  tagStore, checkTagAutocomplete, handleTagAutocompleteKeydown, hideTagAutocomplete
} from './tags.js';
import { refreshCardLocally } from './card-render.js';

  function toggleModalLocalLang(key) {
    if (state.modalActiveLangs.includes(key)) {
      if (state.modalActiveLangs.length <= 1) return; // At least one
      state.modalActiveLangs = state.modalActiveLangs.filter(k => k !== key);
    } else {
      const next = [...state.modalActiveLangs, key];
      state.modalActiveLangs = CONFIG.languages.map(l => l.key).filter(k => next.includes(k));
    }
    // Update only the modal editor UI without affecting global state or outside cards
    updateModalEditorSlots();
  }

  // --- Part 2: Floating Global Switcher & Creator UI ---
  function updateFloatingBar() {
    const bar = document.getElementById('lc-floating-bar');
    if (!bar) return;
    const globalEnabled = getGlobalEnabledLangs();
    CONFIG.languages.forEach(l => {
      const btn = document.getElementById(`lc-toggle-btn-${l.key}`);
      if (btn) {
        const isAct = globalEnabled.includes(l.key);
        btn.classList.toggle('active', isAct);
        btn.style.borderColor = isAct ? l.color : 'transparent';
      }
    });
  }

  /** Update modal editor slots (STRICTLY LOCAL TO THIS MODAL SESSION) */
  function updateModalEditorSlots() {
    const activeCount = CONFIG.languages.filter(l => state.modalActiveLangs.includes(l.key)).length;
    const editorGrid = document.querySelector('.lc-editor-grid');
    if (editorGrid) {
      editorGrid.style.setProperty('--lc-editor-cols', Math.max(1, activeCount));
    }

    CONFIG.languages.forEach(l => {
      const slotEl = document.getElementById(`lc-editor-col-${l.key}`);
      const pillBtn = document.getElementById(`lc-modal-toggle-${l.key}`);
      const isAct = state.modalActiveLangs.includes(l.key);
      if (slotEl) {
        // If toggled off in this modal, takes NO space on the x-axis!
        slotEl.style.display = isAct ? 'flex' : 'none';
      }
      if (pillBtn) {
        pillBtn.classList.toggle('active', isAct);
        pillBtn.style.borderColor = isAct ? l.color : 'transparent';
        pillBtn.style.color = isAct ? l.color : 'var(--lc-text-muted)';
      }
    });

    updatePreview();
  }

  function injectCreatorUI() {
    if (document.getElementById('lc-floating-bar')) return;

    if (CONFIG.dedicatedSpaceKeyword) {
      if (!window.location.pathname.includes(CONFIG.dedicatedSpaceKeyword)) return;
    }

    // 1. Floating Container with Global Language Toggles ("The Switch Outside") + FAB
    const bar = document.createElement('div');
    bar.id = 'lc-floating-bar';
    bar.className = 'lc-floating-bar';

    const globalEnabled = getGlobalEnabledLangs();

    let togglesHtml = `<div class="lc-lang-toggles" title="Global language default for notes">`;
    CONFIG.languages.forEach(l => {
      const isAct = globalEnabled.includes(l.key);
      togglesHtml += `
        <button type="button" id="lc-toggle-btn-${l.key}" class="lc-lang-btn ${isAct ? 'active' : ''}" style="border-color:${isAct ? l.color : 'transparent'}">
          ${l.code}
        </button>
      `;
    });
    togglesHtml += `</div>`;

    bar.innerHTML = `
      ${togglesHtml}
      <button id="lc-fab-btn" class="lc-fab">
        <span>🔤</span><span>New Card</span>
      </button>
    `;

    document.body.appendChild(bar);

    // Bind floating global toggle clicks
    CONFIG.languages.forEach(l => {
      const btn = document.getElementById(`lc-toggle-btn-${l.key}`);
      if (btn) {
        btn.onclick = (e) => {
          e.stopPropagation();
          toggleGlobalLang(l.key);
        };
      }
    });

    document.getElementById('lc-fab-btn').onclick = () => openModal();

    // 2. Modal Overlay (Side-by-Side Editor with Local Toggle)
    const overlay = document.createElement('div');
    overlay.id = 'lc-modal-overlay';
    overlay.className = 'lc-modal-overlay';
    overlay.style.display = 'none';

    overlay.onclick = (e) => {
      if (e.target === overlay) closeModal();
    };

    overlay.innerHTML = `
      <div class="lc-modal-dialog">
        <div class="lc-modal-header">
          <div class="lc-modal-title-row">
            <h3 class="lc-modal-title">
              <span>🔤</span>
              <span id="lc-modal-title-text">New Language Card</span>
            </h3>
            <!-- Space indicator: replaces the old _t badge. Shows the dedicated
                 language card space (or warnings when it is ambiguous/missing) -->
            <button type="button" id="lc-space-indicator" class="lc-space-indicator lc-si-loading" title="Language card target space (click for details)">
              <span id="lc-space-indicator-text">⏳ Checking spaces…</span>
            </button>
          </div>

          <!-- Language Visibility Toggles in Modal (Local to this note) -->
          <div class="lc-modal-header-actions">
            <div class="lc-modal-lang-bar" title="Language slots for this card only">
              <span class="lc-modal-lang-label">This note:</span>
              ${CONFIG.languages.map(l => `
                <button type="button" id="lc-modal-toggle-${l.key}" class="lc-modal-lang-chip ${globalEnabled.includes(l.key) ? 'active' : ''}" style="border-color:${globalEnabled.includes(l.key) ? l.color : 'transparent'}; color:${globalEnabled.includes(l.key) ? l.color : 'var(--lc-text-muted)'}">
                  ${l.code}
                </button>
              `).join('')}
            </div>
            <button class="lc-modal-close" id="lc-modal-close-btn" title="Close (Esc)">&times;</button>
          </div>
        </div>

        <div class="lc-modal-body">
          <div id="lc-modal-error" style="display:none; color:#ef4444; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); border-radius:8px; padding:8px 12px; font-size:13px;"></div>

          <!-- Side-by-Side Card Editor Grid (JA on left, EN in middle, ZH on right) -->
          <div class="lc-editor-grid">
            <div class="lc-editor-slot lc-slot-ja" id="lc-editor-col-ja">
              <div class="lc-slot-header">
                <span class="lc-slot-badge ja" style="color: ${CONFIG.languages[0].color};">日本語 (ja)</span>
                <span class="lc-slot-hint">JA</span>
              </div>
              <textarea id="lc-input-ja" class="lc-slot-textarea" placeholder="e.g. セレンディピティ" rows="3"></textarea>
            </div>

            <div class="lc-editor-slot lc-slot-en" id="lc-editor-col-en">
              <div class="lc-slot-header">
                <span class="lc-slot-badge en" style="color: ${CONFIG.languages[1].color};">English (en)</span>
                <span class="lc-slot-hint">EN</span>
              </div>
              <textarea id="lc-input-en" class="lc-slot-textarea" placeholder="e.g. serendipity" rows="3"></textarea>
            </div>

            <div class="lc-editor-slot lc-slot-zh" id="lc-editor-col-zh">
              <div class="lc-slot-header">
                <span class="lc-slot-badge zh" style="color: ${CONFIG.languages[2].color};">中文 (zh)</span>
                <span class="lc-slot-hint">ZH</span>
              </div>
              <textarea id="lc-input-zh" class="lc-slot-textarea" placeholder="e.g. 意外发现珍宝的运气 / 缘分" rows="3"></textarea>
            </div>
          </div>

          <div class="lc-form-group" style="margin-top: 4px;">
            <label class="lc-form-label">Tags (separated by space or comma)</label>
            <input type="text" id="lc-input-tags" class="lc-form-input" placeholder="e.g. #vocab #daily #reading" autocomplete="off" />
          </div>

          <div class="lc-form-group">
            <label class="lc-form-label" style="display:flex; justify-content:space-between;">
              <span>Memos Payload Preview</span>
              <span id="lc-space-hint" style="font-weight: normal; font-size: 11px; opacity: 0.8;"></span>
            </label>
            <div id="lc-json-preview" class="lc-preview-box">{"_t":"lc","v":2}</div>
          </div>

          <!-- Language card header: paste into the description of the space that should receive cards -->
          <div class="lc-form-group">
            <label class="lc-form-label" style="display:flex; justify-content:space-between;">
              <span>Language Card Header (space description marker)</span>
              <span style="font-weight: normal; font-size: 11px; opacity: 0.8;">only one space may carry it</span>
            </label>
            <div class="lc-header-box">
              <code id="lc-header-json" class="lc-header-json"></code>
              <button type="button" id="lc-header-copy-btn" class="lc-header-copy-btn" title="Copy header JSON">📋</button>
            </div>
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

    // 3. Space info popup (opened by the space indicator in the modal header)
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
            <h3 class="lc-modal-title"><span id="lc-space-info-title">Language Card Space</span></h3>
          </div>
          <div class="lc-modal-header-actions">
            <button class="lc-modal-close" id="lc-space-info-close-btn" title="Close (Esc)">&times;</button>
          </div>
        </div>
        <div class="lc-modal-body" id="lc-space-info-body"></div>
        <div class="lc-modal-footer">
          <div style="font-size: 12px; color: var(--lc-text-muted);">Only one space may carry the language card header.</div>
          <div style="display:flex; gap:10px;">
            <button class="lc-btn lc-btn-primary" id="lc-space-info-ok-btn">Got it</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(infoOverlay);

    document.getElementById('lc-space-info-close-btn').onclick = hideSpaceInfoPopup;
    document.getElementById('lc-space-info-ok-btn').onclick = hideSpaceInfoPopup;

    // Header box: fill from CONFIG and wire its copy button
    const headerJsonEl = document.getElementById('lc-header-json');
    if (headerJsonEl) headerJsonEl.innerText = getCardHeaderJson();
    const headerCopyBtn = document.getElementById('lc-header-copy-btn');
    if (headerCopyBtn) {
      headerCopyBtn.onclick = (e) => {
        e.stopPropagation();
        copyText(getCardHeaderJson(), headerCopyBtn);
      };
    }

    // Space indicator: click re-checks the server, then opens the detail popup
    const spaceIndicator = document.getElementById('lc-space-indicator');
    if (spaceIndicator) {
      spaceIndicator.onclick = async (e) => {
        e.stopPropagation();
        const result = await refreshSpaceIndicator(true);
        showSpaceInfoPopup(result);
      };
    }
    refreshSpaceIndicator();

    // Bind modal local toggle clicks: only affects THIS note modal, NOT global!
    CONFIG.languages.forEach(l => {
      const btn = document.getElementById(`lc-modal-toggle-${l.key}`);
      if (btn) {
        btn.onclick = (e) => {
          e.stopPropagation();
          toggleModalLocalLang(l.key);
        };
      }
    });

    document.getElementById('lc-modal-close-btn').onclick = closeModal;
    document.getElementById('lc-btn-cancel').onclick = closeModal;
    document.getElementById('lc-btn-save').onclick = saveCard;

    // Live preview, tag autocomplete & keyboard events
    [...CONFIG.languages.map(l => `lc-input-${l.key}`), 'lc-input-tags'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', (e) => {
          updatePreview();
          checkTagAutocomplete(el);
        });
        el.addEventListener('click', () => {
          checkTagAutocomplete(el);
        });
        el.addEventListener('keyup', (e) => {
          // Re-anchor the dropdown when the caret moves without typing
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
          if (handleTagAutocompleteKeydown(e, el)) {
            return;
          }
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            saveCard();
          }
          if (e.key === 'Escape') {
            closeModal();
          }
        });
      }
    });
  }

  /**
   * Open the side-by-side editor.
   * editData = null -> create mode; otherwise pre-fill and update that card.
   * initialLangs = language slots to show (defaults to the global switch).
   */
  function openModal(editData, initialLangs) {
    syncThemeClass();
    const overlay = document.getElementById('lc-modal-overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    clearError();

    updateSpaceHint(getCurrentSpace());
    // Re-check (cheap when cached) so the indicator reflects the latest server state
    refreshSpaceIndicator();

    // Edit mode updates an existing card; otherwise create a new one
    state.editingMemoName = editData && editData.name ? editData.name : null;

    const titleText = document.getElementById('lc-modal-title-text');
    if (titleText) {
      titleText.innerText = state.editingMemoName ? 'Edit Language Card' : 'New Language Card';
    }
    const saveBtn = document.getElementById('lc-btn-save');
    if (saveBtn) saveBtn.innerText = state.editingMemoName ? 'Update Card' : 'Save Card';

    // Pre-fill from the card being edited, or reset for a fresh card
    const values = { tags: (editData && editData.tags) || '' };
    CONFIG.languages.forEach(l => { values[l.key] = (editData && editData[l.key]) || ''; });
    [...CONFIG.languages.map(l => l.key), 'tags'].forEach((key) => {
      const el = document.getElementById(`lc-input-${key}`);
      if (el) el.value = values[key];
    });

    // Modal's active languages: the edited card's own layout, else the global default
    state.modalActiveLangs = initialLangs && initialLangs.length
      ? CONFIG.languages.map(l => l.key).filter(k => initialLangs.includes(k))
      : [...getGlobalEnabledLangs()];
    updateModalEditorSlots();

    hideTagAutocomplete();
    tagStore.scanPage();
    tagStore.fetchServer();

    // Focus on the first visible language textarea
    const firstKey = state.modalActiveLangs.includes('en') ? 'en' : state.modalActiveLangs[0] || 'en';
    const firstInput = document.getElementById(`lc-input-${firstKey}`);
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 60);
    }
  }

  function closeModal() {
    hideTagAutocomplete();
    const overlay = document.getElementById('lc-modal-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  function buildCardPayload() {
    // Language sections are serialized in CONFIG.languages order — the same
    // left-to-right order the editor UI shows — so the output JSON always
    // mirrors the UI, and adding a language to CONFIG is picked up for free.
    const data = { _t: CONFIG.typeIdentifier, v: CONFIG.cardVersion };
    let hasAny = false;
    CONFIG.languages.forEach((lang) => {
      const val = (document.getElementById(`lc-input-${lang.key}`)?.value || '').trim();
      if (val) {
        data[lang.key] = val;
        hasAny = true;
      }
    });

    const rawTags = (document.getElementById('lc-input-tags')?.value || '').trim();

    const tags = rawTags
      ? rawTags
          .split(/[\s,]+/)
          .map((t) => (t.startsWith('#') ? t : `#${t}`))
          .filter((t) => t.length > 1)
          .join(' ')
      : '';

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
      // The dedicated space (marked by the LC header in its description) wins;
      // otherwise keep the previous behaviour: URL space, else personal space.
      let dedicatedSpace = null;
      try {
        const resolved = await resolveTargetSpace();
        dedicatedSpace = resolved.space;
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
        // Surface the exact failing request: method, absolute URL, status and
        // the raw response body. Memos returns JSON {message}; a proxy or SPA
        // fallback returns HTML instead — that distinction is the key clue
        // when the same code works on one device but not another.
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
      CONFIG.languages.map(l => `lc-input-${l.key}`).forEach(id => {
        const txt = document.getElementById(id)?.value || '';
        (txt.match(/#[^\s#]+/g) || []).forEach(t => tagStore.add(t));
      });

      [...CONFIG.languages.map(l => `lc-input-${l.key}`), 'lc-input-tags'].forEach((id) => {
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

export { toggleModalLocalLang, updateFloatingBar, updateModalEditorSlots, injectCreatorUI, openModal, closeModal, buildCardPayload, updatePreview, showError, clearError, saveCard };
