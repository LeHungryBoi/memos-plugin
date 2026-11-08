import { getMemosAuthToken } from './api.js';
import { escapeHtml } from './utils.js';

  // ============================================================================
  // Tag Autocomplete Controller (matches Memos native editor # autocomplete)
  // ============================================================================

  const tagStore = {
    tags: new Map(), // cleanTag -> count
    lastFetched: 0,
    isFetching: false,

    add(tag, count = 1) {
      if (!tag) return;
      const clean = String(tag).replace(/^[#＃]/, '').trim();
      if (!clean) return;
      const prev = this.tags.get(clean) || 0;
      this.tags.set(clean, Math.max(prev, count));
    },

    scanPage() {
      // 1. Tags in rendered language card chips
      document.querySelectorAll('.lc-tag-chip').forEach(el => {
        this.add(el.innerText);
      });
      // 2. Raw content in cards
      document.querySelectorAll('[data-lc-raw]').forEach(el => {
        const raw = el.getAttribute('data-lc-raw') || '';
        const matches = raw.match(/#[^\s#]+/g) || [];
        matches.forEach(m => this.add(m));
      });
      // 3. Memos sidebar tag rows and native tag elements
      document.querySelectorAll('button[aria-label^="#"], button[aria-label*="#"], [data-tag], a[href*="tag="]').forEach(el => {
        const text = el.getAttribute('data-tag') || el.getAttribute('aria-label') || el.innerText || '';
        const matches = text.match(/#[^\s#]+/g) || [];
        matches.forEach(m => this.add(m));
      });
    },

    async fetchServer() {
      const now = Date.now();
      if (this.isFetching || (now - this.lastFetched < 45000 && this.tags.size > 0)) {
        return;
      }
      this.isFetching = true;
      try {
        const token = await getMemosAuthToken();
        const headers = {
          'Content-Type': 'application/json',
          'Connect-Protocol-Version': '1'
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Normalize both generations:
        // - new (26.10+): ListUserStats {parent}, response userStats[].tagCounts
        // - 0.31:        ListAllUserStats {}, response stats[].tagCount
        const ingest = (json) => {
          const stats = (json && (json.userStats || json.stats)) || [];
          let found = false;
          stats.forEach(stat => {
            const counts = (stat && (stat.tagCounts || stat.tagCount)) || null;
            if (counts && typeof counts === 'object') {
              Object.entries(counts).forEach(([tag, cnt]) => {
                this.add(tag, Number(cnt) || 1);
                found = true;
              });
            }
          });
          return found;
        };

        // 1. New API: POST /memos.api.UserService/ListUserStats
        const res = await fetch('/memos.api.UserService/ListUserStats', {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify({ parent: 'users/-' })
        });
        if (res.ok) {
          const json = await res.json();
          if (ingest(json)) {
            this.lastFetched = Date.now();
            return;
          }
        }

        // 2. Legacy API (memos 0.31): POST /memos.api.v1.UserService/ListAllUserStats
        const resLegacy = await fetch('/memos.api.v1.UserService/ListAllUserStats', {
          method: 'POST',
          headers,
          credentials: 'include',
          body: '{}'
        });
        if (resLegacy.ok) {
          const jsonLegacy = await resLegacy.json();
          if (ingest(jsonLegacy)) {
            this.lastFetched = Date.now();
            return;
          }
        }

        // 3. REST fallbacks (new route, then the 0.31 route /api/v1/users:stats)
        for (const restUrl of ['/api/users/-/stats', '/api/v1/users:stats']) {
          const res2 = await fetch(restUrl, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            credentials: 'include'
          }).catch(() => null);
          if (res2 && res2.ok) {
            const json2 = await res2.json();
            if (ingest(json2)) {
              this.lastFetched = Date.now();
              return;
            }
          }
        }
      } catch (e) {
        // Fallback to DOM scanned tags
      } finally {
        this.isFetching = false;
      }
    }
  };

  /** Match ranking identical to Memos native editor (extensions.ts matchRank) */
  function matchTagRank(tag, typed) {
    if (!typed) return 0;
    const lowerTag = tag.toLowerCase();
    const idx = lowerTag.indexOf(typed);
    if (idx < 0) return -1;
    if (idx === 0) return 0; // Full-path prefix
    if (lowerTag[idx - 1] === '/') return 1; // Path-segment start (e.g. "vo" in "lang/vocab")
    return 2; // Substring anywhere else
  }

  function getRankedTagMatches(query) {
    const typed = (query || '').toLowerCase().trim();
    const results = [];
    tagStore.tags.forEach((count, tag) => {
      const rank = matchTagRank(tag, typed);
      if (rank >= 0) {
        results.push({ tag, rank, count });
      }
    });

    results.sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      if (b.count !== a.count) return b.count - a.count;
      return a.tag.localeCompare(b.tag);
    });

    return results.slice(0, 10);
  }

  const activeAutocomplete = {
    inputEl: null,
    tokenStart: 0,
    tokenEnd: 0,
    query: '',
    items: [],
    highlightedIndex: 0,
    hasExactMatch: false
  };

  function getOrCreateTagDropdown() {
    let dropdown = document.getElementById('lc-tag-dropdown');
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.id = 'lc-tag-dropdown';
      dropdown.className = 'lc-tag-dropdown';
      dropdown.style.display = 'none';
      const dialog = document.querySelector('.lc-modal-dialog');
      if (dialog) {
        dialog.appendChild(dropdown);
      } else {
        document.body.appendChild(dropdown);
      }
      // Keep the dropdown anchored to the caret while the modal body scrolls
      // or the viewport resizes (capture phase so nested scrollers are caught).
      document.addEventListener('scroll', () => {
        const dd = document.getElementById('lc-tag-dropdown');
        if (!dd || dd.style.display === 'none') return;
        const inputEl = activeAutocomplete.inputEl;
        if (!inputEl || !inputEl.isConnected) {
          hideTagAutocomplete();
          return;
        }
        const scroller = inputEl.closest('.lc-modal-body');
        if (scroller) {
          const inputRect = inputEl.getBoundingClientRect();
          const scrollRect = scroller.getBoundingClientRect();
          if (inputRect.bottom < scrollRect.top || inputRect.top > scrollRect.bottom) {
            hideTagAutocomplete(); // input scrolled out of view
            return;
          }
        }
        positionDropdown(dd, inputEl);
      }, true);
      window.addEventListener('resize', () => {
        const dd = document.getElementById('lc-tag-dropdown');
        if (dd && dd.style.display !== 'none' && activeAutocomplete.inputEl) {
          positionDropdown(dd, activeAutocomplete.inputEl);
        }
      });
    }
    return dropdown;
  }

  function hideTagAutocomplete() {
    const dropdown = document.getElementById('lc-tag-dropdown');
    if (dropdown) dropdown.style.display = 'none';
    activeAutocomplete.inputEl = null;
    activeAutocomplete.items = [];
    activeAutocomplete.highlightedIndex = 0;
  }


  function renderTagDropdown(matches, query, targetEl) {
    const dropdown = getOrCreateTagDropdown();
    activeAutocomplete.items = matches;
    activeAutocomplete.query = query;
    activeAutocomplete.inputEl = targetEl;
    activeAutocomplete.highlightedIndex = 0;

    const hasExact = matches.some(m => m.tag.toLowerCase() === query.toLowerCase());
    activeAutocomplete.hasExactMatch = hasExact;

    const canCreateNew = query.length > 0 && !hasExact;
    const totalSelectable = matches.length + (canCreateNew ? 1 : 0);

    if (totalSelectable === 0) {
      dropdown.innerHTML = `
        <div class="lc-tag-dropdown-header">
          <span># Tags</span>
        </div>
        <div class="lc-tag-dropdown-empty">Type a tag name...</div>
      `;
    } else {
      let listHtml = '';
      matches.forEach((m, idx) => {
        let displayLabel = escapeHtml(m.tag);
        if (query.length > 0) {
          const lower = m.tag.toLowerCase();
          const matchIdx = lower.indexOf(query.toLowerCase());
          if (matchIdx >= 0) {
            const before = escapeHtml(m.tag.slice(0, matchIdx));
            const hit = escapeHtml(m.tag.slice(matchIdx, matchIdx + query.length));
            const after = escapeHtml(m.tag.slice(matchIdx + query.length));
            displayLabel = `${before}<b>${hit}</b>${after}`;
          }
        }
        const countBadge = m.count > 0 ? `<span class="lc-tag-count">${m.count}</span>` : '';
        listHtml += `
          <div class="lc-tag-item ${idx === 0 ? 'active' : ''}" data-index="${idx}" data-tag="${escapeHtml(m.tag)}">
            <div class="lc-tag-item-left">
              <span class="lc-tag-icon">#</span>
              <span class="lc-tag-label">${displayLabel}</span>
            </div>
            ${countBadge}
          </div>
        `;
      });

      if (canCreateNew) {
        const createIdx = matches.length;
        listHtml += `
          <div class="lc-tag-item lc-tag-item-create ${matches.length === 0 ? 'active' : ''}" data-index="${createIdx}" data-tag="${escapeHtml(query)}">
            <div class="lc-tag-item-left">
              <span class="lc-tag-icon">+</span>
              <span class="lc-tag-label">Create tag <b>#${escapeHtml(query)}</b></span>
            </div>
          </div>
        `;
      }

      dropdown.innerHTML = `
        <div class="lc-tag-dropdown-header">
          <span># Tags</span>
          <span style="font-size:10px; opacity:0.75;">${matches.length} found</span>
        </div>
        <div class="lc-tag-dropdown-list">
          ${listHtml}
        </div>
      `;
    }

    // Attach click and hover events to items
    dropdown.querySelectorAll('.lc-tag-item').forEach(item => {
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const tag = item.getAttribute('data-tag');
        if (tag) applyTagSelection(tag);
      });
      item.addEventListener('mouseenter', () => {
        const idx = parseInt(item.getAttribute('data-index'), 10);
        if (!isNaN(idx)) {
          activeAutocomplete.highlightedIndex = idx;
          updateDropdownHighlight(dropdown);
        }
      });
    });

    positionDropdown(dropdown, targetEl);
  }

  function updateDropdownHighlight(dropdown) {
    dropdown.querySelectorAll('.lc-tag-item').forEach((item, idx) => {
      item.classList.toggle('active', idx === activeAutocomplete.highlightedIndex);
      if (idx === activeAutocomplete.highlightedIndex) {
        item.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  // Mirror-div technique: pixel position of the caret ("blinker") inside an
  // <input>/<textarea>, relative to the element's border-box top-left corner.
  function getCaretCoordinates(el, position) {
    const properties = [
      'direction', 'boxSizing', 'width', 'height',
      'overflowX', 'overflowY',
      'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
      'borderStyle',
      'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
      'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize',
      'fontSizeAdjust', 'lineHeight', 'fontFamily',
      'textAlign', 'textTransform', 'textIndent', 'textDecoration',
      'letterSpacing', 'wordSpacing', 'tabSize'
    ];

    const mirror = document.createElement('div');
    document.body.appendChild(mirror);

    const style = mirror.style;
    const computed = window.getComputedStyle(el);

    style.position = 'absolute';
    style.visibility = 'hidden';
    style.top = '0';
    style.left = '0';
    style.whiteSpace = 'pre-wrap';
    style.wordWrap = 'break-word';

    properties.forEach(prop => {
      style[prop] = computed[prop];
    });

    if (el.nodeName === 'INPUT') {
      style.whiteSpace = 'nowrap';
      style.wordWrap = 'normal';
    } else {
      style.height = 'auto';
    }

    mirror.textContent = el.value.substring(0, position);

    const marker = document.createElement('span');
    marker.textContent = el.value.substring(position) || '.';
    mirror.appendChild(marker);

    const coordinates = {
      left: marker.offsetLeft - (el.scrollLeft || 0) + parseInt(computed['borderLeftWidth'], 10),
      top: marker.offsetTop + parseInt(computed['borderTopWidth'], 10),
      height: parseInt(computed['lineHeight'], 10) || parseFloat(computed['fontSize'])
    };

    document.body.removeChild(mirror);
    return coordinates;
  }

  function positionDropdown(dropdown, targetEl) {
    const dialog = document.querySelector('.lc-modal-dialog');
    if (!dialog || !targetEl) return;
    const targetRect = targetEl.getBoundingClientRect();

    // Caret ("blinker") position inside the input, in viewport coordinates
    let caretX = targetRect.left;
    try {
      const caret = getCaretCoordinates(targetEl, targetEl.selectionStart || 0);
      caretX = targetRect.left + caret.left;
    } catch (err) {
      caretX = targetRect.left;
    }

    const maxW = Math.min(360, Math.max(240, targetRect.width));
    dropdown.style.maxWidth = `${maxW}px`;
    dropdown.style.minWidth = '220px';
    dropdown.style.width = 'max-content';

    // Vertical: right below the input line (i.e. below the caret), flip above when tight
    const estHeight = 210;
    let top;
    if (window.innerHeight - targetRect.bottom < estHeight && targetRect.top > estHeight) {
      top = targetRect.top - estHeight - 4;
    } else {
      top = targetRect.bottom + 4;
    }

    dropdown.style.display = 'flex';

    // Clamp horizontally so the dropdown never leaves the viewport
    const margin = 10;
    const width = dropdown.offsetWidth;
    let left = caretX;
    if (left + width > window.innerWidth - margin) {
      left = window.innerWidth - margin - width;
    }
    if (left < margin) left = margin;

    dropdown.style.left = `${left}px`;
    dropdown.style.top = `${top}px`;
  }

  function applyTagSelection(selectedTag) {
    const el = activeAutocomplete.inputEl;
    if (!el) return;
    const cleanTag = selectedTag.replace(/^[#＃]/, '').trim();
    if (!cleanTag) return;

    const val = el.value;
    const before = val.slice(0, activeAutocomplete.tokenStart);
    const after = val.slice(activeAutocomplete.tokenEnd);
    const insertion = `#${cleanTag} `;

    el.value = before + insertion + after;
    const nextCursor = before.length + insertion.length;
    el.selectionStart = nextCursor;
    el.selectionEnd = nextCursor;

    tagStore.add(cleanTag);
    el.dispatchEvent(new Event('input', { bubbles: true }));

    hideTagAutocomplete();
    el.focus();
  }

  function checkTagAutocomplete(el) {
    if (!el) return;
    const pos = el.selectionStart;
    const val = el.value;
    const textBefore = val.slice(0, pos);

    let match = textBefore.match(/(?:^|\s)([#＃][^\s#＃]*)$/);

    // In lc-input-tags specifically: also trigger if user typed a word without explicit #
    if (!match && el.id === 'lc-input-tags') {
      const tagMatch = textBefore.match(/(?:^|\s)([^\s#＃]+)$/);
      if (tagMatch) {
        match = tagMatch;
      }
    }

    if (match) {
      const token = match[1];
      const hasHash = token.startsWith('#') || token.startsWith('＃');
      const query = hasHash ? token.slice(1) : token;
      const tokenStart = pos - token.length;
      const tokenEnd = pos;

      activeAutocomplete.tokenStart = tokenStart;
      activeAutocomplete.tokenEnd = tokenEnd;

      const matches = getRankedTagMatches(query);
      renderTagDropdown(matches, query, el);
    } else {
      hideTagAutocomplete();
    }
  }

  function handleTagAutocompleteKeydown(e, el) {
    const dropdown = document.getElementById('lc-tag-dropdown');
    const isVisible = dropdown && dropdown.style.display !== 'none';

    if (!isVisible) return false;

    const totalSelectable = activeAutocomplete.items.length + (activeAutocomplete.query.length > 0 && !activeAutocomplete.hasExactMatch ? 1 : 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      if (totalSelectable > 0) {
        activeAutocomplete.highlightedIndex = (activeAutocomplete.highlightedIndex + 1) % totalSelectable;
        updateDropdownHighlight(dropdown);
      }
      return true;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      if (totalSelectable > 0) {
        activeAutocomplete.highlightedIndex = (activeAutocomplete.highlightedIndex - 1 + totalSelectable) % totalSelectable;
        updateDropdownHighlight(dropdown);
      }
      return true;
    }

    if (e.key === 'Enter' || e.key === 'Tab') {
      if (e.ctrlKey || e.metaKey) return false; // Let Ctrl+Enter save card

      e.preventDefault();
      e.stopPropagation();
      if (totalSelectable > 0) {
        let tagToSelect = '';
        if (activeAutocomplete.highlightedIndex < activeAutocomplete.items.length) {
          tagToSelect = activeAutocomplete.items[activeAutocomplete.highlightedIndex].tag;
        } else {
          tagToSelect = activeAutocomplete.query;
        }
        applyTagSelection(tagToSelect);
      }
      return true;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      hideTagAutocomplete();
      return true;
    }

    return false;
  }

export { tagStore, matchTagRank, getRankedTagMatches, activeAutocomplete, getOrCreateTagDropdown, hideTagAutocomplete, renderTagDropdown, updateDropdownHighlight, getCaretCoordinates, positionDropdown, applyTagSelection, checkTagAutocomplete, handleTagAutocompleteKeydown };
