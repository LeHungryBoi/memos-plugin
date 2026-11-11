// Build-time manifest: build.mjs resolves this to one concatenated stylesheet.
import cssText from './styles/index.css';
import { renderLanguageCards, forceRerenderCards } from './card-render.js';
import { injectCreatorUI } from './editor.js';
import { injectQuickActions } from './quick-actions.js';
import { getCardTypes, warmMemoSpaceCache } from './spaces.js';
import { state } from './state.js';

/** The single-file build inlines the stylesheet; the CSS-only build leaves it out. */
function injectStyles(css) {
  if (!css || typeof document === 'undefined' || document.getElementById('lc-injected-style')) return;
  const style = document.createElement('style');
  style.id = 'lc-injected-style';
  style.textContent = css;
  (document.head || document.body).appendChild(style);
}

injectStyles(cssText);
state.onCardTypesChanged = forceRerenderCards;

  // V3: card types live in space descriptions and load asynchronously. Once
  // they (and the memo -> space map) are ready, repaint already-rendered cards
  // so mixed feeds use the right sections instead of the placeholder type.
  getCardTypes()
    .then(() => warmMemoSpaceCache())
    .then(() => forceRerenderCards())
    .catch(() => { /* V2 fallback rendering stays in place */ });

  // --- Part 4: Lifecycle & Observer ---
  let debounceTimer = null;
  const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      renderLanguageCards();
      injectCreatorUI();
      injectQuickActions();
    }, 120);
  });

  observer.observe(document.body, { childList: true, subtree: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      renderLanguageCards();
      injectCreatorUI();
      injectQuickActions();
    });
  } else {
    renderLanguageCards();
    injectCreatorUI();
    injectQuickActions();
  }
