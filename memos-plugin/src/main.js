import cssText from './styles/language-card.css';
import { renderLanguageCards } from './card-render.js';
import { injectCreatorUI } from './editor.js';
import { injectQuickActions } from './quick-actions.js';

/** The single-file build inlines the stylesheet; the CSS-only build leaves it out. */
function injectStyles(css) {
  if (!css || typeof document === 'undefined' || document.getElementById('lc-injected-style')) return;
  const style = document.createElement('style');
  style.id = 'lc-injected-style';
  style.textContent = css;
  (document.head || document.body).appendChild(style);
}

injectStyles(cssText);

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
