import { CONFIG } from './config.js';

  // ============================================================================
  // Part 3: Native Quick Actions (Pin / Edit / Archive ...)
  // ----------------------------------------------------------------------------
  // Memos keeps these actions inside the card header's three-dots dropdown.
  // This part surfaces the most used ones as single-click icon buttons placed
  // directly in the native header (left of the three-dots). A click drives
  // Memos' own dropdown menu programmatically and clicks the matching item,
  // so every native behavior (API calls, pin state, editor wiring) is reused
  // as-is — nothing is reimplemented, nothing can desync.
  // ============================================================================

  const QUICK_ACTION_TIMEOUT_MS = 1200;

  /** Find the three-dots "More" trigger inside a memo header actions area */
  function findMoreTrigger(actionsEl) {
    if (!actionsEl) return null;
    return actionsEl.querySelector(
      'button[aria-label="More"], button[data-slot="dropdown-menu-trigger"]'
    );
  }

  /** The dropdown menu portal belonging to a given trigger (null when closed) */
  function findMenuForTrigger(triggerEl) {
    const menus = [...document.querySelectorAll('[role="menu"]')];
    if (triggerEl && triggerEl.id) {
      return menus.find((m) => m.getAttribute('aria-labelledby') === triggerEl.id) || null;
    }
    // Trigger without id: fall back to the most recently opened menu
    return menus.length ? menus[menus.length - 1] : null;
  }

  /** Resolve once the menu portal for triggerEl is mounted (or on timeout) */
  function waitForMenu(triggerEl, timeoutMs) {
    return new Promise((resolve) => {
      const started = Date.now();
      const tick = () => {
        const menu = findMenuForTrigger(triggerEl);
        if (menu) {
          resolve(menu);
          return;
        }
        if (Date.now() - started > timeoutMs) {
          resolve(null);
          return;
        }
        setTimeout(tick, 16);
      };
      tick();
    });
  }

  /**
   * Find a menu item by label: exact match first, then a case-insensitive
   * "contains" match (covers state-dependent labels like Pin / Unpin), then
   * the lucide icon class (survives label localization).
   */
  function findMenuItem(menu, label, iconName) {
    if (!menu) return null;
    const items = [...menu.querySelectorAll('[role="menuitem"]')];
    const textOf = (el) => (el.innerText || '').trim();
    const lowerLabel = String(label).toLowerCase();
    let item = items.find((el) => textOf(el) === label);
    if (!item) item = items.find((el) => textOf(el).toLowerCase().includes(lowerLabel));
    if (!item && iconName) {
      try {
        item = items.find((el) => el.querySelector('svg.' + iconName));
      } catch (e) {
        // invalid selector fallback: ignore
      }
    }
    return item || null;
  }

  /** Close the dropdown owned by triggerEl (leaves the rest of the UI alone) */
  function closeMenuForTrigger(triggerEl) {
    if (triggerEl && findMenuForTrigger(triggerEl)) triggerEl.click();
  }

  /**
   * Run a native memo action by driving the card's own dropdown menu.
   * action.path walks menu levels (e.g. ['Copy', 'Copy Content']); the last
   * entry is the item that gets clicked. Fails quietly (menu closed again)
   * when Memos' menu structure is not recognized.
   */
  async function triggerNativeAction(actionsEl, action) {
    const trigger = findMoreTrigger(actionsEl);
    if (!trigger) return;

    let menu = findMenuForTrigger(trigger);
    if (!menu) {
      trigger.click();
      menu = await waitForMenu(trigger, QUICK_ACTION_TIMEOUT_MS);
      // A racing outside-click may have closed it right as we opened it
      if (!menu) {
        trigger.click();
        menu = await waitForMenu(trigger, QUICK_ACTION_TIMEOUT_MS);
      }
    }
    if (!menu) {
      console.warn('[LanguageCard] quick action "' + action.label + '": dropdown menu did not open');
      return;
    }

    // Walk submenu levels: every path entry except the last is a sub-trigger
    let currentMenu = menu;
    for (let i = 0; i < action.path.length - 1; i++) {
      const subTrigger = findMenuItem(currentMenu, action.path[i]);
      if (!subTrigger) {
        closeMenuForTrigger(trigger);
        return;
      }
      subTrigger.dispatchEvent(new MouseEvent('pointermove', { bubbles: true }));
      subTrigger.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      subTrigger.click();
      const subMenu = await waitForMenu(subTrigger, QUICK_ACTION_TIMEOUT_MS);
      if (!subMenu) {
        closeMenuForTrigger(trigger);
        return;
      }
      currentMenu = subMenu;
    }

    const leafLabel = action.path[action.path.length - 1];
    const item = findMenuItem(currentMenu, leafLabel, action.iconName);
    if (!item) {
      console.warn('[LanguageCard] quick action "' + action.label + '": menu item not found');
      closeMenuForTrigger(trigger);
      return;
    }
    item.click();
  }

  /**
   * Inject quick-action icon buttons into every memo header actions area.
   * Idempotent: the actions container is marked once injected, so Memos
   * re-rendering the card simply drops the old buttons with the old DOM and
   * the observer re-injects fresh ones.
   */
  function injectQuickActions() {
    if (!CONFIG.quickActions || CONFIG.quickActions.length === 0) return;
    document.querySelectorAll('article [data-slot="memo-header-actions"]').forEach((actionsEl) => {
      if (actionsEl.hasAttribute('data-lc-quick-actions')) return;
      const moreBtn = findMoreTrigger(actionsEl);
      if (!moreBtn) return;
      actionsEl.setAttribute('data-lc-quick-actions', '1');

      const fragment = document.createDocumentFragment();
      CONFIG.quickActions.forEach((action) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        // Reuse the native More button's utility classes so the look matches exactly
        btn.className = (moreBtn.className ? moreBtn.className + ' ' : '') + 'lc-quick-action';
        btn.setAttribute('aria-label', action.label);
        btn.title = action.label;
        btn.innerHTML = action.icon;
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          triggerNativeAction(actionsEl, action);
        });
        fragment.appendChild(btn);
      });
      // Insert left of the three-dots button; React inserts its own children
      // relative to its tracked nodes, so extra siblings here survive re-renders
      actionsEl.insertBefore(fragment, moreBtn);
    });
  }

export { findMoreTrigger, findMenuForTrigger, waitForMenu, findMenuItem, closeMenuForTrigger, triggerNativeAction, injectQuickActions };
