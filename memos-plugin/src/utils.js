import { CONFIG } from './config.js';

  /** Check if Memos is currently in dark mode */
  function syncThemeClass() {
    let isDark = false;
    const bodyBg = window.getComputedStyle(document.body).backgroundColor;
    const rgb = bodyBg.match(/\d+/g);
    if (rgb && rgb.length >= 3) {
      const yiq = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
      isDark = yiq < 128;
    } else {
      isDark = document.documentElement.classList.contains('dark') || 
               document.body.classList.contains('dark') || 
               document.documentElement.style.colorScheme === 'dark' ||
               window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    document.body.classList.toggle('lc-theme-dark', isDark);
  }

  /** Extract current space from URL */
  function getCurrentSpace() {
    const path = window.location.pathname;
    const match = path.match(/\/s\/([^\/]+)/);
    if (match && match[1]) {
      return match[1].startsWith('spaces/') ? match[1] : `spaces/${match[1]}`;
    }
    return null;
  }

  /** "spaces/abc123" -> "abc123" (display only; API calls keep the full name) */
  function stripSpacePrefix(name) {
    return String(name || '').replace(/^spaces\//, '');
  }

  /** The header JSON that marks a space (and a memo) as a language card */
  function getCardHeaderJson() {
    return JSON.stringify({ _t: CONFIG.typeIdentifier, v: CONFIG.cardVersion });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** Copy text with a clipboard API + execCommand fallback; flashes feedback on btn */
  async function copyText(text, btn) {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
      document.body.removeChild(ta);
    }
    if (btn) {
      const prev = btn.innerText;
      btn.innerText = ok ? '✅' : '❌';
      setTimeout(() => { btn.innerText = prev; }, 1200);
    }
  }

export { syncThemeClass, getCurrentSpace, stripSpacePrefix, getCardHeaderJson, escapeHtml, copyText };
