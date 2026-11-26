import { CONFIG } from './config.js';
import { state } from './state.js';
import { getCurrentSpace } from './utils.js';
import { parseAnyCard } from './card-model.js';
import { defaultType, typeForMemo } from './card-types.js';
import {
  mergeSectionValues, findDuplicateMatches, findCardDuplicatePairs
} from './duplicates.js';

let mergeEditorHandler = null;
let visiblePairs = [];
let visiblePairsSignature = '';

function setMergeEditorHandler(handler) {
  mergeEditorHandler = handler;
}

function canonicalSection(key, type) {
  for (const [oldKey, newKey] of Object.entries(type && type.sectionAliases || {})) {
    if (oldKey === key) return newKey;
  }
  if (key === 'jp') return 'ja';
  if (key === 'cn') return 'zh';
  return key;
}

function sectionValues(parsed, type) {
  const values = parsed.values || parsed.data || {};
  const sections = {};
  Object.entries(values).forEach(([key, value]) => {
    if (key.startsWith('_') || key === 'v' || !String(value || '').trim()) return;
    sections[canonicalSection(key, type)] = String(value);
  });
  return sections;
}

function visibleCards() {
  const containers = document.querySelectorAll('article [data-lc-parsed="true"]');
  return Array.from(containers).flatMap(container => {
    const parsed = parseAnyCard(container.getAttribute('data-lc-raw'), getCurrentSpace());
    if (!parsed) return [];
    const memoName = container.getAttribute('data-lc-memo-name') || '';
    const type = typeForMemo(state.types, memoName, getCurrentSpace(), state.memoSpaceCache);
    return [{
      memoName,
      container,
      article: container.closest('article'),
      parsed,
      type,
      sections: sectionValues(parsed, type)
    }];
  });
}

function sectionLabel(key) {
  for (const language of CONFIG.languages) {
    if (canonicalSection(language.key) === key || language.key === key) return language.label;
  }
  for (const type of state.types) {
    const section = type.sections.find(item => canonicalSection(item.key, type) === key);
    if (section) return section.label;
  }
  return key;
}

function appendMemoLink(parent, memoName, label) {
  if (!memoName) {
    parent.textContent = label;
    return;
  }
  const link = document.createElement('a');
  link.className = 'lc-duplicate-memo-link';
  link.href = `/memos/${encodeURIComponent(memoName.replace(/^memos\//, ''))}`;
  link.textContent = label;
  parent.appendChild(link);
}

function cardIdentity(card) {
  const firstLine = Object.values(card.sections)
    .flatMap(value => value.split(/\r?\n/))
    .map(line => line.trim())
    .find(Boolean);
  const timestamp = card.article
    && card.article.querySelector('relative-time[datetime], time[datetime]');
  const dateValue = timestamp && new Date(timestamp.getAttribute('datetime'));
  const date = dateValue && !Number.isNaN(dateValue.getTime())
    ? dateValue.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : '';
  const title = firstLine && firstLine.length > 72 ? `${firstLine.slice(0, 69)}…` : firstLine;
  return [title || 'Language card', date].filter(Boolean).join(' · ');
}

