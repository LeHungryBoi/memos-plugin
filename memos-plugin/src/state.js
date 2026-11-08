import { CONFIG, LS_GLOBAL_LANGS_KEY } from './config.js';
import { renderLanguageCards } from './card-render.js';
import { updateFloatingBar } from './editor.js';

/**
 * Mutable session state shared by the modules. Kept on one object so a
 * module never holds a stale copy of another module's variable.
 */
export const state = {
  modalActiveLangs: ['en', 'zh'],
  editingMemoName: null,
  spaceResolutionInFlight: null
};

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

    // Re-render cards so the few content-less legacy cards pick up the new
    // global default (cards with content always show their own languages)
    document.querySelectorAll('[data-lc-parsed]').forEach(el => {
      el.removeAttribute('data-lc-parsed');
      el.setAttribute('data-lc-force', '1');
    });
    renderLanguageCards();
    updateFloatingBar();
  }

export { getGlobalEnabledLangs, setGlobalEnabledLangs, toggleGlobalLang };
