import { LS_GLOBAL_LANGS_KEY } from './config.js';

/**
 * Mutable session state shared by the modules. Kept on one object so a
 * module never holds a stale copy of another module's variable.
 *
 * V3 additions: all discovered card types, the type used by the editor,
 * and a memoName -> space cache for mixed feeds (see schema/v3.md).
 */
export const state = {
  modalActiveLangs: ['en', 'zh'],
  editingMemoName: null,
  spaceResolutionInFlight: null,
  types: [],
  allSpaces: [],
  activeType: null,
  memoSpaceCache: new Map(),
  memoSpaceWarmed: false,
  editingVersion: 2,
  editingType: null,
  explanationEnabled: true
};

  // --- Global Language State (read-only V2 compatibility) ---
  // The homepage pills were removed in V3 (R5.1); this is still used as the
  // fallback for content-less legacy V2 cards.
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

export { getGlobalEnabledLangs };