function renderCardPreview(card, matches, side) {
  const article = document.createElement('article');
  article.className = 'lc-duplicate-preview-card';
  const label = cardIdentity(card);
  const header = document.createElement('header');
  const identity = document.createElement('strong');
  identity.textContent = label;
  header.appendChild(identity);
  if (card.memoName) {
    const originalLink = document.createElement('a');
    originalLink.className = 'lc-duplicate-memo-link';
    originalLink.href = `/memos/${encodeURIComponent(card.memoName.replace(/^memos\//, ''))}`;
    originalLink.textContent = 'Open original';
    header.appendChild(originalLink);
  }
  article.appendChild(header);

  const content = card.article && card.article.querySelector('.lc-card-wrapper');
  if (!content) {
    const fallback = document.createElement('p');
    fallback.textContent = Object.values(card.sections).join('\n');
    article.appendChild(fallback);
    return article;
  }
  const preview = content.cloneNode(true);
  preview.classList.add('lc-duplicate-review-card-content');
  preview.querySelectorAll('.lc-card-note-controls').forEach(controls => controls.remove());
  preview.querySelectorAll('.lc-card-slot').forEach(slot => {
    const section = canonicalSection(slot.getAttribute('data-lc-slot') || '', card.type);
    const text = slot.querySelector('.lc-card-text');
    if (!text) return;
    const matchingLines = new Set(matches
      .filter(match => match.section === section)
      .map(match => side === 'left' ? match.candidateLine : match.existingLine));
    const lines = text.textContent.split(/\r?\n/);
    text.replaceChildren();
    lines.forEach((line, index) => {
      if (index) text.appendChild(document.createTextNode('\n'));
      if (matchingLines.has(line.trim())) {
        const mark = document.createElement('mark');
        mark.textContent = line;
        text.appendChild(mark);
      } else {
        text.appendChild(document.createTextNode(line));
      }
    });
  });
  article.appendChild(preview);
  return article;
}

function appendMatch(root, match, sourceName) {
  const row = document.createElement('div');
  row.className = 'lc-duplicate-match';
  const heading = document.createElement('strong');
  heading.className = 'lc-duplicate-match-heading';
  heading.textContent = `${sectionLabel(match.section)}${match.confidence === 'similar' ? ' · similar wording' : ''}`;
  row.appendChild(heading);

  const text = document.createElement('p');
  text.className = 'lc-duplicate-line';
  text.textContent = `“${match.candidateLine}”  ↔  “${match.existingLine}”`;
  row.appendChild(text);
  if (sourceName) {
    const source = document.createElement('div');
    source.className = 'lc-duplicate-source';
    appendMemoLink(source, sourceName, 'Open matching card');
    row.appendChild(source);
  }
  root.appendChild(row);
}

function updateEditorDuplicateWarning() {
  const panel = document.getElementById('lc-editor-duplicate-warning');
  if (!panel) return [];
  if (state.mergeSession) {
    panel.innerHTML = '';
    panel.hidden = true;
    return [];
  }
  const sections = {};
  (state.editingType && state.editingType.sections || CONFIG.languages).forEach(section => {
    const input = document.getElementById(`lc-input-${section.key}`);
    sections[canonicalSection(section.key, state.editingType)] = input ? input.value : '';
  });
  const matches = findDuplicateMatches(
    sections,
    visibleCards(),
    state.editingMemoName || ''
  );
  panel.innerHTML = '';
  if (!matches.length) {
    panel.hidden = true;
    return matches;
  }
  panel.hidden = false;
  const title = document.createElement('strong');
  title.textContent = `Possible duplicates found (${matches.length})`;
  panel.appendChild(title);
  const note = document.createElement('p');
  note.textContent = 'Review the detected text before saving. Save anyway is always available.';
  panel.appendChild(note);
  matches.slice(0, 5).forEach(match => appendMatch(panel, match, match.memoName));
  if (matches.length > 5) {
    const more = document.createElement('p');
    more.className = 'lc-duplicate-more';
    more.textContent = `And ${matches.length - 5} more matching lines.`;
    panel.appendChild(more);
  }
  return matches;
}

