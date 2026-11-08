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
      // The URL may have changed since the cache was filled: keep "In use"
      // in sync with the current space unless a target was explicitly selected.
      const urlType = typeForSpace(state.types, getCurrentSpace());
      if (urlType && !state.activeTypeManuallySelected) state.activeType = urlType;
      return state.types;
    }
    const spaces = await getAllSpaces(force);
    const types = sortTypes(spaces.map(space => {
      const marker = extractMarker(space.description);
      return marker ? normalizeType(marker, space) : null;
    }).filter(Boolean));
    state.types = types;

    // The URL type is the default unless the user explicitly picked a target
    // for new cards from the manager.
    const urlType = typeForSpace(types, getCurrentSpace());
    const cached = readCachedTargetSpace();
    const cachedType = cached && typeForSpace(types, cached.name);
    state.activeTypeManuallySelected = Boolean(cached && cached.manual);
    if (state.activeTypeManuallySelected && cachedType) {
      state.activeType = cachedType;
    } else if (urlType) {
      state.activeTypeManuallySelected = false;
      state.activeType = urlType;
    } else if (cachedType) {
      state.activeTypeManuallySelected = false;
      state.activeType = cachedType;
    } else if (!state.activeType || !types.some(t => t.id === state.activeType.id)) {
      state.activeTypeManuallySelected = false;
      state.activeType = activeTypeForNew(types, getCurrentSpace());
    }
    return types;
  }

  /** Choose the type used for new cards and remember its space. */
  function setActiveType(typeId) {
    const type = state.types.find(t => t.id === typeId);
    if (!type) return null;
    state.activeType = type;
    state.activeTypeManuallySelected = true;
    if (type.spaceName) writeCachedTargetSpace(type.spaceName, type.spaceTitle, true);
    return type;
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
      if (cached) {
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

  // --- Space / type indicator (the green element is now the manager entry) ---

  function setSpaceIndicatorState(stateName, text) {
    const btn = document.getElementById('lc-space-indicator');
    const textEl = document.getElementById('lc-space-indicator-text');
    if (!btn || !textEl) return;
    btn.classList.remove('lc-si-loading', 'lc-si-ok', 'lc-si-warn', 'lc-si-missing');
    btn.classList.add(`lc-si-${stateName}`);
    textEl.innerText = text;
    btn.title = `${text} — click to manage card types`;
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
  hideSpaceInfoPopup
};
