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
   * action.path walks menu levels (e.g. ['Copy', 'Copy Content'],
   * ['More', 'Delete']); the last entry is the item that gets clicked.
   * A configured menuItemSelector is tried first, with label/icon matching
   * as a fallback so a stale selector never leaves the menu open.
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
    let item = action.menuItemSelector
      ? currentMenu.querySelector(action.menuItemSelector)
      : null;
    // A stale / over-specific selector (e.g. a data-variant that no longer
    // exists) must not strand an open dropdown: always try label / icon too.
    if (!item) item = findMenuItem(currentMenu, leafLabel, action.iconName);
    if (!item) {
      console.warn('[LanguageCard] quick action "' + action.label + '": menu item not found');
      closeMenuForTrigger(trigger);
      return;
    }
    item.click();
  }

  /** Build one quick-action button driving the card's own dropdown menu. */
  function buildQuickActionButton(actionsEl, action, moreBtn) {
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
    return btn;
  }

  /**
   * Inject quick-action icon buttons into every memo header.
   *
   * Per memos/web MemoHeader.tsx the row is:
   *   <div flex justify-between>
   *     <div flex-1>                       <- far-left actions go FIRST in here
   *       <div data-slot="memo-header-meta">[creator]<time link>«11 hours ago»[space badge]</div>
   *     </div>
   *     <div data-slot="memo-header-actions">[reaction][visibility][more]</div>
   *   </div>
   *
   * Cluster actions sit left of the three-dots (marked once via
   * data-lc-quick-actions). Far-left actions (placement: 'far-left', e.g.
   * Delete) sit at the far left of the row, left of the timestamp — React may
   * wipe those siblings on re-render, so they are re-checked by class on every
   * pass and re-injected when missing.
   */
  function injectQuickActions() {
    const actions = CONFIG.quickActions || [];
    const clusterActions = actions.filter((a) => a.placement !== 'far-left');
    const farLeftActions = actions.filter((a) => a.placement === 'far-left');
    if (!clusterActions.length && !farLeftActions.length) return;

    document.querySelectorAll('article [data-slot="memo-header-actions"]').forEach((actionsEl) => {
      const moreBtn = findMoreTrigger(actionsEl);
      if (!moreBtn) return;

      // --- cluster: left of the three-dots; survives React re-renders ---
      if (clusterActions.length && !actionsEl.hasAttribute('data-lc-quick-actions')) {
        actionsEl.setAttribute('data-lc-quick-actions', '1');
        const fragment = document.createDocumentFragment();
        clusterActions.forEach((action) => {
          fragment.appendChild(buildQuickActionButton(actionsEl, action, moreBtn));
        });
        actionsEl.insertBefore(fragment, moreBtn);
      }

      // --- far left: left of the timestamp ("11 hours ago") ---
      if (farLeftActions.length) {
        const row = actionsEl.closest('article');
        const meta = row ? row.querySelector('[data-slot="memo-header-meta"]') : null;
        // The meta row's parent is the row's left group: its first child is the
        // leftmost slot, i.e. immediately left of the time display.
        const leftGroup = meta && meta.parentElement;
        const anchor = leftGroup || actionsEl;
        if (!anchor.querySelector('.lc-quick-action-far-left')) {
          farLeftActions.forEach((action) => {
            const btn = buildQuickActionButton(actionsEl, action, moreBtn);
            btn.classList.add('lc-quick-action-far-left');
            anchor.insertBefore(btn, anchor.firstChild);
          });
        }
      }
    });
  }

export { findMoreTrigger, findMenuForTrigger, waitForMenu, findMenuItem, closeMenuForTrigger, triggerNativeAction, injectQuickActions };
