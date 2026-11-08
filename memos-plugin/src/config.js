/**
 * Static configuration and storage keys.
 * Edit this file to change languages, the card identifier or quick actions.
 */

  // --- Configuration ---
  const CONFIG = {
    typeIdentifier: 'lc',
    cardVersion: 2,
    dedicatedSpaceKeyword: null,
    // Ordered: JA (left) -> EN (middle) -> ZH (right)
    // `defaultHidden` = the section starts closed when creating a new card
    // (V2 behaviour: the editor opened with EN+ZH). Same idea as the marker's
    // per-section `defaultHidden`, this one only seeds the built-in template.
    languages: [
      { key: 'ja', label: '日本語', code: 'JA', color: '#fbbf24', ttsLang: 'ja-JP', placeholder: 'e.g. セレンディピティ', defaultHidden: true },
      { key: 'en', label: 'English', code: 'EN', color: '#38bdf8', ttsLang: 'en-US', placeholder: 'e.g. serendipity' },
      { key: 'zh', label: '中文', code: 'ZH', color: '#34d399', ttsLang: 'zh-CN', placeholder: 'e.g. 意外发现珍宝的运气 / 缘分' }
    ],
    // Native memo actions surfaced as one-click icon buttons in the card
    // header (left of the three-dots "More" menu). Each entry:
    //   label   - button aria-label / tooltip
    //   path    - menu labels to walk (last entry is clicked); supports
    //             submenus, e.g. ['Copy', 'Copy Content']
    //   icon    - lucide SVG markup shown on the button
    //   iconName- lucide class fallback used when the menu label changes
    //             (e.g. "Pin" -> "Unpin" once pinned)
    // Add / remove entries to change the quick action set.
    quickActions: [
      {
        label: 'Pin',
        path: ['Pin'],
        iconName: 'lucide-bookmark-plus',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bookmark-plus" aria-hidden="true"><path d="M12 7v6"></path><path d="M15 10H9"></path><path d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z"></path></svg>'
      },
      {
        label: 'Edit',
        path: ['Edit'],
        iconName: 'lucide-pen-line',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pen-line" aria-hidden="true"><path d="M13 21h8"></path><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path></svg>'
      },
      {
        label: 'Archive',
        path: ['Archive'],
        iconName: 'lucide-archive',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-archive" aria-hidden="true"><rect width="20" height="5" x="2" y="3" rx="1"></rect><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path><path d="M10 12h4"></path></svg>'
      }
    ,
      {
        label: 'Copy Content',
        path: ['Copy', 'Copy Content'],
        iconName: 'lucide-copy',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>'
      }
    ]
  };

  const LS_GLOBAL_LANGS_KEY = 'memos_lc_enabled_langs_v2';

export { CONFIG, LS_GLOBAL_LANGS_KEY };
