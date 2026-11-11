import { state } from './state.js';
import { getMemosAuthToken, fetchAllSpaces, listMemosForSpace } from './api.js';
import { stripSpacePrefix, getCurrentSpace } from './utils.js';
import {
  extractMarker, normalizeType, sortTypes, activeTypeForNew, typeForSpace
} from './card-types.js';

  // --- V3: every marked space defines one card type ---
  // V2 marker {"_t":"lc","v":2} is still accepted as the "default type".
  // The cache key is kept for backwards compatibility with existing installs.
  const LS_TARGET_SPACE_KEY = 'memos_lc_target_space_v2';

  /** Marker parser; kept export-compatible with the V2 contract vectors. */
  function parseSpaceHeader(description) {
    return extractMarker(description);
  }

  /** All spaces carrying a language card marker. */
  async function findDedicatedSpaces() {
    const token = await getMemosAuthToken();
    const spaces = await fetchAllSpaces(token);
    return spaces
      .filter(space => parseSpaceHeader(space.description))
      .sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }

  function readCachedTargetSpace() {
    try {
      const raw = localStorage.getItem(LS_TARGET_SPACE_KEY);
      if (!raw) return null;
      if (raw.startsWith('{')) {
        const parsed = JSON.parse(raw);
        return parsed && parsed.name
          ? { name: parsed.name, title: parsed.title || '', manual: parsed.manual === true }
          : null;
      }
      return { name: raw, title: '', manual: false }; // legacy bare resource name
    } catch (e) {
      return null;
    }
  }

  function writeCachedTargetSpace(name, title, manual = false) {
    try {
      localStorage.setItem(LS_TARGET_SPACE_KEY, JSON.stringify({
        name: name, title: title || '', manual: Boolean(manual)
      }));
    } catch (e) { /* ignore */ }
  }

  function clearTargetSpaceCache() {
    try { localStorage.removeItem(LS_TARGET_SPACE_KEY); } catch (e) { /* ignore */ }
  }

  /** All spaces the user belongs to (management panel needs unmarked ones too). */
  async function getAllSpaces(force) {
    if (!force && state.allSpaces.length) return state.allSpaces;
    const token = await getMemosAuthToken();
    const spaces = await fetchAllSpaces(token);
    state.allSpaces = spaces;
    return spaces;
  }

  /** Normalized, ordered card types; V2 markers become the default type. */
  async function getCardTypes(options) {
    const force = Boolean(options && options.force);
    if (!force && state.types.length) {
      if (!state.activeTypeManuallySelected) {
        state.activeType = typeForSpace(state.types, getCurrentSpace())
          || sortTypes(state.types)[0]
          || activeTypeForNew(state.types, getCurrentSpace());
      }
      return state.types;
    }
    const spaces = await getAllSpaces(force);
    const types = sortTypes(spaces.map(space => {
      const marker = extractMarker(space.description);
      return marker ? normalizeType(marker, space) : null;
    }).filter(Boolean));
    state.types = types;

    // Keep an explicit selection; otherwise use the current Space before
    // falling back to the first ordered type.
    const cached = readCachedTargetSpace();
    const cachedType = cached && typeForSpace(types, cached.name);
    state.activeTypeManuallySelected = Boolean(cached && cached.manual);
    if (state.activeTypeManuallySelected && cachedType) {
      state.activeType = cachedType;
    } else {
      state.activeTypeManuallySelected = false;
      state.activeType = typeForSpace(types, getCurrentSpace())
        || sortTypes(types)[0]
        || activeTypeForNew(types, getCurrentSpace());
    }
    return types;
  }

  /** Choose the type used for new cards and remember its space. */
  function setActiveType(typeId, manualSelection = true) {
    const type = state.types.find(t => t.id === typeId);
    if (!type) return null;
    state.activeType = type;
    state.activeTypeManuallySelected = manualSelection;
    if (type.spaceName) writeCachedTargetSpace(type.spaceName, type.spaceTitle, manualSelection);
    return type;
  }

  function refreshQuickSpaceSelector() {
    const text = document.getElementById('lc-space-select-text');
    const options = document.getElementById('lc-space-select-options');
    if (!text || !options) return;
    const active = state.activeType || sortTypes(state.types)[0];
    text.innerText = active ? (active.spaceTitle || active.name) : 'No card spaces';
    options.innerHTML = '';

    state.types.forEach(type => {
      const option = document.createElement('button');
      option.type = 'button';
      option.className = `lc-space-select-option${active && active.id === type.id ? ' active' : ''}`;
      option.setAttribute('data-type-id', type.id);
      option.innerText = type.spaceTitle || type.name;
      option.title = type.spaceName || type.name;
      option.onclick = (event) => {
        event.stopPropagation();
        const selected = setActiveType(type.id);
        if (!selected) return;
        const panel = document.getElementById('lc-space-select-panel');
        const trigger = document.getElementById('lc-space-select-btn');
        if (panel) panel.hidden = true;
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
        refreshQuickSpaceSelector();
        if (typeof state.onQuickTypeSelected === 'function') {
          state.onQuickTypeSelected(selected);
        }
      };
      options.appendChild(option);
    });
  }

  function swipeQuickSpaceSelector(delta) {
    const types = sortTypes(state.types);
    if (types.length < 2) return null;
    const currentIndex = types.findIndex(type => state.activeType && type.id === state.activeType.id);
    const startIndex = currentIndex < 0 ? 0 : currentIndex;
    const nextIndex = (startIndex + delta + types.length) % types.length;
    const selected = setActiveType(types[nextIndex].id);
    refreshQuickSpaceSelector();
    if (selected && typeof state.onQuickTypeSelected === 'function') {
      state.onQuickTypeSelected(selected);
    }
    return selected;
  }

  /**
   * Resolve the target space. Multiple types are normal in V3 (the old
   * "only one space may carry the header" rule is gone). The returned shape
   * stays compatible with the V2 save path.
   */
  async function resolveTargetSpace(options) {
    const force = Boolean(options && options.force);
    if (!force) {
      const cached = readCachedTargetSpace();
      if (cached && cached.manual && typeForSpace(state.types, cached.name)) {
        return {
          space: cached.name, title: cached.title, matches: state.types,
          fromCache: true, type: typeForSpace(state.types, cached.name) || state.activeType
        };
      }
    }
    const types = await getCardTypes({ force });
    const active = state.activeType || typeForSpace(types, getCurrentSpace()) || activeTypeForNew(types, getCurrentSpace());
    if (active && active.spaceName) {
      writeCachedTargetSpace(active.spaceName, active.spaceTitle, state.activeTypeManuallySelected);
      return {
        space: active.spaceName, title: active.spaceTitle,
        matches: types, fromCache: false, type: active
      };
    }
    clearTargetSpaceCache();
    return { space: null, title: '', matches: types, fromCache: false, type: active };
  }

  // --- Space / type indicator (the separate button opens management) ---

  function setSpaceIndicatorState(stateName, text) {
    const btn = document.getElementById('lc-space-indicator');
    const textEl = document.getElementById('lc-space-indicator-text');
    if (!btn || !textEl) return;
    btn.classList.remove('lc-si-loading', 'lc-si-ok', 'lc-si-warn', 'lc-si-missing');
    btn.classList.add(`lc-si-${stateName}`);
    textEl.innerText = '⚙ Manage';
    btn.title = `${text} — manage card types and spaces`;
  }

  function updateSpaceHint(spaceName, spaceTitle) {
    const hint = document.getElementById('lc-space-hint');
    if (!hint) return;
    const label = spaceTitle || (spaceName ? stripSpacePrefix(spaceName) : '');
    hint.innerText = state.activeType
      ? `Type: ${state.activeType.name}` + (spaceName ? ` · ${label}` : '')
      : (spaceName ? `Target Space: ${label}` : 'Target Space: Personal Space');
  }

  async function refreshSpaceIndicator(force) {
    if (state.spaceResolutionInFlight) return state.spaceResolutionInFlight;
    state.spaceResolutionInFlight = (async () => {
      setSpaceIndicatorState('loading', '⏳ Checking card types…');
      try {
        const result = await resolveTargetSpace({ force: Boolean(force) });
        const count = state.types.length;
        if (count > 0) {
          const suffix = count > 1 ? ` · ${count} types` : '';
          setSpaceIndicatorState('ok', `🃏 ${state.activeType ? state.activeType.name : 'Card types'}${suffix}`);
        } else if (result.space) {
          setSpaceIndicatorState('ok', `🃏 ${result.title || stripSpacePrefix(result.space)}`);
        } else {
          setSpaceIndicatorState('missing', '⛔ No card types yet');
        }
        updateSpaceHint(result.space, result.title);
        refreshQuickSpaceSelector();
        return result;
      } catch (err) {
        console.warn('[LanguageCard] card type resolution failed', err);
        setSpaceIndicatorState('missing', '⛔ Card type check failed');
        return null;
      } finally {
        state.spaceResolutionInFlight = null;
      }
    })();
    return state.spaceResolutionInFlight;
  }

  function hideSpaceInfoPopup() {
    const overlay = document.getElementById('lc-space-info-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  /**
   * Mixed feeds contain memos from several spaces. Build memoName -> space
   * once so renderV3Card() can pick the right type per memo. Failures are
   * silent: rendering falls back to the current URL space / default type.
   */
  async function warmMemoSpaceCache() {
    if (state.memoSpaceWarmed) return;
    state.memoSpaceWarmed = true;
    const token = await getMemosAuthToken();
    await Promise.all(state.types.map(async (type) => {
      if (!type.spaceName) return;
      try {
        const memos = await listMemosForSpace(type.spaceName, token);
        memos.forEach(memo => {
          if (memo && memo.name) state.memoSpaceCache.set(memo.name, type.spaceName);
        });
      } catch (e) {
        // No permission or old API: keep the URL-based fallback.
      }
    }));
  }

export {
  parseSpaceHeader, findDedicatedSpaces, readCachedTargetSpace,
  writeCachedTargetSpace, resolveTargetSpace, clearTargetSpaceCache,
  getAllSpaces, getCardTypes, setActiveType, warmMemoSpaceCache,
  setSpaceIndicatorState, updateSpaceHint, refreshSpaceIndicator,
  hideSpaceInfoPopup, refreshQuickSpaceSelector, swipeQuickSpaceSelector
};
