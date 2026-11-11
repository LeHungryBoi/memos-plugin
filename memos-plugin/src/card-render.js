import { CONFIG } from './config.js';
import { state, getGlobalEnabledLangs } from './state.js';
import { syncThemeClass, getCurrentSpace } from './utils.js';
import {
  parseAnyCard, parseCardV3, buildV3Migration,
  cardLangValue, cardPresentLangs, valuesFor,
  sectionExplanationsFor, unifiedExplanationFor
} from './card-model.js';
import { typeForMemo, sectionKeys } from './card-types.js';
import { tagStore } from './tags.js';
import { openModal } from './editor.js';
import { getMemosAuthToken, patchMemoContent } from './api.js';

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
  function renderV3Card(container, parsed, tags, memoName, typeOverride, showControls = true) {
    const baseType = typeOverride
      || typeForMemo(state.types, memoName, getCurrentSpace(), state.memoSpaceCache);
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
    if (memoName && showControls) {
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
          showExplanation: parsed.showExplanation,
          hiddenExplanationSections: parsed.hiddenExplanationSections
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

    // Per-language explanations mirror visible language columns; _x is legacy.
    const boxes = document.createElement('div');
    boxes.className = 'lc-card-explanations';
    boxes.style.setProperty('--lc-cols', Math.max(1, visibleKeys.length));
    type.sections.forEach((section) => {
      const text = explanations[section.key];
      if (!text || !visibleKeys.includes(section.key)
        || (parsed.hiddenExplanationSections || []).includes(section.key)) return;
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

  function renderV2Card(container, parsed, activeLangs, memoName, showControls = true) {
    const { data, tags } = parsed;
    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'lc-card-wrapper';

    const noteBar = document.createElement('div');
    noteBar.className = 'lc-card-note-bar';
    const controls = document.createElement('div');
    controls.className = 'lc-card-note-controls';
    if (memoName && showControls) {
      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'lc-btn-icon lc-card-edit-btn';
      editBtn.title = 'Edit this card';
      editBtn.setAttribute('aria-label', 'Edit this card');
      editBtn.innerText = '✏️';
      editBtn.onclick = (event) => {
        event.stopPropagation();
        const editValues = { name: memoName, tags: tags.join(' '), version: 2 };
        CONFIG.languages.forEach(language => {
          editValues[language.key] = cardLangValue(data, language.key);
        });
        openModal(editValues, Array.from(activeLangs));
      };
      controls.appendChild(editBtn);

      const migrateBtn = document.createElement('button');
      migrateBtn.type = 'button';
      migrateBtn.className = 'lc-btn-icon lc-card-migrate-btn';
      migrateBtn.title = 'Migrate this V2 card to V3';
      migrateBtn.setAttribute('aria-label', 'Migrate this V2 card to V3');
      migrateBtn.innerText = '⬆️';
      migrateBtn.onclick = (event) => {
        event.stopPropagation();
        const type = typeForMemo(state.types, memoName, getCurrentSpace(), state.memoSpaceCache);
        openMigrationPreview({ memoName, parsed, activeLangs, type });
      };
      controls.appendChild(migrateBtn);
    }
    noteBar.appendChild(controls);
    cardWrapper.appendChild(noteBar);

    const grid = document.createElement('div');
    grid.className = 'lc-card-grid';
    grid.style.setProperty('--lc-cols', Math.max(1, activeLangs.size));
    CONFIG.languages.forEach(language => {
      const slot = document.createElement('div');
      slot.className = 'lc-card-slot';
      slot.setAttribute('data-lc-slot', language.key);
      slot.style.display = activeLangs.has(language.key) ? 'flex' : 'none';

      const header = document.createElement('div');
      header.className = 'lc-card-header';
      const badge = document.createElement('span');
      badge.className = 'lc-card-badge';
      badge.style.color = language.color;
      badge.innerText = language.label;
      header.appendChild(badge);
      slot.appendChild(header);

      const value = cardLangValue(data, language.key);
      const text = document.createElement('div');
      text.className = 'lc-card-text' + (value ? '' : ' lc-card-empty');
      text.innerText = value || '—';
      slot.appendChild(text);
      grid.appendChild(slot);
    });
    cardWrapper.appendChild(grid);

    if (tags.length) {
      const tagsContainer = document.createElement('div');
      tagsContainer.className = 'lc-card-tags';
      tags.forEach(tag => {
        const chip = document.createElement('span');
        chip.className = 'lc-tag-chip';
        chip.innerText = tag;
        tagsContainer.appendChild(chip);
      });
      cardWrapper.appendChild(tagsContainer);
    }
    container.innerHTML = '';
    container.appendChild(cardWrapper);
  }

  function closeMigrationPreview(overlay) {
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }

  function openMigrationPreview({ memoName, parsed, activeLangs, type }) {
    const migration = buildV3Migration(parsed, type);
    const migratedParsed = parseCardV3(migration.content);
    if (!migratedParsed) throw new Error('Could not parse the generated V3 preview.');

    const overlay = document.createElement('div');
    overlay.className = 'lc-modal-overlay lc-migration-preview-overlay';
    overlay.id = 'lc-migration-preview-overlay';
    overlay.innerHTML = `
      <div class="lc-modal-dialog lc-v2-migration-dialog" role="dialog" aria-modal="true" aria-labelledby="lc-migration-preview-title">
        <div class="lc-modal-header lc-v2-migration-header">
          <h3 class="lc-modal-title" id="lc-migration-preview-title">Migrate V2 card to V3?</h3>
          <button type="button" class="lc-modal-close lc-v2-migration-close" id="lc-migration-preview-close" aria-label="Close">&times;</button>
        </div>
        <div class="lc-modal-body lc-v2-migration-body">
          <p class="lc-migration-preview-notice">Review the rendered card before confirming. Only this note will be migrated.</p>
          <div class="lc-migration-preview-columns">
            <section class="lc-migration-preview-column">
              <h4>Current · V2</h4>
              <div id="lc-migration-preview-v2"></div>
              <h5>Raw note content</h5>
              <pre class="lc-migration-raw-content" id="lc-migration-raw-v2"></pre>
            </section>
            <section class="lc-migration-preview-column">
              <h4>After migration · V3</h4>
              <div id="lc-migration-preview-v3"></div>
              <h5>Raw note content</h5>
              <pre class="lc-migration-raw-content" id="lc-migration-raw-v3"></pre>
            </section>
          </div>
          <div id="lc-migration-preview-error" class="lc-migration-preview-error" role="status"></div>
        </div>
        <div class="lc-modal-footer lc-v2-migration-footer">
          <button type="button" class="lc-btn lc-btn-secondary" id="lc-migration-preview-cancel">Cancel</button>
          <button type="button" class="lc-btn lc-btn-primary" id="lc-migration-preview-confirm">Migrate to V3</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    const v2Preview = document.getElementById('lc-migration-preview-v2');
    const v3Preview = document.getElementById('lc-migration-preview-v3');
    if (v2Preview) renderV2Card(v2Preview, parsed, activeLangs, null, false);
    if (v3Preview) renderV3Card(v3Preview, migratedParsed, migratedParsed.tags, null, migration.type, false);
    const rawV2 = document.getElementById('lc-migration-raw-v2');
    const rawV3 = document.getElementById('lc-migration-raw-v3');
    if (rawV2) rawV2.textContent = parsed.rawText;
    if (rawV3) rawV3.textContent = migration.content;

    const close = () => closeMigrationPreview(overlay);
    overlay.onclick = event => {
      if (event.target === overlay) close();
    };
    document.getElementById('lc-migration-preview-close').onclick = close;
    document.getElementById('lc-migration-preview-cancel').onclick = close;
    document.getElementById('lc-migration-preview-confirm').onclick = async event => {
      const button = event.currentTarget;
      const error = document.getElementById('lc-migration-preview-error');
      button.disabled = true;
      button.innerText = 'Migrating…';
      if (error) error.innerText = '';
      try {
        const token = await getMemosAuthToken();
        if (!token) throw new Error('Could not obtain a Memos access token.');
        const response = await patchMemoContent(memoName, migration.content, token);
        if (!response || !response.ok) {
          throw new Error(`Migration failed: HTTP ${response ? response.status : 'no response'}.`);
        }
        refreshCardLocally(memoName, migration.content);
        close();
      } catch (cause) {
        if (error) error.innerText = cause instanceof Error ? cause.message : String(cause);
        button.disabled = false;
        button.innerText = 'Migrate to V3';
      }
    };
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

      const cardLangs = cardPresentLangs(data);
      const activeLangs = new Set(
        (cardLangs.length > 0 ? cardLangs : globalEnabled).filter(k =>
          CONFIG.languages.some(l => l.key === k)
        )
      );
      renderV2Card(container, parsed, activeLangs, memoName);
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
