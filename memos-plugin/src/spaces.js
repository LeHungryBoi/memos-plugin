import { CONFIG } from './config.js';
import { state } from './state.js';
import { getMemosAuthToken, fetchAllSpaces } from './api.js';
import {
  stripSpacePrefix, getCardHeaderJson, escapeHtml, copyText, getCurrentSpace
} from './utils.js';

  // --- Dedicated Space Resolution ---
  // A space becomes "the language card space" when its description carries the
  // language card header JSON ({"_t":"lc","v":2}). New cards are then saved
  // there regardless of which page the editor is opened from.
  const LS_TARGET_SPACE_KEY = 'memos_lc_target_space_v2';

  /**
   * Extract the language card header from a space description.
   * Tolerant: human-readable text may surround the JSON (first "{" to last
   * "}"), the same strategy parseCardMemo uses for memo content.
   */
  function parseSpaceHeader(description) {
    if (!description || !description.includes('{')) return null;
    const start = description.indexOf('{');
    const end = description.lastIndexOf('}');
    if (start === -1 || end <= start) return null;
    try {
      const data = JSON.parse(description.substring(start, end + 1));
      return data && data._t === CONFIG.typeIdentifier ? data : null;
    } catch (e) {
      return null;
    }
  }

  /** All spaces carrying the language card header, sorted for deterministic picks */
  async function findDedicatedSpaces() {
    const token = await getMemosAuthToken();
    const spaces = await fetchAllSpaces(token);
    return spaces
      .filter((space) => parseSpaceHeader(space.description))
      .sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }

  /** Read the cached dedicated space; tolerates the legacy bare-name cache format */
  function readCachedTargetSpace() {
    try {
      const raw = localStorage.getItem(LS_TARGET_SPACE_KEY);
      if (!raw) return null;
      if (raw.startsWith('{')) {
        const parsed = JSON.parse(raw);
        return parsed && parsed.name ? { name: parsed.name, title: parsed.title || '' } : null;
      }
      // Legacy cache entry: bare resource name "spaces/xxx" (no title known)
      return { name: raw, title: '' };
    } catch (e) {
      return null;
    }
  }

  function writeCachedTargetSpace(name, title) {
    try {
      localStorage.setItem(LS_TARGET_SPACE_KEY, JSON.stringify({ name: name, title: title || '' }));
    } catch (e) { /* ignore */ }
  }

  /**
   * Resolve the dedicated language card space.
   * Returns { space: "spaces/xxx" | null (API resource name),
   *           title: human-readable space title ("" when unknown),
   *           matches: Space[] | null, fromCache }.
   * - exactly one match -> that space (name+title cached in localStorage)
   * - multiple matches  -> null (ambiguous; the caller shows a warning)
   * - none / fetch error -> null
   */
  async function resolveTargetSpace(options) {
    const force = Boolean(options && options.force);
    if (!force) {
      const cached = readCachedTargetSpace();
      if (cached) return { space: cached.name, title: cached.title, matches: null, fromCache: true };
    }
    const matches = await findDedicatedSpaces();
    if (matches.length === 1) {
      writeCachedTargetSpace(matches[0].name, matches[0].title || '');
      return { space: matches[0].name, title: matches[0].title || '', matches, fromCache: false };
    }
    clearTargetSpaceCache();
    return { space: null, title: '', matches, fromCache: false };
  }

  function clearTargetSpaceCache() {
    try { localStorage.removeItem(LS_TARGET_SPACE_KEY); } catch (e) { /* ignore */ }
  }

  // --- Space Indicator & Info Popup ---

  function setSpaceIndicatorState(state, text) {
    const btn = document.getElementById('lc-space-indicator');
    const textEl = document.getElementById('lc-space-indicator-text');
    if (!btn || !textEl) return;
    btn.classList.remove('lc-si-loading', 'lc-si-ok', 'lc-si-warn', 'lc-si-missing');
    btn.classList.add(`lc-si-${state}`);
    textEl.innerText = text;
    btn.title = `${text} — click for details`;
  }

  function updateSpaceHint(spaceName, spaceTitle) {
    const hint = document.getElementById('lc-space-hint');
    if (!hint) return;
    const label = spaceTitle || (spaceName ? stripSpacePrefix(spaceName) : '');
    hint.innerText = spaceName ? `Target Space: ${label}` : 'Target Space: Personal Space';
  }

  /** Resolve the dedicated space and paint the indicator (cached unless force) */
  async function refreshSpaceIndicator(force) {
    if (state.spaceResolutionInFlight) return state.spaceResolutionInFlight;
    state.spaceResolutionInFlight = (async () => {
      setSpaceIndicatorState('loading', '⏳ Checking spaces…');
      try {
        const result = await resolveTargetSpace({ force: Boolean(force) });
        if (result.space) {
          // Show the human-readable title; fall back to the bare uid
          setSpaceIndicatorState('ok', `🃏 ${result.title || stripSpacePrefix(result.space)}`);
        } else if (result.matches && result.matches.length > 1) {
          setSpaceIndicatorState('warn', `⚠️ ${result.matches.length} spaces with header`);
        } else if (result.matches) {
          setSpaceIndicatorState('missing', '⛔ No space with header');
        } else {
          setSpaceIndicatorState('missing', '⛔ Space check failed');
        }
        if (result.space) {
          updateSpaceHint(result.space, result.title);
        } else {
          updateSpaceHint(getCurrentSpace(), '');
        }
        return result;
      } catch (err) {
        console.warn('[LanguageCard] space resolution failed', err);
        setSpaceIndicatorState('missing', '⛔ Space check failed');
        return null;
      } finally {
        state.spaceResolutionInFlight = null;
      }
    })();
    return state.spaceResolutionInFlight;
  }

  function spaceHeaderCodeHtml() {
    return `<div class="lc-header-box">
      <code class="lc-header-json">${escapeHtml(getCardHeaderJson())}</code>
      <button type="button" class="lc-header-copy-btn" id="lc-space-info-copy-btn" title="Copy header JSON">📋</button>
    </div>`;
  }

  function showSpaceInfoPopup(result) {
    const overlay = document.getElementById('lc-space-info-overlay');
    const titleEl = document.getElementById('lc-space-info-title');
    const bodyEl = document.getElementById('lc-space-info-body');
    if (!overlay || !titleEl || !bodyEl) return;

    let title = 'Language Card Space';
    let bodyHtml = '';

    if (!result) {
      title = '⚠️ Space check failed';
      bodyHtml = `<p>The space list could not be read from the server. This usually means the access token expired — reload the page and click the indicator again.</p>`;
    } else if (result.space) {
      title = '🃏 Language card space';
      const displayTitle = result.title || stripSpacePrefix(result.space);
      bodyHtml = `
        <p>New cards are saved into this space:</p>
        <div class="lc-space-info-name">${escapeHtml(displayTitle)}</div>
        ${result.title ? `<div class="lc-space-info-uid">uid: ${escapeHtml(stripSpacePrefix(result.space))}</div>` : ''}
        <p>It is identified by this header in its description:</p>
        ${spaceHeaderCodeHtml()}`;
    } else if (result.matches && result.matches.length > 1) {
      title = `⚠️ ${result.matches.length} spaces carry the header`;
      bodyHtml = `
        <p><b>Only one space</b> may carry the language card header, so no target space is selected. Remove the header from the description of all but one space:</p>
        <ul class="lc-space-info-list">
          ${result.matches.map((s) => `<li><b>${escapeHtml(s.title || stripSpacePrefix(s.name))}</b><span class="lc-space-info-uid">${escapeHtml(stripSpacePrefix(s.name))}</span></li>`).join('')}
        </ul>
        <p>This is the header to look for:</p>
        ${spaceHeaderCodeHtml()}`;
    } else {
      title = '⛔ No language card space found';
      bodyHtml = `
        <p>No space carries the language card header yet, so new cards go to the current space (or your personal space).</p>
        <p>To choose the space that receives new cards:</p>
        <ol>
          <li>Open the space you want to use.</li>
          <li>Edit its description and paste this header into it:</li>
        </ol>
        ${spaceHeaderCodeHtml()}
        <p>Only one space should carry this header.</p>`;
    }

    titleEl.innerText = title;
    bodyEl.innerHTML = bodyHtml;

    const copyBtn = document.getElementById('lc-space-info-copy-btn');
    if (copyBtn) {
      copyBtn.onclick = (e) => {
        e.stopPropagation();
        copyText(getCardHeaderJson(), copyBtn);
      };
    }

    overlay.style.display = 'flex';
    const onKey = (ev) => {
      if (ev.key === 'Escape') {
        hideSpaceInfoPopup();
        document.removeEventListener('keydown', onKey, true);
      }
    };
    document.addEventListener('keydown', onKey, true);
  }

  function hideSpaceInfoPopup() {
    const overlay = document.getElementById('lc-space-info-overlay');
    if (overlay) overlay.style.display = 'none';
  }

export { parseSpaceHeader, findDedicatedSpaces, readCachedTargetSpace, writeCachedTargetSpace, resolveTargetSpace, clearTargetSpaceCache, setSpaceIndicatorState, updateSpaceHint, refreshSpaceIndicator, spaceHeaderCodeHtml, showSpaceInfoPopup, hideSpaceInfoPopup };