function showDuplicateReview() {
  if (!visiblePairs.length) return;
  const overlay = document.createElement('div');
  overlay.className = 'lc-duplicate-review-overlay';
  overlay.setAttribute('role', 'presentation');
  const trigger = document.getElementById('lc-browse-duplicate-warning');
  if (trigger) trigger.setAttribute('aria-expanded', 'true');
  let pairIndex = 0;
  let closed = false;
  const closeReview = () => {
    if (closed) return;
    closed = true;
    overlay.remove();
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'false');
      if (trigger.isConnected) trigger.focus();
    }
  };
  const dialog = document.createElement('section');
  dialog.className = 'lc-duplicate-review-dialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'lc-duplicate-review-title');
  const header = document.createElement('header');
  header.className = 'lc-duplicate-review-header';
  const titleGroup = document.createElement('div');
  const title = document.createElement('h2');
  title.id = 'lc-duplicate-review-title';
  title.textContent = 'Review possible duplicates';
  titleGroup.appendChild(title);
  const help = document.createElement('p');
  help.textContent = 'Compare the rendered cards. Matching lines are highlighted; choose which note to keep.';
  titleGroup.appendChild(help);
  header.appendChild(titleGroup);
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'lc-duplicate-review-close';
  close.setAttribute('aria-label', 'Close duplicate review');
  close.textContent = '×';
  header.appendChild(close);
  dialog.appendChild(header);

  const navigator = document.createElement('div');
  navigator.className = 'lc-duplicate-review-navigator';
  const previous = document.createElement('button');
  previous.type = 'button';
  previous.className = 'lc-btn lc-btn-secondary';
  previous.textContent = 'Previous';
  const position = document.createElement('span');
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'lc-btn lc-btn-secondary';
  next.textContent = 'Next';
  navigator.append(previous, position, next);
  dialog.appendChild(navigator);

  const matchedLines = document.createElement('div');
  matchedLines.className = 'lc-duplicate-review-matches';
  dialog.appendChild(matchedLines);
  const cards = document.createElement('div');
  cards.className = 'lc-duplicate-review-cards';
  dialog.appendChild(cards);

  const renderPair = () => {
    const pair = visiblePairs[pairIndex];
    position.textContent = `${pairIndex + 1} of ${visiblePairs.length}`;
    previous.disabled = pairIndex === 0;
    next.disabled = pairIndex === visiblePairs.length - 1;
    matchedLines.innerHTML = '';
    pair.matches.forEach(match => {
      const line = document.createElement('span');
      line.className = 'lc-duplicate-review-match';
      line.textContent = `${sectionLabel(match.section)} · “${match.candidateLine}” ↔ “${match.existingLine}”`;
      matchedLines.appendChild(line);
    });
    cards.innerHTML = '';
    [
      { card: pair.left, side: 'left', other: pair.right },
      { card: pair.right, side: 'right', other: pair.left }
    ].forEach(({ card, side, other }) => {
      const column = document.createElement('div');
      column.className = 'lc-duplicate-review-column';
      column.appendChild(renderCardPreview(card, pair.matches, side));
      const keep = document.createElement('button');
      keep.type = 'button';
      keep.className = 'lc-btn lc-btn-primary lc-duplicate-keep-button';
      keep.textContent = 'Keep this note';
      keep.setAttribute('aria-label', `Keep ${cardIdentity(card)} and merge the other note`);
      keep.onclick = () => {
        closeReview();
        const draft = prepareMergeDraft(card, other);
        if (mergeEditorHandler) {
          mergeEditorHandler(draft.editData, draft.activeSections, draft.mergeSession);
        }
      };
      column.appendChild(keep);
      cards.appendChild(column);
    });
  };
  previous.onclick = () => {
    pairIndex = Math.max(0, pairIndex - 1);
    renderPair();
  };
  next.onclick = () => {
    pairIndex = Math.min(visiblePairs.length - 1, pairIndex + 1);
    renderPair();
  };
  close.onclick = closeReview;
  overlay.onclick = event => {
    if (event.target === overlay) closeReview();
  };
  overlay.onkeydown = event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeReview();
    }
  };
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  renderPair();
  close.focus();
}

