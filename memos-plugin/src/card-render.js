import { CONFIG } from './config.js';
import { getGlobalEnabledLangs } from './state.js';
import { syncThemeClass, getCurrentSpace } from './utils.js';
import { parseCardMemo, cardLangValue, cardPresentLangs } from './card-model.js';
import { tagStore } from './tags.js';
import { openModal } from './editor.js';

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

      // Languages this card actually contains, in UI order. A card simply
      // shows what it has (a ja-only card shows only the ja slot) — there are
      // no per-card language pills anymore: every language section is already
      // labelled in its own slot header, and edits go through the pencil.
      // The global switch is only the fallback for cards without any language
      // content (e.g. a tags-only legacy card).
      const cardLangs = cardPresentLangs(data);
      const activeLangs = new Set(
        (cardLangs.length > 0 ? cardLangs : globalEnabled).filter(k =>
          CONFIG.languages.some(l => l.key === k)
        )
      );

      // 1. Header bar: card title + edit button (no language toggle pills)
      const noteBar = document.createElement('div');
      noteBar.className = 'lc-card-note-bar';

      const titleEl = document.createElement('div');
      titleEl.className = 'lc-card-note-title';
      titleEl.innerHTML = `<span>🔤</span><span>Card</span>`;
      noteBar.appendChild(titleEl);

      const noteControls = document.createElement('div');
      noteControls.className = 'lc-card-note-controls';

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
          openModal(editValues, Array.from(activeLangs));
        };
        noteControls.appendChild(editBtn);
      }

      noteBar.appendChild(noteControls);
      cardWrapper.appendChild(noteBar);

      // 2. Build Card Slots (JA -> EN -> ZH); only languages the card has are visible
      const grid = document.createElement('div');
      grid.className = 'lc-card-grid';
      grid.style.setProperty('--lc-cols', Math.max(1, activeLangs.size));

      CONFIG.languages.forEach((lang) => {
        const val = cardLangValue(data, lang.key);

        const slot = document.createElement('div');
        slot.className = 'lc-card-slot';
        slot.setAttribute('data-lc-slot', lang.key);
        slot.style.display = activeLangs.has(lang.key) ? 'flex' : 'none';

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

export { getMemoNameFromContainer, renderLanguageCards, refreshCardLocally };
