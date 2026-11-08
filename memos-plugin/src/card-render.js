import { CONFIG } from './config.js';
import { state, getGlobalEnabledLangs } from './state.js';
import { syncThemeClass, getCurrentSpace } from './utils.js';
import {
  parseAnyCard, cardLangValue, cardPresentLangs, valuesFor,
  sectionExplanationsFor, unifiedExplanationFor
} from './card-model.js';
import { typeForMemo, sectionKeys } from './card-types.js';
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

  /**
   * V3 card: sections and explanation layout come from the space definition.
   * Unknown keys are still shown (labelled by key) so a card is never silently
   * truncated while types are loading or until the user maps its names.
   */
  function renderV3Card(container, parsed, tags, memoName) {
    const baseType = typeForMemo(state.types, memoName, getCurrentSpace(), state.memoSpaceCache);
    const known = sectionKeys(baseType);
    const extras = Object.keys(parsed.values || {}).filter(k => !known.includes(k));
    const type = extras.length
      ? {
        ...baseType,
        sections: [
          ...baseType.sections,
          ...extras.map(k => ({
            key: k, label: k, code: String(k).slice(0, 4).toUpperCase(), color: '#94a3b8'
          }))
        ]
      }
      : baseType;
    const values = valuesFor(parsed, type);
    const explanations = sectionExplanationsFor(parsed, type);
    const unifiedExplanation = unifiedExplanationFor(parsed, type);
    const activeKeys = (parsed.enabledSections || []).filter(key => known.includes(key) || extras.includes(key));
    const valueKeys = type.sections.filter(s => values[s.key]).map(s => s.key);
    const visibleKeys = activeKeys.length
      ? activeKeys
      : (valueKeys.length ? valueKeys : type.sections.map(s => s.key));

    const wrapper = document.createElement('div');
    wrapper.className = 'lc-card-wrapper';

    const noteBar = document.createElement('div');
    noteBar.className = 'lc-card-note-bar';
    const controls = document.createElement('div');
    controls.className = 'lc-card-note-controls';
    if (memoName) {
      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'lc-btn-icon lc-card-edit-btn';
      editBtn.title = 'Edit this card';
      editBtn.innerText = '✏️';
      editBtn.onclick = (e) => {
        e.stopPropagation();
        openModal({
          name: memoName,
          tags: tags.join(' '),
          version: 3,
          type,
          values,
          explanations,
          unifiedExplanation,
          showExplanation: parsed.showExplanation
        }, visibleKeys);
      };
      controls.appendChild(editBtn);
    }
    noteBar.appendChild(controls);
    wrapper.appendChild(noteBar);

    const grid = document.createElement('div');
    grid.className = 'lc-card-grid';
    grid.style.setProperty('--lc-cols', Math.max(1, visibleKeys.length));
    type.sections.forEach((section) => {
      const slot = document.createElement('div');
      slot.className = 'lc-card-slot';
      slot.setAttribute('data-lc-slot', section.key);
      slot.style.display = visibleKeys.includes(section.key) ? 'flex' : 'none';

      const header = document.createElement('div');
      header.className = 'lc-card-header';
      const badge = document.createElement('span');
      badge.className = 'lc-card-badge';
      badge.style.color = section.color;
      badge.innerText = section.label;
      header.appendChild(badge);
      slot.appendChild(header);

      const val = values[section.key];
      const textEl = document.createElement('div');
      textEl.className = 'lc-card-text' + (val ? '' : ' lc-card-empty');
      textEl.innerText = val || '—';
      slot.appendChild(textEl);
      grid.appendChild(slot);
    });
    wrapper.appendChild(grid);

    // Per-language explanations mirror the visible language columns.
    if (parsed.showExplanation) {
      const boxes = document.createElement('div');
      boxes.className = 'lc-card-explanations';
      boxes.style.setProperty('--lc-cols', Math.max(1, visibleKeys.length));
      type.sections.forEach((section) => {
        const text = explanations[section.key];
        if (!text || !visibleKeys.includes(section.key)) return;
        const box = document.createElement('div');
        box.className = 'lc-card-explanation';
        box.setAttribute('data-lc-explanation', section.key);
        box.style.gridColumn = String(visibleKeys.indexOf(section.key) + 1);
        box.innerText = text;
        boxes.appendChild(box);
      });
      if (boxes.children.length) wrapper.appendChild(boxes);

      if (unifiedExplanation) {
        const box = document.createElement('div');
        box.className = 'lc-card-explanation lc-card-explanation-global';
        box.innerText = unifiedExplanation;
        wrapper.appendChild(box);
      }
    }

    if (tags.length > 0) {
      const tagsContainer = document.createElement('div');
      tagsContainer.className = 'lc-card-tags';
      tags.forEach((tag) => {
        const chip = document.createElement('span');
        chip.className = 'lc-tag-chip';
        chip.innerText = tag;
        tagsContainer.appendChild(chip);
      });
      wrapper.appendChild(tagsContainer);
    }

    container.innerHTML = '';
    container.appendChild(wrapper);
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
      const parsed = parseAnyCard(rawText, currentSpace);
      if (!parsed) return;

      container.setAttribute('data-lc-parsed', 'true');
      const { data, tags } = parsed;
      if (tags && tags.length > 0) {
        tags.forEach(t => tagStore.add(t));
      }
      const memoName = getMemoNameFromContainer(container);
      if (memoName) container.setAttribute('data-lc-memo-name', memoName);
      if (parsed.version === 3) {
        renderV3Card(container, parsed, tags, memoName);
        return;
      }

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

      // 1. Header bar: edit button only (R5.2: no duplicate 🔤 Card heading)
      const noteBar = document.createElement('div');
      noteBar.className = 'lc-card-note-bar';

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
          const editValues = { name: memoName, tags: tags.join(' '), version: 2 };
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

  /** Force a re-render after card types / memo→space mapping finishes loading. */
  function forceRerenderCards() {
    document.querySelectorAll('[data-lc-parsed]').forEach((el) => {
      el.setAttribute('data-lc-force', '1');
    });
    renderLanguageCards();
  }

export { getMemoNameFromContainer, renderLanguageCards, refreshCardLocally, forceRerenderCards };
