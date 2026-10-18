/**
 * ============================================================================
 * Language Card Extension for Memos (Custom JavaScript v2.8)
 * Features:
 * - Outside Switch = Global default (persisted in localStorage)
 * - Inside Note / Modal Switch = Strictly scoped to that individual note/modal
 * - JA (left) -> EN (middle) -> ZH (right) ordering
 * - Toggled-off languages take 0 space on the x-axis
 * - Mobile-first side-by-side 2-column layout
 * - Resilient JSON & immutable _t:"lc" identifier with legacy/space fallback
 * - Save does not reload the page (Memos feed updates on its own)
 * - Per-card Edit button reuses the same side-by-side editor (PATCH update, no reload)
 * - Tag autocomplete dropdown opens right below the text caret (blinker),
 *   follows caret movement / modal scroll / viewport resize
 * - Save failures report the exact request: method, absolute URL, HTTP status
 *   and the raw response body (plus full detail in the browser console)
 * - Dedicated space: a space whose description carries the LC header JSON
 *   receives every new card; the modal header shows a clickable space
 *   indicator (ok / "multiple spaces" warning / "not found" with setup guide)
 * Paste into: Memos Admin -> Settings -> System -> Additional Script
 * ============================================================================
 */

(function () {
  'use strict';

  // --- Configuration ---
  const CONFIG = {
    typeIdentifier: 'lc',
    cardVersion: 2,
    dedicatedSpaceKeyword: null,
    // Ordered: JA (left) -> EN (middle) -> ZH (right)
    languages: [
      { key: 'ja', label: '日本語', code: 'JA', color: '#fbbf24', ttsLang: 'ja-JP', placeholder: 'e.g. セレンディピティ' },
      { key: 'en', label: 'English', code: 'EN', color: '#38bdf8', ttsLang: 'en-US', placeholder: 'e.g. serendipity' },
      { key: 'zh', label: '中文', code: 'ZH', color: '#34d399', ttsLang: 'zh-CN', placeholder: 'e.g. 意外发现珍宝的运气 / 缘分' }
    ]
  };

  const LS_GLOBAL_LANGS_KEY = 'memos_lc_enabled_langs_v2';

  // --- Global Language State (The "Switch Outside") ---
  function getGlobalEnabledLangs() {
    try {
      const saved = localStorage.getItem(LS_GLOBAL_LANGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return ['en', 'zh']; // Default: English and Chinese active, Japanese off
  }

  function setGlobalEnabledLangs(langs) {
    try {
      localStorage.setItem(LS_GLOBAL_LANGS_KEY, JSON.stringify(langs));
    } catch (e) {
      // ignore
    }
  }

  /** Global switch handler: updates localStorage and resets all cards to global default */
  function toggleGlobalLang(key) {
    const current = getGlobalEnabledLangs();
    let next;
    if (current.includes(key)) {
      if (current.length <= 1) return; // Keep at least one active
      next = current.filter(k => k !== key);
    } else {
      next = [...current, key];
      // Keep defined order: ja -> en -> zh
      next = CONFIG.languages.map(l => l.key).filter(k => next.includes(k));
    }
    setGlobalEnabledLangs(next);

    // Re-render all cards on page to inherit the new global default
    // (force flag makes the parser run again; raw text is kept)
    document.querySelectorAll('[data-lc-parsed]').forEach(el => {
      el.removeAttribute('data-lc-parsed');
      el.setAttribute('data-lc-force', '1');
    });
    renderLanguageCards();
    updateFloatingBar();
  }

  // --- Local Modal Editor State (Strictly scoped to the note creation modal) ---
  let modalActiveLangs = ['en', 'zh'];

  // null = create mode; otherwise the Memos name ("memos/xxx") of the card being edited
  let editingMemoName = null;

  function toggleModalLocalLang(key) {
    if (modalActiveLangs.includes(key)) {
      if (modalActiveLangs.length <= 1) return; // At least one
      modalActiveLangs = modalActiveLangs.filter(k => k !== key);
    } else {
      const next = [...modalActiveLangs, key];
      modalActiveLangs = CONFIG.languages.map(l => l.key).filter(k => next.includes(k));
    }
    // Update only the modal editor UI without affecting global state or outside cards
    updateModalEditorSlots();
  }

  /** Check if Memos is currently in dark mode */
  function syncThemeClass() {
    let isDark = false;
    const bodyBg = window.getComputedStyle(document.body).backgroundColor;
    const rgb = bodyBg.match(/\d+/g);
    if (rgb && rgb.length >= 3) {
      const yiq = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
      isDark = yiq < 128;
    } else {
      isDark = document.documentElement.classList.contains('dark') || 
               document.body.classList.contains('dark') || 
               document.documentElement.style.colorScheme === 'dark' ||
               window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    document.body.classList.toggle('lc-theme-dark', isDark);
  }

  /** Extract current space from URL */
  function getCurrentSpace() {
    const path = window.location.pathname;
    const match = path.match(/\/s\/([^\/]+)/);
    if (match && match[1]) {
      return match[1].startsWith('spaces/') ? match[1] : `spaces/${match[1]}`;
    }
    return null;
  }

  // --- Dedicated Space Resolution ---
  // A space becomes "the language card space" when its description carries the
  // language card header JSON ({"_t":"lc","v":2}). New cards are then saved
  // there regardless of which page the editor is opened from.
  const LS_TARGET_SPACE_KEY = 'memos_lc_target_space_v2';

  /** "spaces/abc123" -> "abc123" (display only; API calls keep the full name) */
  function stripSpacePrefix(name) {
    return String(name || '').replace(/^spaces\//, '');
  }

  /** The header JSON that marks a space (and a memo) as a language card */
  function getCardHeaderJson() {
    return JSON.stringify({ _t: CONFIG.typeIdentifier, v: CONFIG.cardVersion });
  }

  // --- API Generation Compatibility ---
  // Two API generations exist in the wild:
  // - memos 0.31 (and older): /api/v1/... REST, /memos.api.v1.<Service>/<Method> Connect
  // - memos 26.10+ (current): /api/... REST, /memos.api.<Service>/<Method> Connect,
  //   and v1 paths answer 410 Gone
  // Requests below try the new path first and fall back to the legacy one.
  // Note: on 0.31 the new path is simply unknown -> 404 (NOT 410).
  function isLegacyFallbackStatus(status) {
    return status === 404 || status === 410;
  }

  /** GET the first path that does not answer 404/410; returns the last response otherwise */
  async function fetchJsonWithFallback(paths, token) {
    let lastRes = null;
    for (const path of paths) {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(path, { headers, credentials: 'include' });
      if (isLegacyFallbackStatus(res.status)) {
        lastRes = res;
        continue;
      }
      return res;
    }
    return lastRes;
  }

  /** List every space the current user belongs to (paginated) */
  async function fetchAllSpaces(token) {
    const spaces = [];
    let pageToken = '';
    do {
      const query = pageToken ? `?pageSize=1000&pageToken=${encodeURIComponent(pageToken)}` : '?pageSize=1000';
      const res = await fetchJsonWithFallback([`/api/spaces${query}`, `/api/v1/spaces${query}`], token);
      if (!res || !res.ok) throw new Error(`ListSpaces failed: HTTP ${res ? res.status : 'no response'}`);
      const json = await res.json();
      if (Array.isArray(json.spaces)) spaces.push(...json.spaces);
      pageToken = json.nextPageToken || '';
    } while (pageToken);
    return spaces;
  }

  /**
   * Extract the language card header from a space description.
   * Tolerant: human-readable text may surround the JSON (first "{" to last
   * "}"), the same strategy parseCardMemo uses for memo content.
   */
  function parseSpaceHeader(description) {
    if (!description || !description.includes('{')) return null;
    const start = description.indexOf('{');
    const end = description.lastIndexOf('}');
    if (start === -1 || end <= start) return null;
    try {
      const data = JSON.parse(description.substring(start, end + 1));
      return data && data._t === CONFIG.typeIdentifier ? data : null;
    } catch (e) {
      return null;
    }
  }

  /** All spaces carrying the language card header, sorted for deterministic picks */
  async function findDedicatedSpaces() {
    const token = await getMemosAuthToken();
    const spaces = await fetchAllSpaces(token);
    return spaces
      .filter((space) => parseSpaceHeader(space.description))
      .sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }

  /** Read the cached dedicated space; tolerates the legacy bare-name cache format */
  function readCachedTargetSpace() {
    try {
      const raw = localStorage.getItem(LS_TARGET_SPACE_KEY);
      if (!raw) return null;
      if (raw.startsWith('{')) {
        const parsed = JSON.parse(raw);
        return parsed && parsed.name ? { name: parsed.name, title: parsed.title || '' } : null;
      }
      // Legacy cache entry: bare resource name "spaces/xxx" (no title known)
      return { name: raw, title: '' };
    } catch (e) {
      return null;
    }
  }

  function writeCachedTargetSpace(name, title) {
    try {
      localStorage.setItem(LS_TARGET_SPACE_KEY, JSON.stringify({ name: name, title: title || '' }));
    } catch (e) { /* ignore */ }
  }

  /**
   * Resolve the dedicated language card space.
   * Returns { space: "spaces/xxx" | null (API resource name),
   *           title: human-readable space title ("" when unknown),
   *           matches: Space[] | null, fromCache }.
   * - exactly one match -> that space (name+title cached in localStorage)
   * - multiple matches  -> null (ambiguous; the caller shows a warning)
   * - none / fetch error -> null
   */
  async function resolveTargetSpace(options) {
    const force = Boolean(options && options.force);
    if (!force) {
      const cached = readCachedTargetSpace();
      if (cached) return { space: cached.name, title: cached.title, matches: null, fromCache: true };
    }
    const matches = await findDedicatedSpaces();
    if (matches.length === 1) {
      writeCachedTargetSpace(matches[0].name, matches[0].title || '');
      return { space: matches[0].name, title: matches[0].title || '', matches, fromCache: false };
    }
    clearTargetSpaceCache();
    return { space: null, title: '', matches, fromCache: false };
  }

  function clearTargetSpaceCache() {
    try { localStorage.removeItem(LS_TARGET_SPACE_KEY); } catch (e) { /* ignore */ }
  }

  /**
   * Resilient JSON and Tag Parser with Identifier Validation
   */
  function parseCardMemo(rawText, currentSpace) {
    if (!rawText || !rawText.includes('{')) return null;

    const startIdx = rawText.indexOf('{');
    const endIdx = rawText.lastIndexOf('}');
    if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) return null;

    const jsonCandidate = rawText.substring(startIdx, endIdx + 1);
    const tagsCandidate = rawText.substring(endIdx + 1);

    let cardData = null;

    try {
      cardData = JSON.parse(jsonCandidate);
    } catch (e) {
      const fields = {};
      const reg = /"(_t|en|ja|jp|zh|cn|v)"\s*:\s*"([\s\S]*?)"(?=\s*[,}])/g;
      let m;
      while ((m = reg.exec(jsonCandidate)) !== null) {
        fields[m[1]] = m[2].replace(/\\n/g, '\n').replace(/\\"/g, '"');
      }
      if (Object.keys(fields).length > 0) {
        cardData = fields;
      }
    }

    if (!cardData || typeof cardData !== 'object') return null;

    if (cardData._t && cardData._t !== CONFIG.typeIdentifier) return null;

    const hasLang = ['en', 'ja', 'jp', 'zh', 'cn'].some((k) => k in cardData);
    const isExplicitCard = cardData._t === CONFIG.typeIdentifier;
    const isDedicatedSpace = Boolean(
      CONFIG.dedicatedSpaceKeyword &&
      currentSpace &&
      currentSpace.toLowerCase().includes(CONFIG.dedicatedSpaceKeyword.toLowerCase())
    );
    const isLegacyCard = (cardData.v || cardData.v === 0) && hasLang;

    if (!isExplicitCard && !isDedicatedSpace && !isLegacyCard) {
      return null;
    }

    const tags = (tagsCandidate.match(/#[^\s#]+/g) || []);
    const hasValues = ['en', 'ja', 'jp', 'zh', 'cn'].some(
      (k) => cardData[k] && String(cardData[k]).trim().length > 0
    );
    if (!hasValues && tags.length === 0) {
      return null;
    }

    return { data: cardData, tags, rawText };
  }

  /**
   * Value of one language section in card data, with legacy key fallback
   * (jp -> ja, cn -> zh). Returns "" when the section is absent or empty.
   */
  function cardLangValue(data, langKey) {
    if (!data) return '';
    const legacy = langKey === 'ja' ? data['jp'] : (langKey === 'zh' ? data['cn'] : null);
    const val = data[langKey] || legacy || '';
    return String(val).trim();
  }

  /** Languages the card actually has content in, in CONFIG (UI) order */
  function cardPresentLangs(data) {
    return CONFIG.languages.filter(lang => cardLangValue(data, lang.key)).map(lang => lang.key);
  }

  // --- Part 1: Render Language Cards with Per-Note Local Switch ---

  /** Resolve the Memos name ("memos/xxx") of the card that owns this container */
  function getMemoNameFromContainer(container) {
    // A previous render may have stamped it on the container itself
    const own = container.getAttribute('data-lc-memo-name');
    if (own) return own;
    const article = container.closest('article');
    // MemoContent stamps data-memo-name on the content wrapper INSIDE the body
    // (memos/web MemoContent); also check ancestors for other layouts.
    const holders = [
      container.querySelector('[data-memo-name]'),
      container.closest('[data-memo-name]'),
      article && article.querySelector('[data-memo-name]')
    ];
    for (const holder of holders) {
      const value = holder && holder.getAttribute('data-memo-name');
      if (value) return value;
    }
    // Fallback: the time link in the memo header points to /<memo-name>
    const link = article && article.querySelector('a[href^="/memos/"]');
    if (link) {
      const match = (link.getAttribute('href') || '').match(/^\/(memos\/[^/?#]+)/);
      if (match) return match[1];
    }
    return null;
  }

  function renderLanguageCards() {
    syncThemeClass();
    const currentSpace = getCurrentSpace();
    const globalEnabled = getGlobalEnabledLangs();

    const candidates = document.querySelectorAll(
      'article [data-slot="memo-body"], article .tiptap, .memo-content-text'
    );

    candidates.forEach((container) => {
      const forced = container.hasAttribute('data-lc-force');
      container.removeAttribute('data-lc-force');
      const hasWrapper = Boolean(container.querySelector('.lc-card-wrapper'));
      // Skip already-rendered cards (unless a re-render was explicitly forced)
      if (!forced && container.hasAttribute('data-lc-raw') && hasWrapper) return;
      // No wrapper (fresh body, or Memos re-rendered it): capture the live text.
      // Only trust text that looks like memo content (contains the JSON), so our
      // own rendered UI never becomes the raw source. Forced renders skip this:
      // the caller already knows the raw text.
      const liveText = container.innerText.trim();
      if (!forced) {
        if (liveText.includes('{')) {
          container.setAttribute('data-lc-raw', liveText);
          // Fresh Memos content: drop the stale name so it gets re-resolved
          container.removeAttribute('data-lc-memo-name');
        } else if (!container.getAttribute('data-lc-raw')) {
          container.setAttribute('data-lc-raw', liveText);
        }
        // Transient empty body (Memos mid re-render): wait for the next pass
        if (!liveText) return;
      }
      const rawText = container.getAttribute('data-lc-raw');
      const parsed = parseCardMemo(rawText, currentSpace);
      if (!parsed) return;

      container.setAttribute('data-lc-parsed', 'true');
      const { data, tags } = parsed;
      if (tags && tags.length > 0) {
        tags.forEach(t => tagStore.add(t));
      }
      const memoName = getMemoNameFromContainer(container);
      if (memoName) container.setAttribute('data-lc-memo-name', memoName);

      // Card wrapper
      const cardWrapper = document.createElement('div');
      cardWrapper.className = 'lc-card-wrapper';

      // Per-note language state: the languages THIS card actually contains,
      // in UI order (a ja-only card shows only the ja slot). The global switch
      // is only the fallback for cards without any language content (e.g. a
      // tags-only legacy card). Toggling pills here ONLY affects this note!
      const cardLangs = cardPresentLangs(data);
      const noteActiveLangs = new Set(cardLangs.length > 0 ? cardLangs : globalEnabled);

      // 1. Per-note Header Bar with Local Language Switch
      const noteBar = document.createElement('div');
      noteBar.className = 'lc-card-note-bar';

      const titleEl = document.createElement('div');
      titleEl.className = 'lc-card-note-title';
      titleEl.innerHTML = `<span>🔤</span><span>Card</span>`;
      noteBar.appendChild(titleEl);

      const noteToggles = document.createElement('div');
      noteToggles.className = 'lc-card-note-toggles';
      noteToggles.title = 'Toggle languages for this note';

      const grid = document.createElement('div');
      grid.className = 'lc-card-grid';

      // Function to re-calculate columns & visibility for THIS card only
      function updateThisNoteLayout() {
        const activeCount = Array.from(noteActiveLangs).filter(k => 
          CONFIG.languages.some(l => l.key === k)
        ).length;
        grid.style.setProperty('--lc-cols', Math.max(1, activeCount));

        CONFIG.languages.forEach(lang => {
          const slot = grid.querySelector(`[data-lc-slot="${lang.key}"]`);
          const pill = noteToggles.querySelector(`[data-lc-pill="${lang.key}"]`);
          const isAct = noteActiveLangs.has(lang.key);
          if (slot) {
            slot.style.display = isAct ? 'flex' : 'none';
          }
          if (pill) {
            pill.classList.toggle('active', isAct);
            pill.style.borderColor = isAct ? lang.color : 'transparent';
            pill.style.color = isAct ? lang.color : 'var(--lc-text-muted)';
          }
        });
      }

      // Add pill toggles for all languages in this note
      CONFIG.languages.forEach(lang => {
        const hasText = Boolean(cardLangValue(data, lang.key));
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'lc-note-toggle' + (noteActiveLangs.has(lang.key) ? ' active' : '');
        pill.setAttribute('data-lc-pill', lang.key);
        pill.innerText = lang.code;
        if (!hasText) pill.style.opacity = '0.5';
        pill.title = `${lang.name} (${hasText ? 'has text' : 'empty in this card'})`;

        pill.onclick = (e) => {
          e.stopPropagation();
          // Toggle inside THIS note only
          if (noteActiveLangs.has(lang.key)) {
            if (noteActiveLangs.size <= 1) return; // Keep at least 1
            noteActiveLangs.delete(lang.key);
          } else {
            noteActiveLangs.add(lang.key);
          }
          updateThisNoteLayout();
        };

        noteToggles.appendChild(pill);
      });

      // Right-side controls: per-note language toggles + edit button
      const noteControls = document.createElement('div');
      noteControls.className = 'lc-card-note-controls';
      noteControls.appendChild(noteToggles);

      // Edit button: opens the same side-by-side editor, pre-filled with this card
      if (memoName) {
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'lc-btn-icon lc-card-edit-btn';
        editBtn.title = 'Edit this card';
        editBtn.innerText = '✏️';
        editBtn.onclick = (e) => {
          e.stopPropagation();
          // Pre-fill in CONFIG (UI) order; cardLangValue handles legacy jp/cn keys
          const editValues = { name: memoName, tags: tags.join(' ') };
          CONFIG.languages.forEach(l => { editValues[l.key] = cardLangValue(data, l.key); });
          openModal(editValues, Array.from(noteActiveLangs));
        };
        noteControls.appendChild(editBtn);
      }

      noteBar.appendChild(noteControls);
      cardWrapper.appendChild(noteBar);

      // 2. Build Card Slots (JA -> EN -> ZH)
      CONFIG.languages.forEach((lang) => {
        const val = cardLangValue(data, lang.key);
        
        const slot = document.createElement('div');
        slot.className = 'lc-card-slot';
        slot.setAttribute('data-lc-slot', lang.key);
        slot.style.display = noteActiveLangs.has(lang.key) ? 'flex' : 'none';

        const header = document.createElement('div');
        header.className = 'lc-card-header';

        const badge = document.createElement('span');
        badge.className = 'lc-card-badge';
        badge.style.color = lang.color;
        badge.innerText = lang.label;
        header.appendChild(badge);

        slot.appendChild(header);

        const textEl = document.createElement('div');
        textEl.className = 'lc-card-text' + (val ? '' : ' lc-card-empty');
        textEl.innerText = val || '—';
        slot.appendChild(textEl);

        grid.appendChild(slot);
      });

      cardWrapper.appendChild(grid);
      updateThisNoteLayout();

      // 3. Tags container
      if (tags.length > 0) {
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'lc-card-tags';
        tags.forEach((tag) => {
          const chip = document.createElement('span');
          chip.className = 'lc-tag-chip';
          chip.innerText = tag;
          tagsContainer.appendChild(chip);
        });
        cardWrapper.appendChild(tagsContainer);
      }

      // Replace container's content with our structured card
      container.innerHTML = '';
      container.appendChild(cardWrapper);
    });
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
    const activeCount = CONFIG.languages.filter(l => modalActiveLangs.includes(l.key)).length;
    const editorGrid = document.querySelector('.lc-editor-grid');
    if (editorGrid) {
      editorGrid.style.setProperty('--lc-editor-cols', Math.max(1, activeCount));
    }

    CONFIG.languages.forEach(l => {
      const slotEl = document.getElementById(`lc-editor-col-${l.key}`);
      const pillBtn = document.getElementById(`lc-modal-toggle-${l.key}`);
      const isAct = modalActiveLangs.includes(l.key);
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

  // ============================================================================
  // Tag Autocomplete Controller (matches Memos native editor # autocomplete)
  // ============================================================================

  const tagStore = {
    tags: new Map(), // cleanTag -> count
    lastFetched: 0,
    isFetching: false,

    add(tag, count = 1) {
      if (!tag) return;
      const clean = String(tag).replace(/^[#＃]/, '').trim();
      if (!clean) return;
      const prev = this.tags.get(clean) || 0;
      this.tags.set(clean, Math.max(prev, count));
    },

    scanPage() {
      // 1. Tags in rendered language card chips
      document.querySelectorAll('.lc-tag-chip').forEach(el => {
        this.add(el.innerText);
      });
      // 2. Raw content in cards
      document.querySelectorAll('[data-lc-raw]').forEach(el => {
        const raw = el.getAttribute('data-lc-raw') || '';
        const matches = raw.match(/#[^\s#]+/g) || [];
        matches.forEach(m => this.add(m));
      });
      // 3. Memos sidebar tag rows and native tag elements
      document.querySelectorAll('button[aria-label^="#"], button[aria-label*="#"], [data-tag], a[href*="tag="]').forEach(el => {
        const text = el.getAttribute('data-tag') || el.getAttribute('aria-label') || el.innerText || '';
        const matches = text.match(/#[^\s#]+/g) || [];
        matches.forEach(m => this.add(m));
      });
    },

    async fetchServer() {
      const now = Date.now();
      if (this.isFetching || (now - this.lastFetched < 45000 && this.tags.size > 0)) {
        return;
      }
      this.isFetching = true;
      try {
        const token = await getMemosAuthToken();
        const headers = {
          'Content-Type': 'application/json',
          'Connect-Protocol-Version': '1'
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Normalize both generations:
        // - new (26.10+): ListUserStats {parent}, response userStats[].tagCounts
        // - 0.31:        ListAllUserStats {}, response stats[].tagCount
        const ingest = (json) => {
          const stats = (json && (json.userStats || json.stats)) || [];
          let found = false;
          stats.forEach(stat => {
            const counts = (stat && (stat.tagCounts || stat.tagCount)) || null;
            if (counts && typeof counts === 'object') {
              Object.entries(counts).forEach(([tag, cnt]) => {
                this.add(tag, Number(cnt) || 1);
                found = true;
              });
            }
          });
          return found;
        };

        // 1. New API: POST /memos.api.UserService/ListUserStats
        const res = await fetch('/memos.api.UserService/ListUserStats', {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify({ parent: 'users/-' })
        });
        if (res.ok) {
          const json = await res.json();
          if (ingest(json)) {
            this.lastFetched = Date.now();
            return;
          }
        }

        // 2. Legacy API (memos 0.31): POST /memos.api.v1.UserService/ListAllUserStats
        const resLegacy = await fetch('/memos.api.v1.UserService/ListAllUserStats', {
          method: 'POST',
          headers,
          credentials: 'include',
          body: '{}'
        });
        if (resLegacy.ok) {
          const jsonLegacy = await resLegacy.json();
          if (ingest(jsonLegacy)) {
            this.lastFetched = Date.now();
            return;
          }
        }

        // 3. REST fallbacks (new route, then the 0.31 route /api/v1/users:stats)
        for (const restUrl of ['/api/users/-/stats', '/api/v1/users:stats']) {
          const res2 = await fetch(restUrl, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            credentials: 'include'
          }).catch(() => null);
          if (res2 && res2.ok) {
            const json2 = await res2.json();
            if (ingest(json2)) {
              this.lastFetched = Date.now();
              return;
            }
          }
        }
      } catch (e) {
        // Fallback to DOM scanned tags
      } finally {
        this.isFetching = false;
      }
    }
  };

  /** Match ranking identical to Memos native editor (extensions.ts matchRank) */
  function matchTagRank(tag, typed) {
    if (!typed) return 0;
    const lowerTag = tag.toLowerCase();
    const idx = lowerTag.indexOf(typed);
    if (idx < 0) return -1;
    if (idx === 0) return 0; // Full-path prefix
    if (lowerTag[idx - 1] === '/') return 1; // Path-segment start (e.g. "vo" in "lang/vocab")
    return 2; // Substring anywhere else
  }

  function getRankedTagMatches(query) {
    const typed = (query || '').toLowerCase().trim();
    const results = [];
    tagStore.tags.forEach((count, tag) => {
      const rank = matchTagRank(tag, typed);
      if (rank >= 0) {
        results.push({ tag, rank, count });
      }
    });

    results.sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      if (b.count !== a.count) return b.count - a.count;
      return a.tag.localeCompare(b.tag);
    });

    return results.slice(0, 10);
  }

  const activeAutocomplete = {
    inputEl: null,
    tokenStart: 0,
    tokenEnd: 0,
    query: '',
    items: [],
    highlightedIndex: 0,
    hasExactMatch: false
  };

  function getOrCreateTagDropdown() {
    let dropdown = document.getElementById('lc-tag-dropdown');
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.id = 'lc-tag-dropdown';
      dropdown.className = 'lc-tag-dropdown';
      dropdown.style.display = 'none';
      const dialog = document.querySelector('.lc-modal-dialog');
      if (dialog) {
        dialog.appendChild(dropdown);
      } else {
        document.body.appendChild(dropdown);
      }
      // Keep the dropdown anchored to the caret while the modal body scrolls
      // or the viewport resizes (capture phase so nested scrollers are caught).
      document.addEventListener('scroll', () => {
        const dd = document.getElementById('lc-tag-dropdown');
        if (!dd || dd.style.display === 'none') return;
        const inputEl = activeAutocomplete.inputEl;
        if (!inputEl || !inputEl.isConnected) {
          hideTagAutocomplete();
          return;
        }
        const scroller = inputEl.closest('.lc-modal-body');
        if (scroller) {
          const inputRect = inputEl.getBoundingClientRect();
          const scrollRect = scroller.getBoundingClientRect();
          if (inputRect.bottom < scrollRect.top || inputRect.top > scrollRect.bottom) {
            hideTagAutocomplete(); // input scrolled out of view
            return;
          }
        }
        positionDropdown(dd, inputEl);
      }, true);
      window.addEventListener('resize', () => {
        const dd = document.getElementById('lc-tag-dropdown');
        if (dd && dd.style.display !== 'none' && activeAutocomplete.inputEl) {
          positionDropdown(dd, activeAutocomplete.inputEl);
        }
      });
    }
    return dropdown;
  }

  function hideTagAutocomplete() {
    const dropdown = document.getElementById('lc-tag-dropdown');
    if (dropdown) dropdown.style.display = 'none';
    activeAutocomplete.inputEl = null;
    activeAutocomplete.items = [];
    activeAutocomplete.highlightedIndex = 0;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderTagDropdown(matches, query, targetEl) {
    const dropdown = getOrCreateTagDropdown();
    activeAutocomplete.items = matches;
    activeAutocomplete.query = query;
    activeAutocomplete.inputEl = targetEl;
    activeAutocomplete.highlightedIndex = 0;

    const hasExact = matches.some(m => m.tag.toLowerCase() === query.toLowerCase());
    activeAutocomplete.hasExactMatch = hasExact;

    const canCreateNew = query.length > 0 && !hasExact;
    const totalSelectable = matches.length + (canCreateNew ? 1 : 0);

    if (totalSelectable === 0) {
      dropdown.innerHTML = `
        <div class="lc-tag-dropdown-header">
          <span># Tags</span>
        </div>
        <div class="lc-tag-dropdown-empty">Type a tag name...</div>
      `;
    } else {
      let listHtml = '';
      matches.forEach((m, idx) => {
        let displayLabel = escapeHtml(m.tag);
        if (query.length > 0) {
          const lower = m.tag.toLowerCase();
          const matchIdx = lower.indexOf(query.toLowerCase());
          if (matchIdx >= 0) {
            const before = escapeHtml(m.tag.slice(0, matchIdx));
            const hit = escapeHtml(m.tag.slice(matchIdx, matchIdx + query.length));
            const after = escapeHtml(m.tag.slice(matchIdx + query.length));
            displayLabel = `${before}<b>${hit}</b>${after}`;
          }
        }
        const countBadge = m.count > 0 ? `<span class="lc-tag-count">${m.count}</span>` : '';
        listHtml += `
          <div class="lc-tag-item ${idx === 0 ? 'active' : ''}" data-index="${idx}" data-tag="${escapeHtml(m.tag)}">
            <div class="lc-tag-item-left">
              <span class="lc-tag-icon">#</span>
              <span class="lc-tag-label">${displayLabel}</span>
            </div>
            ${countBadge}
          </div>
        `;
      });

      if (canCreateNew) {
        const createIdx = matches.length;
        listHtml += `
          <div class="lc-tag-item lc-tag-item-create ${matches.length === 0 ? 'active' : ''}" data-index="${createIdx}" data-tag="${escapeHtml(query)}">
            <div class="lc-tag-item-left">
              <span class="lc-tag-icon">+</span>
              <span class="lc-tag-label">Create tag <b>#${escapeHtml(query)}</b></span>
            </div>
          </div>
        `;
      }

      dropdown.innerHTML = `
        <div class="lc-tag-dropdown-header">
          <span># Tags</span>
          <span style="font-size:10px; opacity:0.75;">${matches.length} found</span>
        </div>
        <div class="lc-tag-dropdown-list">
          ${listHtml}
        </div>
      `;
    }

    // Attach click and hover events to items
    dropdown.querySelectorAll('.lc-tag-item').forEach(item => {
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const tag = item.getAttribute('data-tag');
        if (tag) applyTagSelection(tag);
      });
      item.addEventListener('mouseenter', () => {
        const idx = parseInt(item.getAttribute('data-index'), 10);
        if (!isNaN(idx)) {
          activeAutocomplete.highlightedIndex = idx;
          updateDropdownHighlight(dropdown);
        }
      });
    });

    positionDropdown(dropdown, targetEl);
  }

  function updateDropdownHighlight(dropdown) {
    dropdown.querySelectorAll('.lc-tag-item').forEach((item, idx) => {
      item.classList.toggle('active', idx === activeAutocomplete.highlightedIndex);
      if (idx === activeAutocomplete.highlightedIndex) {
        item.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  // Mirror-div technique: pixel position of the caret ("blinker") inside an
  // <input>/<textarea>, relative to the element's border-box top-left corner.
  function getCaretCoordinates(el, position) {
    const properties = [
      'direction', 'boxSizing', 'width', 'height',
      'overflowX', 'overflowY',
      'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
      'borderStyle',
      'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
      'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize',
      'fontSizeAdjust', 'lineHeight', 'fontFamily',
      'textAlign', 'textTransform', 'textIndent', 'textDecoration',
      'letterSpacing', 'wordSpacing', 'tabSize'
    ];

    const mirror = document.createElement('div');
    document.body.appendChild(mirror);

    const style = mirror.style;
    const computed = window.getComputedStyle(el);

    style.position = 'absolute';
    style.visibility = 'hidden';
    style.top = '0';
    style.left = '0';
    style.whiteSpace = 'pre-wrap';
    style.wordWrap = 'break-word';

    properties.forEach(prop => {
      style[prop] = computed[prop];
    });

    if (el.nodeName === 'INPUT') {
      style.whiteSpace = 'nowrap';
      style.wordWrap = 'normal';
    } else {
      style.height = 'auto';
    }

    mirror.textContent = el.value.substring(0, position);

    const marker = document.createElement('span');
    marker.textContent = el.value.substring(position) || '.';
    mirror.appendChild(marker);

    const coordinates = {
      left: marker.offsetLeft - (el.scrollLeft || 0) + parseInt(computed['borderLeftWidth'], 10),
      top: marker.offsetTop + parseInt(computed['borderTopWidth'], 10),
      height: parseInt(computed['lineHeight'], 10) || parseFloat(computed['fontSize'])
    };

    document.body.removeChild(mirror);
    return coordinates;
  }

  function positionDropdown(dropdown, targetEl) {
    const dialog = document.querySelector('.lc-modal-dialog');
    if (!dialog || !targetEl) return;
    const targetRect = targetEl.getBoundingClientRect();

    // Caret ("blinker") position inside the input, in viewport coordinates
    let caretX = targetRect.left;
    try {
      const caret = getCaretCoordinates(targetEl, targetEl.selectionStart || 0);
      caretX = targetRect.left + caret.left;
    } catch (err) {
      caretX = targetRect.left;
    }

    const maxW = Math.min(360, Math.max(240, targetRect.width));
    dropdown.style.maxWidth = `${maxW}px`;
    dropdown.style.minWidth = '220px';
    dropdown.style.width = 'max-content';

    // Vertical: right below the input line (i.e. below the caret), flip above when tight
    const estHeight = 210;
    let top;
    if (window.innerHeight - targetRect.bottom < estHeight && targetRect.top > estHeight) {
      top = targetRect.top - estHeight - 4;
    } else {
      top = targetRect.bottom + 4;
    }

    dropdown.style.display = 'flex';

    // Clamp horizontally so the dropdown never leaves the viewport
    const margin = 10;
    const width = dropdown.offsetWidth;
    let left = caretX;
    if (left + width > window.innerWidth - margin) {
      left = window.innerWidth - margin - width;
    }
    if (left < margin) left = margin;

    dropdown.style.left = `${left}px`;
    dropdown.style.top = `${top}px`;
  }

  function applyTagSelection(selectedTag) {
    const el = activeAutocomplete.inputEl;
    if (!el) return;
    const cleanTag = selectedTag.replace(/^[#＃]/, '').trim();
    if (!cleanTag) return;

    const val = el.value;
    const before = val.slice(0, activeAutocomplete.tokenStart);
    const after = val.slice(activeAutocomplete.tokenEnd);
    const insertion = `#${cleanTag} `;

    el.value = before + insertion + after;
    const nextCursor = before.length + insertion.length;
    el.selectionStart = nextCursor;
    el.selectionEnd = nextCursor;

    tagStore.add(cleanTag);
    el.dispatchEvent(new Event('input', { bubbles: true }));

    hideTagAutocomplete();
    el.focus();
  }

  function checkTagAutocomplete(el) {
    if (!el) return;
    const pos = el.selectionStart;
    const val = el.value;
    const textBefore = val.slice(0, pos);

    let match = textBefore.match(/(?:^|\s)([#＃][^\s#＃]*)$/);

    // In lc-input-tags specifically: also trigger if user typed a word without explicit #
    if (!match && el.id === 'lc-input-tags') {
      const tagMatch = textBefore.match(/(?:^|\s)([^\s#＃]+)$/);
      if (tagMatch) {
        match = tagMatch;
      }
    }

    if (match) {
      const token = match[1];
      const hasHash = token.startsWith('#') || token.startsWith('＃');
      const query = hasHash ? token.slice(1) : token;
      const tokenStart = pos - token.length;
      const tokenEnd = pos;

      activeAutocomplete.tokenStart = tokenStart;
      activeAutocomplete.tokenEnd = tokenEnd;

      const matches = getRankedTagMatches(query);
      renderTagDropdown(matches, query, el);
    } else {
      hideTagAutocomplete();
    }
  }

  function handleTagAutocompleteKeydown(e, el) {
    const dropdown = document.getElementById('lc-tag-dropdown');
    const isVisible = dropdown && dropdown.style.display !== 'none';

    if (!isVisible) return false;

    const totalSelectable = activeAutocomplete.items.length + (activeAutocomplete.query.length > 0 && !activeAutocomplete.hasExactMatch ? 1 : 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      if (totalSelectable > 0) {
        activeAutocomplete.highlightedIndex = (activeAutocomplete.highlightedIndex + 1) % totalSelectable;
        updateDropdownHighlight(dropdown);
      }
      return true;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      if (totalSelectable > 0) {
        activeAutocomplete.highlightedIndex = (activeAutocomplete.highlightedIndex - 1 + totalSelectable) % totalSelectable;
        updateDropdownHighlight(dropdown);
      }
      return true;
    }

    if (e.key === 'Enter' || e.key === 'Tab') {
      if (e.ctrlKey || e.metaKey) return false; // Let Ctrl+Enter save card

      e.preventDefault();
      e.stopPropagation();
      if (totalSelectable > 0) {
        let tagToSelect = '';
        if (activeAutocomplete.highlightedIndex < activeAutocomplete.items.length) {
          tagToSelect = activeAutocomplete.items[activeAutocomplete.highlightedIndex].tag;
        } else {
          tagToSelect = activeAutocomplete.query;
        }
        applyTagSelection(tagToSelect);
      }
      return true;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      hideTagAutocomplete();
      return true;
    }

    return false;
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
    editingMemoName = editData && editData.name ? editData.name : null;

    const titleText = document.getElementById('lc-modal-title-text');
    if (titleText) {
      titleText.innerText = editingMemoName ? 'Edit Language Card' : 'New Language Card';
    }
    const saveBtn = document.getElementById('lc-btn-save');
    if (saveBtn) saveBtn.innerText = editingMemoName ? 'Update Card' : 'Save Card';

    // Pre-fill from the card being edited, or reset for a fresh card
    const values = { tags: (editData && editData.tags) || '' };
    CONFIG.languages.forEach(l => { values[l.key] = (editData && editData[l.key]) || ''; });
    [...CONFIG.languages.map(l => l.key), 'tags'].forEach((key) => {
      const el = document.getElementById(`lc-input-${key}`);
      if (el) el.value = values[key];
    });

    // Modal's active languages: the edited card's own layout, else the global default
    modalActiveLangs = initialLangs && initialLangs.length
      ? CONFIG.languages.map(l => l.key).filter(k => initialLangs.includes(k))
      : [...getGlobalEnabledLangs()];
    updateModalEditorSlots();

    hideTagAutocomplete();
    tagStore.scanPage();
    tagStore.fetchServer();

    // Focus on the first visible language textarea
    const firstKey = modalActiveLangs.includes('en') ? 'en' : modalActiveLangs[0] || 'en';
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

  // --- Space Indicator & Info Popup ---
  let spaceResolutionInFlight = null;

  function setSpaceIndicatorState(state, text) {
    const btn = document.getElementById('lc-space-indicator');
    const textEl = document.getElementById('lc-space-indicator-text');
    if (!btn || !textEl) return;
    btn.classList.remove('lc-si-loading', 'lc-si-ok', 'lc-si-warn', 'lc-si-missing');
    btn.classList.add(`lc-si-${state}`);
    textEl.innerText = text;
    btn.title = `${text} — click for details`;
  }

  function updateSpaceHint(spaceName, spaceTitle) {
    const hint = document.getElementById('lc-space-hint');
    if (!hint) return;
    const label = spaceTitle || (spaceName ? stripSpacePrefix(spaceName) : '');
    hint.innerText = spaceName ? `Target Space: ${label}` : 'Target Space: Personal Space';
  }

  /** Resolve the dedicated space and paint the indicator (cached unless force) */
  async function refreshSpaceIndicator(force) {
    if (spaceResolutionInFlight) return spaceResolutionInFlight;
    spaceResolutionInFlight = (async () => {
      setSpaceIndicatorState('loading', '⏳ Checking spaces…');
      try {
        const result = await resolveTargetSpace({ force: Boolean(force) });
        if (result.space) {
          // Show the human-readable title; fall back to the bare uid
          setSpaceIndicatorState('ok', `🃏 ${result.title || stripSpacePrefix(result.space)}`);
        } else if (result.matches && result.matches.length > 1) {
          setSpaceIndicatorState('warn', `⚠️ ${result.matches.length} spaces with header`);
        } else if (result.matches) {
          setSpaceIndicatorState('missing', '⛔ No space with header');
        } else {
          setSpaceIndicatorState('missing', '⛔ Space check failed');
        }
        if (result.space) {
          updateSpaceHint(result.space, result.title);
        } else {
          updateSpaceHint(getCurrentSpace(), '');
        }
        return result;
      } catch (err) {
        console.warn('[LanguageCard] space resolution failed', err);
        setSpaceIndicatorState('missing', '⛔ Space check failed');
        return null;
      } finally {
        spaceResolutionInFlight = null;
      }
    })();
    return spaceResolutionInFlight;
  }

  function spaceHeaderCodeHtml() {
    return `<div class="lc-header-box">
      <code class="lc-header-json">${escapeHtml(getCardHeaderJson())}</code>
      <button type="button" class="lc-header-copy-btn" id="lc-space-info-copy-btn" title="Copy header JSON">📋</button>
    </div>`;
  }

  function showSpaceInfoPopup(result) {
    const overlay = document.getElementById('lc-space-info-overlay');
    const titleEl = document.getElementById('lc-space-info-title');
    const bodyEl = document.getElementById('lc-space-info-body');
    if (!overlay || !titleEl || !bodyEl) return;

    let title = 'Language Card Space';
    let bodyHtml = '';

    if (!result) {
      title = '⚠️ Space check failed';
      bodyHtml = `<p>The space list could not be read from the server. This usually means the access token expired — reload the page and click the indicator again.</p>`;
    } else if (result.space) {
      title = '🃏 Language card space';
      const displayTitle = result.title || stripSpacePrefix(result.space);
      bodyHtml = `
        <p>New cards are saved into this space:</p>
        <div class="lc-space-info-name">${escapeHtml(displayTitle)}</div>
        ${result.title ? `<div class="lc-space-info-uid">uid: ${escapeHtml(stripSpacePrefix(result.space))}</div>` : ''}
        <p>It is identified by this header in its description:</p>
        ${spaceHeaderCodeHtml()}`;
    } else if (result.matches && result.matches.length > 1) {
      title = `⚠️ ${result.matches.length} spaces carry the header`;
      bodyHtml = `
        <p><b>Only one space</b> may carry the language card header, so no target space is selected. Remove the header from the description of all but one space:</p>
        <ul class="lc-space-info-list">
          ${result.matches.map((s) => `<li><b>${escapeHtml(s.title || stripSpacePrefix(s.name))}</b><span class="lc-space-info-uid">${escapeHtml(stripSpacePrefix(s.name))}</span></li>`).join('')}
        </ul>
        <p>This is the header to look for:</p>
        ${spaceHeaderCodeHtml()}`;
    } else {
      title = '⛔ No language card space found';
      bodyHtml = `
        <p>No space carries the language card header yet, so new cards go to the current space (or your personal space).</p>
        <p>To choose the space that receives new cards:</p>
        <ol>
          <li>Open the space you want to use.</li>
          <li>Edit its description and paste this header into it:</li>
        </ol>
        ${spaceHeaderCodeHtml()}
        <p>Only one space should carry this header.</p>`;
    }

    titleEl.innerText = title;
    bodyEl.innerHTML = bodyHtml;

    const copyBtn = document.getElementById('lc-space-info-copy-btn');
    if (copyBtn) {
      copyBtn.onclick = (e) => {
        e.stopPropagation();
        copyText(getCardHeaderJson(), copyBtn);
      };
    }

    overlay.style.display = 'flex';
    const onKey = (ev) => {
      if (ev.key === 'Escape') {
        hideSpaceInfoPopup();
        document.removeEventListener('keydown', onKey, true);
      }
    };
    document.addEventListener('keydown', onKey, true);
  }

  function hideSpaceInfoPopup() {
    const overlay = document.getElementById('lc-space-info-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  /** Copy text with a clipboard API + execCommand fallback; flashes feedback on btn */
  async function copyText(text, btn) {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
      document.body.removeChild(ta);
    }
    if (btn) {
      const prev = btn.innerText;
      btn.innerText = ok ? '✅' : '❌';
      setTimeout(() => { btn.innerText = prev; }, 1200);
    }
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

  /**
   * Automatically acquire active Memos Bearer token from the page context:
   * 1. Reads Memos's native localStorage memos_access_token
   * 2. If expired or missing, performs silent refresh via Memos's session cookie
   */
  async function getMemosAuthToken(forceRefresh = false) {
    if (!forceRefresh) {
      try {
        const stored = localStorage.getItem('memos_access_token');
        const expiresStr = localStorage.getItem('memos_token_expires_at');
        if (stored) {
          if (expiresStr) {
            const exp = new Date(expiresStr);
            if (exp.getTime() - Date.now() > 30000) {
              return stored;
            }
          } else {
            return stored;
          }
        }
      } catch (e) {
        // ignore
      }
    }

    // Silent refresh: try every known endpoint across both API generations.
    // New builds (26.10+) serve /memos.api.* + /api/auth/refresh; memos 0.31
    // serves /memos.api.v1.* + /api/v1/auth/refresh. Unknown paths 404, so a
    // simple sequential try is enough.
    const refreshEndpoints = [
      { url: '/memos.api.AuthService/RefreshToken', connect: true },
      { url: '/memos.api.v1.AuthService/RefreshToken', connect: true },
      { url: '/api/auth/refresh', connect: false },
      { url: '/api/v1/auth/refresh', connect: false }
    ];
    for (const endpoint of refreshEndpoints) {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (endpoint.connect) headers['Connect-Protocol-Version'] = '1';
        const res = await fetch(endpoint.url, {
          method: 'POST',
          headers: headers,
          credentials: 'include',
          body: '{}'
        });
        if (!res.ok) continue;
        const data = await res.json();
        // New builds: accessToken/accessTokenExpireTime; 0.31: same JSON names.
        const token = data.accessToken || data.access_token;
        if (token) {
          try {
            localStorage.setItem('memos_access_token', token);
            const expires = data.accessTokenExpireTime || data.expiresAt || data.expires_at;
            if (expires) localStorage.setItem('memos_token_expires_at', expires);
          } catch (e) {}
          return token;
        }
      } catch (e) {
        // try the next endpoint
      }
    }

    // Optional PAT or custom token fallback if present
    try {
      const pat = localStorage.getItem('memos_pat') || 
                  localStorage.getItem('memos_token') ||
                  localStorage.getItem('memos_access_token');
      if (pat) return pat;
    } catch (e) {}

    return null;
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

    const isEdit = Boolean(editingMemoName);
    const payload = {
      content: content,
      visibility: 'PRIVATE'
    };
    let url = '/api/memos';
    let method = 'POST';
    // Edit mode PATCHes the existing memo; the path takes the bare id, not "memos/xxx"
    const bareId = isEdit ? (editingMemoName || '').replace(/^memos\//, '').trim() : '';
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
        refreshCardLocally(editingMemoName, content);
      }
      editingMemoName = null;
      closeModal();
      // No page reload needed: Memos updates the feed on its own.
    } catch (err) {
      showError('Failed to save card: ' + err.message);
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerText = editingMemoName ? 'Update Card' : 'Save Card';
    }
  }

  /** Re-parse a single card from fresh raw text (after an inline edit) */
  function refreshCardLocally(memoName, newRawText) {
    document.querySelectorAll('[data-lc-memo-name]').forEach((el) => {
      if (el.getAttribute('data-lc-memo-name') === memoName) {
        el.setAttribute('data-lc-raw', newRawText);
        el.removeAttribute('data-lc-parsed');
        el.setAttribute('data-lc-force', '1');
      }
    });
    renderLanguageCards();
  }

  // --- Part 3: Lifecycle & Observer ---
  let debounceTimer = null;
  const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      renderLanguageCards();
      injectCreatorUI();
    }, 120);
  });

  observer.observe(document.body, { childList: true, subtree: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      renderLanguageCards();
      injectCreatorUI();
    });
  } else {
    renderLanguageCards();
    injectCreatorUI();
  }
})();