function prepareMergeDraft(target, source) {
  const sections = {};
  Object.entries(target.sections).forEach(([key, value]) => { sections[key] = value; });
  Object.entries(source.sections).forEach(([key, value]) => {
    sections[key] = mergeSectionValues(sections[key], value);
  });
  const tags = [...new Set([...(target.parsed.tags || []), ...(source.parsed.tags || [])])].join(' ');
  const targetType = target.type || defaultType(null);
  const sectionDefinitions = [...targetType.sections];
  Object.keys(sections).forEach(key => {
    if (sectionDefinitions.some(section => section.key === key)) return;
    const sourceSection = source.type.sections.find(section => (
      canonicalSection(section.key, source.type) === key
    ));
    sectionDefinitions.push(sourceSection
      ? { ...sourceSection, key }
      : { key, label: key, code: key.slice(0, 4).toUpperCase(), color: '#94a3b8' });
  });
  const mergeType = { ...targetType, sections: sectionDefinitions };
  const needsV3 = target.parsed.version === 3
    || Object.keys(sections).some(key => !CONFIG.languages.some(language => language.key === key));
  let editData;
  let activeSections;
  if (needsV3) {
    const explanations = {};
    for (const card of [target, source]) {
      const raw = card.parsed.explanations || {};
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue;
      Object.entries(raw).forEach(([key, value]) => {
        const section = canonicalSection(key, card.type);
        explanations[section] = mergeSectionValues(explanations[section], value);
      });
    }
    const targetUnified = target.parsed.unifiedExplanation || '';
    const sourceUnified = source.parsed.unifiedExplanation || '';
    editData = {
      name: target.memoName,
      version: 3,
      type: mergeType,
      values: sections,
      explanations,
      unifiedExplanation: mergeSectionValues(targetUnified, sourceUnified),
      tags,
      showExplanation: target.parsed.showExplanation !== false,
      hiddenExplanationSections: target.parsed.hiddenExplanationSections || []
    };
    activeSections = sectionDefinitions.filter(section => sections[section.key]).map(section => section.key);
  } else {
    editData = { name: target.memoName, version: 2, tags };
    CONFIG.languages.forEach(language => {
      editData[language.key] = sections[language.key] || '';
    });
    activeSections = CONFIG.languages.filter(language => editData[language.key]).map(language => language.key);
  }
  return {
    editData,
    activeSections,
    mergeSession: {
      targetMemoName: target.memoName,
      sourceMemoName: source.memoName,
      confirmed: false,
      savedContent: null
    }
  };
}

function updateBrowseDuplicateWarning() {
  const bar = document.getElementById('lc-floating-bar');
  if (!bar) return;
  let button = document.getElementById('lc-browse-duplicate-warning');
  if (!button) {
    button = document.createElement('button');
    button.type = 'button';
    button.id = 'lc-browse-duplicate-warning';
    button.className = 'lc-duplicate-warning lc-browse-duplicate-warning';
    button.onclick = showDuplicateReview;
    document.body.appendChild(button);
  }
  const modal = document.getElementById('lc-modal-overlay');
  if (modal && modal.style.display !== 'none') {
    if (button.style.display !== 'none') button.style.display = 'none';
    return;
  }

  const pairs = findCardDuplicatePairs(visibleCards());
  const signature = JSON.stringify(pairs.map(pair => [
    pair.left.memoName,
    pair.right.memoName,
    pair.matches.map(match => [match.section, match.candidateLine, match.existingLine, match.confidence])
  ]));
  if (signature === visiblePairsSignature && button.style.display !== 'none') return;
  visiblePairs = pairs;
  visiblePairsSignature = signature;
  if (!pairs.length) {
    if (button.style.display !== 'none') button.style.display = 'none';
    return;
  }
  button.style.display = '';
  button.setAttribute('aria-label', `${pairs.length} possible duplicate pairs. Tap to review.`);
  button.setAttribute('aria-expanded', 'false');
  button.title = 'Tap to review duplicate cards';
  button.textContent = `⚠ ${pairs.length} possible duplicate${pairs.length === 1 ? '' : 's'}`;
}

export {
  setMergeEditorHandler, updateEditorDuplicateWarning, updateBrowseDuplicateWarning
};
