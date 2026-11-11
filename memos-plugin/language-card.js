/* ============================================================================
 * Language Card Extension for Memos - GENERATED FILE, DO NOT EDIT HERE.
 * Sources: src/*.js and the CSS modules listed in src/styles/index.css
 * Rebuild published files: npm run build; watcher output: .watch/language-card.js
 * Paste this whole file into Settings -> System -> Additional Script.
 * ============================================================================ */
"use strict";
(() => {
  // lc-css:styles/index.css
  var styles_default = `/* ==========================================================================
   Language Card Extension for Memos (Custom CSS v2.9)
   100% Theme-Adaptive (Auto Dark / Light Mode Matching)
   - Dynamic Language Visibility: toggled-off language takes 0 space on x-axis
   - Mobile-First Side-by-Side: 2 columns remain side-by-side on phone screens
   - JA (Left) -> EN (Middle) -> ZH (Right) ordering
   - Per-card Edit button in the note bar
   - Space indicator in the modal header (ok / multiple-with-warning / missing)
   - Language card header box with copy button (modal bottom & info popup)
   - Native Quick Actions (Pin / Edit / Archive) in memo card headers
   Paste into: Memos Admin -> Settings -> System -> Additional Style
   ========================================================================== */

/* --- Base Variables & Theme Defaults --- */
:root {
  --lc-bg-card: var(--card, rgba(0, 0, 0, 0.03));
  --lc-border-card: var(--border, rgba(0, 0, 0, 0.12));
  --lc-text-primary: var(--foreground, #0f172a);
  --lc-text-muted: var(--muted-foreground, #64748b);
  --lc-text-badge: #475569;
  --lc-modal-bg: var(--popover, #ffffff);
  --lc-modal-border: var(--border, rgba(0, 0, 0, 0.15));
  --lc-input-bg: var(--background, #ffffff);
  --lc-input-text: var(--foreground, #0f172a);
  --lc-input-placeholder: #94a3b8;
  --lc-preview-bg: rgba(0, 0, 0, 0.04);
  --lc-preview-text: #059669;
  --lc-chip-bg: rgba(59, 130, 246, 0.1);
  --lc-chip-text: #2563eb;
  --lc-chip-border: rgba(59, 130, 246, 0.2);
  --lc-slot-bg: rgba(0, 0, 0, 0.03);
}

/* Force Dark Mode Palette when Memos is in Dark Mode */
.lc-theme-dark,
.dark,
:root[style*="color-scheme: dark"] {
  --lc-bg-card: rgba(255, 255, 255, 0.05);
  --lc-border-card: rgba(255, 255, 255, 0.14);
  --lc-text-primary: #f8fafc;
  --lc-text-muted: #94a3b8;
  --lc-text-badge: #cbd5e1;
  --lc-modal-bg: #18181b;
  --lc-modal-border: rgba(255, 255, 255, 0.15);
  --lc-input-bg: rgba(0, 0, 0, 0.35);
  --lc-input-text: #f8fafc;
  --lc-input-placeholder: #71717a;
  --lc-preview-bg: rgba(0, 0, 0, 0.5);
  --lc-preview-text: #34d399;
  --lc-chip-bg: rgba(59, 130, 246, 0.2);
  --lc-chip-text: #93c5fd;
  --lc-chip-border: rgba(59, 130, 246, 0.4);
  --lc-slot-bg: rgba(0, 0, 0, 0.25);
}

/* --- Card Grid in Memo Feed (Mobile-First Side-by-Side) --- */
.lc-card-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.lc-card-note-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  padding: 0 2px;
}

/* R5.2: the duplicate 🔤 Card title was removed; the editor owns the header. */

/* Right-side controls group: edit button */
.lc-card-note-controls {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.lc-card-edit-btn {
  font-size: 12px;
  opacity: 0.7;
}

.lc-card-edit-btn:hover {
  opacity: 1;
}

.lc-card-grid {
  display: grid;
  /* Dynamic columns based on active languages (2 cols on phone by default!) */
  grid-template-columns: repeat(var(--lc-cols, 2), minmax(0, 1fr));
  gap: 8px;
  width: 100%;
  margin: 6px 0 0;
  box-sizing: border-box;
}

.lc-card-slot {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 8px 10px;
  border-radius: 0;
  border: 1px solid var(--lc-border-card);
  background: var(--lc-bg-card);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
  min-width: 0;
}

@media (min-width: 640px) {
  .lc-card-slot {
    padding: 10px 14px;
    border-radius: 0;
  }
}

.lc-card-slot:hover {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(59, 130, 246, 0.08);
}

.lc-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.lc-card-badge {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--lc-text-badge);
}

@media (min-width: 640px) {
  .lc-card-badge {
    font-size: 11px;
  }
}

.lc-btn-icon {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 12px;
  padding: 2px 3px;
  border-radius: 4px;
  color: var(--lc-text-muted);
  transition: all 0.15s ease;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.lc-btn-icon:hover {
  background: rgba(140, 140, 140, 0.2);
  color: var(--lc-text-primary);
  transform: scale(1.1);
}

.lc-btn-icon:active {
  transform: scale(0.95);
}

.lc-card-text {
  font-size: 13.5px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--lc-text-primary);
  word-break: break-word;
  white-space: pre-wrap;
  transition: filter 0.25s ease, opacity 0.25s ease;
}

@media (min-width: 640px) {
  .lc-card-text {
    font-size: 15px;
    line-height: 1.45;
  }
}

.lc-card-empty {
  opacity: 0.35;
  font-style: italic;
  font-weight: 400;
}

/* --- Card Tags Row --- */
.lc-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.lc-tag-chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 600;
  background: var(--lc-chip-bg);
  color: var(--lc-chip-text);
  border: 1px solid var(--lc-chip-border);
}

/* --- Floating Action Bar (V3: New Card only, R5.1 removed the pills) --- */
.lc-floating-bar {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 8px;
}

.lc-fab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 15px;
  border-radius: 50px;
  background: #2563eb;
  color: #ffffff;
  font-size: 12.5px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.lc-fab:hover {
  background: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 6px 22px rgba(37, 99, 235, 0.55);
}

.lc-fab:active {
  transform: translateY(0);
}

/* --- Modal Overlay & Dialog --- */
.lc-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  box-sizing: border-box;
}

.lc-modal-dialog {
  width: 100%;
  max-width: 820px;
  max-height: calc(100dvh - 24px);
  display: flex;
  flex-direction: column;
  background: var(--lc-modal-bg) !important;
  color: var(--lc-text-primary) !important;
  border-radius: 14px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  border: 1px solid var(--lc-modal-border);
  animation: lc-modal-in 0.18s ease-out;
  box-sizing: border-box;
}

@keyframes lc-modal-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.lc-modal-header {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  padding: 14px 18px;
  border-bottom: 1px solid var(--lc-modal-border);
  gap: 10px;
}

.lc-modal-header.lc-space-swipe-next {
  animation: lc-space-swipe-next 240ms cubic-bezier(0.2, 0.75, 0.3, 1);
}

.lc-modal-header.lc-space-swipe-previous {
  animation: lc-space-swipe-previous 240ms cubic-bezier(0.2, 0.75, 0.3, 1);
}

@keyframes lc-space-swipe-next {
  from {
    opacity: 0.65;
    transform: translateX(14px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes lc-space-swipe-previous {
  from {
    opacity: 0.65;
    transform: translateX(-14px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .lc-modal-header.lc-space-swipe-next,
  .lc-modal-header.lc-space-swipe-previous {
    animation-duration: 1ms;
  }
}

.lc-modal-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
  flex-wrap: wrap;
}

.lc-space-controls {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.lc-modal-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--lc-text-primary) !important;
}

/* --- Space management button and independent quick Space selector --- */
.lc-space-indicator {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  padding: 2px 8px;
  border-radius: 5px;
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
  font-weight: 600;
  cursor: pointer;
  max-width: 240px;
  transition: all 0.15s ease;
}

.lc-space-indicator:hover {
  filter: brightness(1.12);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.lc-space-indicator > span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lc-space-indicator.lc-si-loading {
  background: rgba(140, 140, 140, 0.12);
  color: var(--lc-text-muted);
  border-color: var(--lc-modal-border);
  cursor: progress;
}

.lc-space-indicator.lc-si-ok {
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
  border-color: rgba(16, 185, 129, 0.35);
}

.lc-space-indicator.lc-si-warn {
  background: rgba(245, 158, 11, 0.15);
  color: #b45309;
  border-color: rgba(245, 158, 11, 0.4);
}

.lc-space-indicator.lc-si-missing {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
  border-color: rgba(239, 68, 68, 0.3);
}

.lc-theme-dark .lc-space-indicator.lc-si-ok {
  color: #34d399;
}

.lc-theme-dark .lc-space-indicator.lc-si-warn {
  color: #fbbf24;
}

.lc-theme-dark .lc-space-indicator.lc-si-missing {
  color: #f87171;
}

.lc-space-select {
  position: relative;
}

.lc-space-select-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  max-width: 190px;
  padding: 5px 9px;
  border: 1px solid var(--lc-modal-border);
  border-radius: 6px;
  background: var(--lc-input-bg);
  color: var(--lc-text-primary);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.lc-space-select-btn span:first-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lc-space-select-panel {
  position: absolute;
  z-index: 20;
  top: calc(100% + 6px);
  left: 0;
  width: min(250px, calc(100vw - 48px));
  max-height: 300px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--lc-modal-border);
  border-radius: 9px;
  background: var(--lc-modal-bg);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.24);
}

.lc-space-select-panel[hidden] {
  display: none !important;
}

.lc-space-select-options {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overscroll-behavior: contain;
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
  padding: 4px;
}

.lc-space-select-option,
.lc-space-select-add {
  display: block;
  width: 100%;
  padding: 9px 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--lc-text-primary);
  text-align: left;
  font-size: 12px;
  cursor: pointer;
}

.lc-space-select-option:hover,
.lc-space-select-option.active {
  background: rgba(59, 130, 246, 0.14);
}

.lc-space-select-add {
  border-top: 1px solid var(--lc-modal-border);
  border-radius: 0;
  color: #059669;
  font-weight: 700;
}

.lc-space-select-add:hover {
  background: rgba(16, 185, 129, 0.12);
}

.lc-modal-header-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
}

.lc-modal-lang-bar {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(140, 140, 140, 0.08);
  padding: 2px 6px;
  border-radius: 6px;
  border: 1px solid var(--lc-modal-border);
}

.lc-modal-lang-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--lc-text-muted);
  text-transform: uppercase;
}

.lc-modal-lang-chip {
  background: transparent;
  border: 1px solid transparent;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.lc-modal-lang-chip.active {
  background: rgba(140, 140, 140, 0.18);
}

.lc-modal-close {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: var(--lc-text-muted);
  line-height: 1;
  padding: 3px 6px;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.lc-modal-close:hover {
  background: rgba(140, 140, 140, 0.2);
  color: var(--lc-text-primary);
}

.lc-modal-body {
  min-height: 0;
  flex: 1;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-height: none;
  overflow-y: auto;
  overscroll-behavior: contain;
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
}

/* --- Side-by-Side Editor Grid (Maintains side-by-side on mobile!) --- */
.lc-editor-grid {
  display: grid;
  /* Dynamic columns: default 2 cols side-by-side on phone screens */
  grid-template-columns: repeat(var(--lc-editor-cols, 2), minmax(0, 1fr));
  gap: 10px;
  width: 100%;
}

.lc-editor-slot {
  border-radius: 9px;
  border: 1px solid var(--lc-modal-border);
  background: var(--lc-slot-bg);
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  box-sizing: border-box;
  min-width: 0;
}

.lc-editor-slot:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
  background: var(--lc-input-bg);
}

.lc-slot-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.lc-slot-badge {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.lc-slot-hint {
  font-size: 10px;
  font-weight: 500;
  opacity: 0.55;
  color: var(--lc-text-muted);
}

.lc-slot-textarea {
  width: 100%;
  min-height: 70px;
  border: none;
  background: transparent !important;
  color: var(--lc-input-text) !important;
  font-size: 13.5px;
  line-height: 1.4;
  resize: vertical;
  outline: none;
  padding: 0;
  font-family: inherit;
  box-sizing: border-box;
}

.lc-slot-textarea::placeholder {
  color: var(--lc-input-placeholder) !important;
  opacity: 0.8;
}

/* --- Form Input & Preview --- */
.lc-form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.lc-form-label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--lc-text-badge);
}

.lc-form-input {
  width: 100%;
  padding: 9px 12px;
  border-radius: 8px;
  border: 1px solid var(--lc-modal-border);
  background: var(--lc-input-bg) !important;
  font-size: 13.5px;
  color: var(--lc-input-text) !important;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  box-sizing: border-box;
}

.lc-form-input::placeholder {
  color: var(--lc-input-placeholder) !important;
  opacity: 0.8;
}

.lc-form-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
}

.lc-preview-box {
  background: var(--lc-preview-bg) !important;
  border: 1px solid var(--lc-modal-border);
  border-radius: 8px;
  padding: 9px 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11.5px;
  color: var(--lc-preview-text) !important;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.45;
}

.lc-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  border-top: 1px solid var(--lc-modal-border);
  background: rgba(140, 140, 140, 0.04);
}

.lc-btn {
  padding: 8px 16px;
  border-radius: 7px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s ease;
}

.lc-btn-primary {
  background: #2563eb;
  color: #ffffff;
}

.lc-btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.lc-btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.lc-btn-secondary {
  background: transparent;
  border-color: var(--lc-modal-border);
  color: var(--lc-text-primary);
}

.lc-btn-secondary:hover {
  background: rgba(140, 140, 140, 0.15);
}

/* --- Tag Autocomplete Dropdown (fixed: anchored to the caret in viewport coords) --- */
.lc-tag-dropdown {
  position: fixed;
  z-index: 10050;
  background: var(--lc-modal-bg) !important;
  border: 1px solid var(--lc-modal-border);
  border-radius: 9px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45), 0 2px 6px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: lc-tag-drop-in 0.12s ease-out;
  box-sizing: border-box;
}

@keyframes lc-tag-drop-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.lc-tag-dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 10px;
  background: rgba(140, 140, 140, 0.08);
  border-bottom: 1px solid var(--lc-modal-border);
  font-size: 10.5px;
  font-weight: 700;
  color: var(--lc-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.lc-tag-dropdown-list {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 4px;
  gap: 2px;
}

.lc-tag-dropdown-list::-webkit-scrollbar {
  width: 5px;
}
.lc-tag-dropdown-list::-webkit-scrollbar-thumb {
  background: rgba(140, 140, 140, 0.3);
  border-radius: 4px;
}

.lc-tag-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 8px;
  border-radius: 6px;
  font-size: 13px;
  color: var(--lc-text-primary);
  cursor: pointer;
  transition: all 0.1s ease;
  user-select: none;
}

.lc-tag-item:hover,
.lc-tag-item.active {
  background: rgba(59, 130, 246, 0.18);
  color: #2563eb;
}

.lc-theme-dark .lc-tag-item:hover,
.lc-theme-dark .lc-tag-item.active {
  background: rgba(59, 130, 246, 0.28);
  color: #60a5fa;
}

.lc-tag-item-left {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  overflow: hidden;
}

.lc-tag-icon {
  font-size: 12px;
  font-weight: 700;
  color: #3b82f6;
  opacity: 0.85;
  flex-shrink: 0;
}

.lc-tag-label {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lc-tag-label b {
  font-weight: 700;
  color: #2563eb;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.lc-theme-dark .lc-tag-label b {
  color: #93c5fd;
}

.lc-tag-count {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 10px;
  background: rgba(140, 140, 140, 0.14);
  color: var(--lc-text-muted);
  flex-shrink: 0;
  margin-left: 6px;
}

.lc-tag-item-create {
  border-top: 1px dashed var(--lc-modal-border);
  margin-top: 3px;
  padding-top: 6px;
  color: #10b981;
}

.lc-tag-item-create .lc-tag-icon {
  color: #10b981;
}

.lc-tag-dropdown-empty {
  padding: 10px 12px;
  font-size: 12px;
  color: var(--lc-text-muted);
  text-align: center;
  font-style: italic;
}

/* --- Language Card Header Box (JSON + copy button, modal bottom & info popup) --- */
.lc-header-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--lc-preview-bg) !important;
  border: 1px solid var(--lc-modal-border);
  border-radius: 8px;
  padding: 6px 6px 6px 12px;
}

.lc-header-json {
  flex: 1;
  min-width: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11.5px;
  color: var(--lc-preview-text) !important;
  word-break: break-all;
  line-height: 1.45;
}

.lc-header-copy-btn {
  flex-shrink: 0;
  background: rgba(140, 140, 140, 0.12);
  border: 1px solid var(--lc-modal-border);
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  line-height: 1;
  padding: 5px 8px;
  transition: all 0.15s ease;
}

.lc-header-copy-btn:hover {
  background: rgba(59, 130, 246, 0.18);
  border-color: rgba(59, 130, 246, 0.4);
}

.lc-header-copy-btn:active {
  transform: scale(0.94);
}

/* --- Native Quick Actions (Pin / Edit / Archive) in memo card headers ---
   The buttons clone the native three-dots button's utility classes at
   injection time (exact theme match); these rules only add layout safety
   and the small-screen policy. */
.lc-quick-action {
  flex-shrink: 0;
  cursor: pointer;
}

/* Parked far away from the action cluster (left of the timestamp) on purpose,
   e.g. Delete — a little extra gap keeps it clear of the time text. */
.lc-quick-action-far-left {
  margin-right: 6px;
}

/* Very narrow phones: three icons + reaction + three-dots would cramp the
   header, so keep the three-dots menu as the only path there. */
@media (max-width: 479px) {
  .lc-quick-action {
    display: none !important;
  }
}

/* --- Space Info Popup (opened from the management button) --- */
.lc-space-info-overlay {
  z-index: 10060;
}

.lc-space-info-dialog {
  max-width: 460px;
}

.lc-space-info-dialog .lc-modal-body {
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--lc-text-primary);
}

.lc-space-info-dialog .lc-modal-body p {
  margin: 0 0 10px;
}

.lc-space-info-dialog .lc-modal-body p:last-child {
  margin-bottom: 0;
}

.lc-space-info-dialog .lc-modal-body ol,
.lc-space-info-dialog .lc-modal-body ul {
  margin: 0 0 10px;
  padding-left: 22px;
}

.lc-space-info-dialog .lc-modal-body li {
  margin-bottom: 4px;
}

.lc-space-info-name {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 14px;
  font-weight: 700;
  color: #059669;
  padding: 6px 10px;
  border-radius: 7px;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  word-break: break-all;
  margin-bottom: 4px;
}

/* Secondary line: the space uid (API resource name), shown under the title */
.lc-space-info-uid {
  font-size: 11px;
  color: var(--lc-text-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  word-break: break-all;
  margin-bottom: 10px;
}

.lc-space-info-list .lc-space-info-uid {
  display: block;
  margin-bottom: 0;
}

.lc-theme-dark .lc-space-info-name {
  color: #34d399;
}

/* --- V3: Explanation area (below sections, own toggle above) --- */
.lc-card-explanations {
  display: grid;
  grid-template-columns: repeat(var(--lc-cols, 1), minmax(0, 1fr));
  gap: 8px;
  margin-top: 8px;
}

.lc-card-explanation {
  padding: 8px 10px;
  border: 1px solid var(--lc-border-card);
  border-radius: 0;
  background: var(--lc-bg-card);
  color: var(--lc-text-muted);
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  box-sizing: border-box;
}

.lc-card-explanation-global {
  margin-top: 8px;
}

@media (min-width: 640px) {
  .lc-card-explanation {
    padding: 10px 14px;
    border-radius: 0;
  }
}

.lc-explanation-panel {
  margin-top: 10px;
}

.lc-explanation-section-toggles {
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.lc-explanation-inputs {
  display: grid;
  grid-template-columns: repeat(var(--lc-explanation-cols, 1), minmax(0, 1fr));
  gap: 8px;
}

.lc-explanation-slot {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.lc-explanation-section-toggle {
  flex: 0 0 auto;
}

.lc-explanation-section-toggle.active.language-hidden {
  border-color: #9ca3af !important;
  color: #9ca3af !important;
}

.lc-unified-explanation-slot {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}

.lc-explanation-input {
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
  min-height: 52px;
  padding: 8px 10px;
  border: 1px solid var(--lc-border-card);
  border-radius: 8px;
  background: var(--lc-input-bg);
  color: var(--lc-input-text);
  font-size: 12px;
  font-family: inherit;
}

.lc-explanation-input:focus {
  outline: 2px solid rgba(59, 130, 246, 0.45);
  outline-offset: 1px;
}
/* --- V3: Card type / space manager (R4) --- */
.lc-manager {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.lc-manager-section {
  padding: 10px 12px;
  border: 1px solid var(--lc-border-card);
  border-radius: 10px;
  background: var(--lc-bg-card);
}

.lc-manager-section h4 {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--lc-text-primary);
}

.lc-manager-hint {
  margin: 4px 0 8px;
  font-size: 11px;
  line-height: 1.5;
  color: var(--lc-text-muted);
}

.lc-type-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lc-type-card {
  border: 1px solid var(--lc-border-card);
  border-radius: 10px;
  background: var(--lc-modal-bg);
  overflow: hidden;
}

.lc-type-card.lc-type-in-use {
  border-color: #34d399;
  box-shadow: 0 0 0 1px rgba(52, 211, 153, 0.25);
}

.lc-type-card.lc-type-open {
  border-color: #38bdf8;
  box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.35);
}

.lc-type-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
}

.lc-type-card-title {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-align: left;
  font-size: 12px;
  color: var(--lc-text-primary);
}

.lc-type-card-title b {
  font-size: 13px;
}

.lc-type-meta {
  font-size: 10px;
  color: var(--lc-text-muted);
}

.lc-type-badge-use {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 8px;
  background: rgba(52, 211, 153, 0.18);
  color: #34d399;
}

.lc-type-card-body {
  padding: 4px 10px 12px;
  border-top: 1px solid var(--lc-border-card);
}

.lc-type-row-actions,
.lc-manager-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.lc-manager-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
  margin-bottom: 8px;
}

.lc-manager-create-space {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lc-manager-create-space .lc-form-input {
  min-width: 0;
  flex: 1;
}

@media (max-width: 520px) {
  .lc-manager-create-space {
    align-items: stretch;
    flex-direction: column;
  }
}

.lc-editor-block {
  margin: 12px 0;
  padding: 10px 12px;
  border: 1px solid var(--lc-border-card);
  border-radius: 10px;
  background: var(--lc-modal-bg);
}

.lc-editor-block h4 {
  margin: 0 0 6px;
  font-size: 13px;
  color: var(--lc-text-primary);
}

/* --- V3: migration wizard (own window) --- */
.lc-migration-dialog {
  max-width: 820px;
  max-height: 86vh;
  overflow: auto;
}

.lc-migration-note {
  margin-bottom: 10px;
  padding: 10px 12px;
  border: 1px solid var(--lc-border-card);
  border-radius: 10px;
  background: var(--lc-modal-bg);
}

.lc-migration-note-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--lc-text-primary);
}

.lc-migration-key-row {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.lc-migration-key {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  color: var(--lc-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
}

.lc-migration-target {
  padding: 6px 8px;
  font-size: 12px;
}

.lc-migration-sample {
  font-size: 11px;
  color: var(--lc-text-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lc-migration-save {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--lc-text-muted);
}

@media (max-width: 640px) {
  .lc-migration-key-row {
    grid-template-columns: 1fr;
  }
}

.lc-section-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr)) repeat(4, 28px);
  gap: 4px;
  margin-bottom: 5px;
}

.lc-section-row .lc-form-input {
  min-width: 0;
  padding: 5px 7px;
  font-size: 11px;
}

.lc-manager-status {
  font-size: 12px;
  color: #059669;
  min-height: 16px;
}

.lc-manager-error,
.lc-manager-status.lc-manager-error {
  color: #ef4444;
}

.lc-space-info-dialog {
  max-width: 860px;
}

@media (max-width: 640px) {
  .lc-section-row {
    grid-template-columns: repeat(2, minmax(0, 1fr)) repeat(4, 28px);
  }
  .lc-type-card-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
`;

  // src/config.js
  var CONFIG = {
    typeIdentifier: "lc",
    cardVersion: 2,
    dedicatedSpaceKeyword: null,
    // Ordered: JA (left) -> EN (middle) -> ZH (right)
    // `defaultHidden` = the section starts closed when creating a new card
    // (V2 behaviour: the editor opened with EN+ZH). Same idea as the marker's
    // per-section `defaultHidden`, this one only seeds the built-in template.
    languages: [
      { key: "ja", label: "日本語", code: "JA", color: "#fbbf24", ttsLang: "ja-JP", placeholder: "e.g. セレンディピティ", defaultHidden: true },
      { key: "en", label: "English", code: "EN", color: "#38bdf8", ttsLang: "en-US", placeholder: "e.g. serendipity" },
      { key: "zh", label: "中文", code: "ZH", color: "#34d399", ttsLang: "zh-CN", placeholder: "e.g. 意外发现珍宝的运气 / 缘分" }
    ],
    // Native memo actions surfaced as one-click icon buttons in the card
    // header (left of the three-dots "More" menu). Each entry:
    //   label   - button aria-label / tooltip
    //   path    - menu labels to walk (last entry is clicked); supports
    //             submenus, e.g. ['Copy', 'Copy Content']
    //   icon    - lucide SVG markup shown on the button
    //   iconName- lucide class fallback used when the menu label changes
    //             (e.g. "Pin" -> "Unpin" once pinned)
    //   menuItemSelector - optional native menu selector; label/icon matching
    //             is always used as a fallback when it matches nothing
    //   placement - optional 'far-left': renders the button at the far left of
    //             the memo row (left of the timestamp), AWAY from the action
    //             cluster, so destructive actions can't be hit by accident.
    // Add / remove entries to change the quick action set.
    quickActions: [
      {
        // Native DOM (0.31.0): Delete lives in the "More" submenu, not in the
        // top-level menu, and its item has data-variant="default" (no
        // destructive variant to select). So match it by label / lucide icon.
        label: "Delete",
        path: ["More", "Delete"],
        iconName: "lucide-trash",
        placement: "far-left",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash" aria-hidden="true"><path d="M3 6h18"></path><path d="M19 6v14c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V6"></path><path d="M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>'
      },
      {
        label: "Pin",
        path: ["Pin"],
        iconName: "lucide-bookmark-plus",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bookmark-plus" aria-hidden="true"><path d="M12 7v6"></path><path d="M15 10H9"></path><path d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z"></path></svg>'
      },
      {
        label: "Edit",
        path: ["Edit"],
        iconName: "lucide-pen-line",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pen-line" aria-hidden="true"><path d="M13 21h8"></path><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path></svg>'
      },
      {
        label: "Archive",
        path: ["Archive"],
        iconName: "lucide-archive",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-archive" aria-hidden="true"><rect width="20" height="5" x="2" y="3" rx="1"></rect><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path><path d="M10 12h4"></path></svg>'
      },
      {
        label: "Copy Content",
        path: ["Copy", "Copy Content"],
        iconName: "lucide-copy",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>'
      }
    ]
  };
  var LS_GLOBAL_LANGS_KEY = "memos_lc_enabled_langs_v2";

  // src/state.js
  var state = {
    modalActiveLangs: ["en", "zh"],
    editingMemoName: null,
    spaceResolutionInFlight: null,
    types: [],
    allSpaces: [],
    activeType: null,
    activeTypeManuallySelected: false,
    onQuickTypeSelected: null,
    memoSpaceCache: /* @__PURE__ */ new Map(),
    memoSpaceWarmed: false,
    editingVersion: 2,
    editingType: null,
    hiddenExplanationSections: []
  };
  function getGlobalEnabledLangs() {
    try {
      const saved = localStorage.getItem(LS_GLOBAL_LANGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
    }
    return ["en", "zh"];
  }

  // src/card-types.js
  var V3_VERSION = 3;
  function stripSpacePrefix(name) {
    return String(name || "").replace(/^spaces\//, "");
  }
  function defaultSections() {
    return CONFIG.languages.map((l) => ({
      key: l.key,
      label: l.label,
      code: l.code,
      color: l.color,
      defaultHidden: l.defaultHidden === true,
      placeholder: l.placeholder || ""
    }));
  }
  function extractMarker(description) {
    if (!description || !description.includes("{")) return null;
    const start = description.indexOf("{");
    const end = description.lastIndexOf("}");
    if (end <= start) return null;
    try {
      const data = JSON.parse(description.substring(start, end + 1));
      if (!data || typeof data !== "object" || Array.isArray(data)) return null;
      return data._t === CONFIG.typeIdentifier ? data : null;
    } catch (e) {
      return null;
    }
  }
  function deriveCode(label, key) {
    const words = String(label || "").trim().split(/\s+/).filter(Boolean);
    const initials = words.map((w) => (w.match(/[A-Za-z0-9]/) || [])[0]).filter(Boolean);
    if (initials.length >= 2) return (initials[0] + initials[1]).toUpperCase();
    const alnum = String(label || key).match(/[A-Za-z0-9]{1,2}/);
    return String(alnum ? alnum[0] : key).slice(0, 2).toUpperCase();
  }
  function normalizeSection(section) {
    if (!section || !section.key) return null;
    const key = String(section.key).trim();
    if (!key) return null;
    const label = String(section.label || key);
    return {
      key,
      label,
      code: deriveCode(label, key),
      color: String(section.color || "#38bdf8"),
      defaultHidden: section.defaultHidden === true,
      placeholder: String(section.placeholder || "")
    };
  }
  function normalizeType(marker, space) {
    if (!marker || marker._t !== CONFIG.typeIdentifier) return null;
    const isV3 = marker.v === V3_VERSION || marker.v === String(V3_VERSION);
    const spaceName = space && space.name || "";
    const spaceTitle = space && space.title || "";
    const hasSections = isV3 && Array.isArray(marker.sections);
    const rawSections = hasSections ? marker.sections : [];
    const sections = hasSections ? rawSections.map(normalizeSection).filter(Boolean) : defaultSections();
    const aliases = isV3 && marker.sectionAliases && typeof marker.sectionAliases === "object" ? marker.sectionAliases : {};
    return {
      id: String(isV3 && marker.typeId || spaceName || "default"),
      name: String(isV3 && marker.name || spaceTitle || stripSpacePrefix(spaceName) || "Language Card"),
      order: Number.isFinite(Number(marker.order)) ? Number(marker.order) : 0,
      spaceName,
      spaceTitle,
      version: isV3 ? V3_VERSION : 2,
      explanationMode: marker.explanationMode === "global" ? "global" : "per-section",
      sections,
      sectionAliases: { ...aliases },
      marker
    };
  }
  function defaultType(space) {
    const type = normalizeType({ _t: CONFIG.typeIdentifier, v: 2 }, space || { name: "", title: "" });
    type.id = "default";
    type.name = space && space.title || "Default language card";
    type.order = -1;
    return type;
  }
  function markerFromType(type) {
    return JSON.stringify({
      _t: CONFIG.typeIdentifier,
      v: V3_VERSION,
      typeId: type.id,
      name: type.name,
      order: type.order,
      explanationMode: type.explanationMode,
      sections: type.sections.map((s) => {
        const out = { key: s.key, label: s.label, color: s.color };
        if (s.defaultHidden) out.defaultHidden = true;
        return out;
      }),
      sectionAliases: type.sectionAliases
    });
  }
  function sortTypes(types) {
    return [...types].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  }
  function sectionKeys(type) {
    return type.sections.map((s) => s.key);
  }
  function typeForSpace(types, spaceName) {
    if (!spaceName) return null;
    return types.find((t) => t.spaceName === spaceName) || null;
  }
  function activeTypeForNew(types, currentSpace) {
    return typeForSpace(types, currentSpace) || sortTypes(types)[0] || defaultType(null);
  }
  function typeForMemo(types, memoName, currentSpace, memoSpaceCache) {
    const cachedSpace = memoName && memoSpaceCache ? memoSpaceCache.get(memoName) : null;
    return typeForSpace(types, cachedSpace) || typeForSpace(types, currentSpace) || activeTypeForNew(types, currentSpace);
  }
  function valueForSection(values, type, key) {
    if (values[key] !== void 0 && values[key] !== null) return values[key];
    for (const [oldKey, newKey] of Object.entries(type.sectionAliases || {})) {
      if (newKey === key && values[oldKey] !== void 0) return values[oldKey];
    }
    return "";
  }
  function mapSectionKeys(data, aliasMap, keepUnknown = true) {
    const out = {};
    for (const [key, value] of Object.entries(data || {})) {
      if (key === "_e") {
        if (value && typeof value === "object" && !Array.isArray(value)) {
          const mapped = {};
          for (const [k, v] of Object.entries(value)) mapped[aliasMap[k] || k] = v;
          out._e = mapped;
        } else {
          out._e = value;
        }
        continue;
      }
      if (key === "_s" && Array.isArray(value)) {
        out._s = value.map((sectionKey) => aliasMap[sectionKey] || sectionKey);
        continue;
      }
      if (key === "_eh" && Array.isArray(value)) {
        out._eh = value.map((sectionKey) => aliasMap[sectionKey] || sectionKey);
        continue;
      }
      const target = aliasMap[key] || key;
      if (target !== key || keepUnknown || ["_t", "v", "_x"].includes(key)) {
        out[target] = value;
      }
    }
    return out;
  }

  // src/utils.js
  function syncThemeClass() {
    let isDark = false;
    const bodyBg = window.getComputedStyle(document.body).backgroundColor;
    const rgb = bodyBg.match(/\d+/g);
    if (rgb && rgb.length >= 3) {
      const yiq = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1e3;
      isDark = yiq < 128;
    } else {
      isDark = document.documentElement.classList.contains("dark") || document.body.classList.contains("dark") || document.documentElement.style.colorScheme === "dark" || window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    document.body.classList.toggle("lc-theme-dark", isDark);
  }
  function getCurrentSpace() {
    const path = window.location.pathname;
    const match = path.match(/\/s\/([^\/]+)/);
    if (match && match[1]) {
      return match[1].startsWith("spaces/") ? match[1] : `spaces/${match[1]}`;
    }
    return null;
  }
  function stripSpacePrefix2(name) {
    return String(name || "").replace(/^spaces\//, "");
  }
  function escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  async function copyText(text, btn) {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        ok = document.execCommand("copy");
      } catch (e2) {
        ok = false;
      }
      document.body.removeChild(ta);
    }
    if (btn) {
      const prev = btn.innerText;
      btn.innerText = ok ? "✅" : "❌";
      setTimeout(() => {
        btn.innerText = prev;
      }, 1200);
    }
  }

  // src/card-model.js
  function parseCardMemo(rawText, currentSpace) {
    if (!rawText || !rawText.includes("{")) return null;
    const startIdx = rawText.indexOf("{");
    const endIdx = rawText.lastIndexOf("}");
    if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) return null;
    const jsonCandidate = rawText.substring(startIdx, endIdx + 1);
    const tagsCandidate = rawText.substring(endIdx + 1);
    let cardData = null;
    try {
      cardData = JSON.parse(jsonCandidate);
    } catch (e) {
      const fields = {};
      const reg = /"(_t|en|ja|jp|zh|cn|v)"\s*:\s*"([\s\S]*?)"(?=\s*[,}])/g;
      let m;
      while ((m = reg.exec(jsonCandidate)) !== null) {
        fields[m[1]] = m[2].replace(/\\n/g, "\n").replace(/\\"/g, '"');
      }
      if (Object.keys(fields).length > 0) {
        cardData = fields;
      }
    }
    if (!cardData || typeof cardData !== "object") return null;
    if (cardData._t && cardData._t !== CONFIG.typeIdentifier) return null;
    const hasLang = ["en", "ja", "jp", "zh", "cn"].some((k) => k in cardData);
    const isExplicitCard = cardData._t === CONFIG.typeIdentifier;
    const isDedicatedSpace = Boolean(
      CONFIG.dedicatedSpaceKeyword && currentSpace && currentSpace.toLowerCase().includes(CONFIG.dedicatedSpaceKeyword.toLowerCase())
    );
    const isLegacyCard = (cardData.v || cardData.v === 0) && hasLang;
    if (!isExplicitCard && !isDedicatedSpace && !isLegacyCard) {
      return null;
    }
    const tags = tagsCandidate.match(/#[^\s#]+/g) || [];
    const hasValues = ["en", "ja", "jp", "zh", "cn"].some(
      (k) => cardData[k] && String(cardData[k]).trim().length > 0
    );
    if (!hasValues && tags.length === 0) {
      return null;
    }
    return { data: cardData, tags, rawText };
  }
  function cardLangValue(data, langKey) {
    if (!data) return "";
    const legacy = langKey === "ja" ? data["jp"] : langKey === "zh" ? data["cn"] : null;
    const val = data[langKey] || legacy || "";
    return String(val).trim();
  }
  function cardPresentLangs(data) {
    return CONFIG.languages.filter((lang) => cardLangValue(data, lang.key)).map((lang) => lang.key);
  }
  function normalizeTags(rawTags) {
    const raw = String(rawTags || "").trim();
    return raw ? raw.split(/[\s,]+/).map((t) => t.startsWith("#") ? t : `#${t}`).filter((t) => t.length > 1).join(" ") : "";
  }
  function parseCardV3(rawText) {
    if (!rawText || !rawText.includes("{")) return null;
    const start = rawText.indexOf("{");
    const end = rawText.lastIndexOf("}");
    if (end <= start) return null;
    let data;
    try {
      data = JSON.parse(rawText.substring(start, end + 1));
    } catch (e) {
      return null;
    }
    if (!data || typeof data !== "object" || Array.isArray(data)) return null;
    if (data._t !== CONFIG.typeIdentifier || data.v !== V3_VERSION) return null;
    const tags = rawText.substring(end + 1).match(/#[^\s#]+/g) || [];
    const values = {};
    for (const [key, value] of Object.entries(data)) {
      if (!["_t", "v", "_e", "_u", "_s", "_x", "_eh"].includes(key)) values[key] = value;
    }
    const hasValues = Object.values(values).some((v) => v && String(v).trim().length > 0);
    if (!hasValues && tags.length === 0) return null;
    return {
      version: V3_VERSION,
      data,
      values,
      tags,
      explanations: data._e === void 0 ? {} : data._e,
      unifiedExplanation: typeof data._u === "string" ? data._u : typeof data._e === "string" ? data._e : "",
      enabledSections: Array.isArray(data._s) ? data._s.filter((key) => typeof key === "string") : Object.keys(values).filter((key) => values[key] && String(values[key]).trim()),
      hiddenExplanationSections: Array.isArray(data._eh) ? data._eh.filter((key) => typeof key === "string") : [],
      showExplanation: data._x !== false,
      rawText
    };
  }
  function parseAnyCard(rawText, currentSpace) {
    const v3 = parseCardV3(rawText);
    if (v3) return v3;
    const legacy = parseCardMemo(rawText, currentSpace);
    if (!legacy) return null;
    return {
      version: 2,
      data: legacy.data,
      values: legacy.data,
      tags: legacy.tags,
      explanations: {},
      unifiedExplanation: "",
      enabledSections: [],
      hiddenExplanationSections: [],
      showExplanation: false,
      rawText: legacy.rawText
    };
  }
  function buildCardContentV3(type, values, explanations, showExplanation, tags, enabledSections, unifiedExplanation, hiddenExplanationSections) {
    const data = { _t: CONFIG.typeIdentifier, v: V3_VERSION };
    let hasAny = false;
    type.sections.forEach((section) => {
      const val = String(values && values[section.key] || "").trim();
      if (val) {
        data[section.key] = val;
        hasAny = true;
      }
    });
    const mapped = {};
    type.sections.forEach((section) => {
      const text = String(explanations && typeof explanations === "object" && explanations[section.key] || "").trim();
      if (text) mapped[section.key] = text;
    });
    if (Object.keys(mapped).length) data._e = mapped;
    const unifiedText = String(
      unifiedExplanation || (typeof explanations === "string" ? explanations : "")
    ).trim();
    if (unifiedText) data._u = unifiedText;
    const visible = type.sections.filter((section) => (enabledSections || []).includes(section.key) && data[section.key]).map((section) => section.key);
    data._s = visible;
    if (showExplanation === false) data._x = false;
    const hiddenExplanations = type.sections.filter((section) => (hiddenExplanationSections || []).includes(section.key)).map((section) => section.key);
    if (hiddenExplanations.length) data._eh = hiddenExplanations;
    const normalizedTags = normalizeTags(tags);
    const content = JSON.stringify(data) + (normalizedTags ? `
${normalizedTags}` : "");
    return { data, content, tags: normalizedTags, hasAny };
  }
  function valuesFor(parsed, type) {
    const out = {};
    type.sections.forEach((section) => {
      out[section.key] = String(valueForSection(parsed.values || parsed.data || {}, type, section.key) || "").trim();
    });
    return out;
  }
  function explanationsFor(parsed, type) {
    const raw = parsed.explanations || {};
    if (type.explanationMode === "global") {
      return typeof raw === "string" ? raw : Object.values(raw).join("\n");
    }
    const out = {};
    type.sections.forEach((section) => {
      let text = raw && typeof raw === "object" && raw[section.key] || "";
      for (const [oldKey, newKey] of Object.entries(type.sectionAliases || {})) {
        if (newKey === section.key && raw && typeof raw === "object" && raw[oldKey]) {
          text = raw[oldKey];
        }
      }
      out[section.key] = String(text).trim();
    });
    return out;
  }
  function sectionExplanationsFor(parsed, type) {
    const raw = parsed.explanations || {};
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return Object.fromEntries(type.sections.map((section) => [section.key, ""]));
    }
    return explanationsFor({ ...parsed, explanations: raw }, { ...type, explanationMode: "per-section" });
  }
  function unifiedExplanationFor(parsed, type) {
    if (typeof parsed.unifiedExplanation === "string" && parsed.unifiedExplanation) {
      return parsed.unifiedExplanation;
    }
    if (typeof parsed.explanations === "string") return parsed.explanations;
    if (type && type.explanationMode === "global" && parsed.explanations && typeof parsed.explanations === "object") {
      return Object.values(parsed.explanations).join("\n");
    }
    return "";
  }

  // src/api.js
  function isLegacyFallbackStatus(status2) {
    return status2 === 404 || status2 === 410;
  }
  async function fetchJsonWithFallback(paths, token) {
    let lastRes = null;
    for (const path of paths) {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(path, { headers, credentials: "include" });
      if (isLegacyFallbackStatus(res.status)) {
        lastRes = res;
        continue;
      }
      return res;
    }
    return lastRes;
  }
  async function fetchAllSpaces(token) {
    const spaces = [];
    let pageToken = "";
    do {
      const query = pageToken ? `?pageSize=1000&pageToken=${encodeURIComponent(pageToken)}` : "?pageSize=1000";
      const res = await fetchJsonWithFallback([`/api/spaces${query}`, `/api/v1/spaces${query}`], token);
      if (!res || !res.ok) throw new Error(`ListSpaces failed: HTTP ${res ? res.status : "no response"}`);
      const json = await res.json();
      if (Array.isArray(json.spaces)) spaces.push(...json.spaces);
      pageToken = json.nextPageToken || "";
    } while (pageToken);
    return spaces;
  }
  async function getMemosAuthToken(forceRefresh = false) {
    if (!forceRefresh) {
      try {
        const stored = localStorage.getItem("memos_access_token");
        const expiresStr = localStorage.getItem("memos_token_expires_at");
        if (stored) {
          if (expiresStr) {
            const exp = new Date(expiresStr);
            if (exp.getTime() - Date.now() > 3e4) {
              return stored;
            }
          } else {
            return stored;
          }
        }
      } catch (e) {
      }
    }
    const refreshEndpoints = [
      { url: "/memos.api.AuthService/RefreshToken", connect: true },
      { url: "/memos.api.v1.AuthService/RefreshToken", connect: true },
      { url: "/api/auth/refresh", connect: false },
      { url: "/api/v1/auth/refresh", connect: false }
    ];
    for (const endpoint of refreshEndpoints) {
      try {
        const headers = { "Content-Type": "application/json" };
        if (endpoint.connect) headers["Connect-Protocol-Version"] = "1";
        const res = await fetch(endpoint.url, {
          method: "POST",
          headers,
          credentials: "include",
          body: "{}"
        });
        if (!res.ok) continue;
        const data = await res.json();
        const token = data.accessToken || data.access_token;
        if (token) {
          try {
            localStorage.setItem("memos_access_token", token);
            const expires = data.accessTokenExpireTime || data.expiresAt || data.expires_at;
            if (expires) localStorage.setItem("memos_token_expires_at", expires);
          } catch (e) {
          }
          return token;
        }
      } catch (e) {
      }
    }
    try {
      const pat = localStorage.getItem("memos_pat") || localStorage.getItem("memos_token") || localStorage.getItem("memos_access_token");
      if (pat) return pat;
    } catch (e) {
    }
    return null;
  }
  async function sendJsonWithFallback(paths, method, body, token) {
    let lastRes = null;
    for (const path of paths) {
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(path, {
        method,
        headers,
        credentials: "include",
        body: JSON.stringify(body)
      });
      if (isLegacyFallbackStatus(res.status)) {
        lastRes = res;
        continue;
      }
      return res;
    }
    return lastRes;
  }
  async function updateSpaceDescription(spaceName, description, token) {
    const id = encodeURIComponent(String(spaceName || "").replace(/^spaces\//, ""));
    return sendJsonWithFallback(
      [`/api/spaces/${id}?updateMask=description`, `/api/v1/spaces/${id}?updateMask=description`],
      "PATCH",
      { name: spaceName, description },
      token
    );
  }
  async function createSpace(title, description, token) {
    return sendJsonWithFallback(
      ["/api/spaces", "/api/v1/spaces"],
      "POST",
      { title, description },
      token
    );
  }
  async function listMemosForSpace(spaceName, token) {
    const parent = encodeURIComponent(spaceName || "");
    const paths = [
      `/api/memos?parent=${parent}&pageSize=1000`,
      `/api/v1/memos?parent=${parent}&pageSize=1000`
    ];
    const res = await fetchJsonWithFallback(paths, token);
    if (!res || !res.ok) throw new Error(`ListMemos failed: HTTP ${res ? res.status : "no response"}`);
    const json = await res.json();
    return Array.isArray(json.memos) ? json.memos : [];
  }
  async function patchMemoContent(memoName, content, token) {
    const id = encodeURIComponent(String(memoName || "").replace(/^memos\//, ""));
    return sendJsonWithFallback(
      [`/api/memos/${id}?updateMask=content`, `/api/v1/memos/${id}?updateMask=content`],
      "PATCH",
      { content },
      token
    );
  }

  // src/tags.js
  var tagStore = {
    tags: /* @__PURE__ */ new Map(),
    // cleanTag -> count
    lastFetched: 0,
    isFetching: false,
    add(tag, count = 1) {
      if (!tag) return;
      const clean = String(tag).replace(/^[#＃]/, "").trim();
      if (!clean) return;
      const prev = this.tags.get(clean) || 0;
      this.tags.set(clean, Math.max(prev, count));
    },
    scanPage() {
      document.querySelectorAll(".lc-tag-chip").forEach((el) => {
        this.add(el.innerText);
      });
      document.querySelectorAll("[data-lc-raw]").forEach((el) => {
        const raw = el.getAttribute("data-lc-raw") || "";
        const matches = raw.match(/#[^\s#]+/g) || [];
        matches.forEach((m) => this.add(m));
      });
      document.querySelectorAll('button[aria-label^="#"], button[aria-label*="#"], [data-tag], a[href*="tag="]').forEach((el) => {
        const text = el.getAttribute("data-tag") || el.getAttribute("aria-label") || el.innerText || "";
        const matches = text.match(/#[^\s#]+/g) || [];
        matches.forEach((m) => this.add(m));
      });
    },
    async fetchServer() {
      const now = Date.now();
      if (this.isFetching || now - this.lastFetched < 45e3 && this.tags.size > 0) {
        return;
      }
      this.isFetching = true;
      try {
        const token = await getMemosAuthToken();
        const headers = {
          "Content-Type": "application/json",
          "Connect-Protocol-Version": "1"
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const ingest = (json) => {
          const stats = json && (json.userStats || json.stats) || [];
          let found = false;
          stats.forEach((stat) => {
            const counts = stat && (stat.tagCounts || stat.tagCount) || null;
            if (counts && typeof counts === "object") {
              Object.entries(counts).forEach(([tag, cnt]) => {
                this.add(tag, Number(cnt) || 1);
                found = true;
              });
            }
          });
          return found;
        };
        const res = await fetch("/memos.api.UserService/ListUserStats", {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({ parent: "users/-" })
        });
        if (res.ok) {
          const json = await res.json();
          if (ingest(json)) {
            this.lastFetched = Date.now();
            return;
          }
        }
        const resLegacy = await fetch("/memos.api.v1.UserService/ListAllUserStats", {
          method: "POST",
          headers,
          credentials: "include",
          body: "{}"
        });
        if (resLegacy.ok) {
          const jsonLegacy = await resLegacy.json();
          if (ingest(jsonLegacy)) {
            this.lastFetched = Date.now();
            return;
          }
        }
        for (const restUrl of ["/api/users/-/stats", "/api/v1/users:stats"]) {
          const res2 = await fetch(restUrl, {
            headers: token ? { "Authorization": `Bearer ${token}` } : {},
            credentials: "include"
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
      } finally {
        this.isFetching = false;
      }
    }
  };
  function matchTagRank(tag, typed) {
    if (!typed) return 0;
    const lowerTag = tag.toLowerCase();
    const idx = lowerTag.indexOf(typed);
    if (idx < 0) return -1;
    if (idx === 0) return 0;
    if (lowerTag[idx - 1] === "/") return 1;
    return 2;
  }
  function getRankedTagMatches(query) {
    const typed = (query || "").toLowerCase().trim();
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
  var activeAutocomplete = {
    inputEl: null,
    tokenStart: 0,
    tokenEnd: 0,
    query: "",
    items: [],
    highlightedIndex: 0,
    hasExactMatch: false
  };
  function getOrCreateTagDropdown() {
    let dropdown = document.getElementById("lc-tag-dropdown");
    if (!dropdown) {
      dropdown = document.createElement("div");
      dropdown.id = "lc-tag-dropdown";
      dropdown.className = "lc-tag-dropdown";
      dropdown.style.display = "none";
      const dialog = document.querySelector(".lc-modal-dialog");
      if (dialog) {
        dialog.appendChild(dropdown);
      } else {
        document.body.appendChild(dropdown);
      }
      document.addEventListener("scroll", () => {
        const dd = document.getElementById("lc-tag-dropdown");
        if (!dd || dd.style.display === "none") return;
        const inputEl = activeAutocomplete.inputEl;
        if (!inputEl || !inputEl.isConnected) {
          hideTagAutocomplete();
          return;
        }
        const scroller = inputEl.closest(".lc-modal-body");
        if (scroller) {
          const inputRect = inputEl.getBoundingClientRect();
          const scrollRect = scroller.getBoundingClientRect();
          if (inputRect.bottom < scrollRect.top || inputRect.top > scrollRect.bottom) {
            hideTagAutocomplete();
            return;
          }
        }
        positionDropdown(dd, inputEl);
      }, true);
      window.addEventListener("resize", () => {
        const dd = document.getElementById("lc-tag-dropdown");
        if (dd && dd.style.display !== "none" && activeAutocomplete.inputEl) {
          positionDropdown(dd, activeAutocomplete.inputEl);
        }
      });
    }
    return dropdown;
  }
  function hideTagAutocomplete() {
    const dropdown = document.getElementById("lc-tag-dropdown");
    if (dropdown) dropdown.style.display = "none";
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
    const hasExact = matches.some((m) => m.tag.toLowerCase() === query.toLowerCase());
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
      let listHtml = "";
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
        const countBadge = m.count > 0 ? `<span class="lc-tag-count">${m.count}</span>` : "";
        listHtml += `
          <div class="lc-tag-item ${idx === 0 ? "active" : ""}" data-index="${idx}" data-tag="${escapeHtml(m.tag)}">
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
          <div class="lc-tag-item lc-tag-item-create ${matches.length === 0 ? "active" : ""}" data-index="${createIdx}" data-tag="${escapeHtml(query)}">
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
    dropdown.querySelectorAll(".lc-tag-item").forEach((item) => {
      item.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const tag = item.getAttribute("data-tag");
        if (tag) applyTagSelection(tag);
      });
      item.addEventListener("mouseenter", () => {
        const idx = parseInt(item.getAttribute("data-index"), 10);
        if (!isNaN(idx)) {
          activeAutocomplete.highlightedIndex = idx;
          updateDropdownHighlight(dropdown);
        }
      });
    });
    positionDropdown(dropdown, targetEl);
  }
  function updateDropdownHighlight(dropdown) {
    dropdown.querySelectorAll(".lc-tag-item").forEach((item, idx) => {
      item.classList.toggle("active", idx === activeAutocomplete.highlightedIndex);
      if (idx === activeAutocomplete.highlightedIndex) {
        item.scrollIntoView({ block: "nearest" });
      }
    });
  }
  function getCaretCoordinates(el, position) {
    const properties = [
      "direction",
      "boxSizing",
      "width",
      "height",
      "overflowX",
      "overflowY",
      "borderTopWidth",
      "borderRightWidth",
      "borderBottomWidth",
      "borderLeftWidth",
      "borderStyle",
      "paddingTop",
      "paddingRight",
      "paddingBottom",
      "paddingLeft",
      "fontStyle",
      "fontVariant",
      "fontWeight",
      "fontStretch",
      "fontSize",
      "fontSizeAdjust",
      "lineHeight",
      "fontFamily",
      "textAlign",
      "textTransform",
      "textIndent",
      "textDecoration",
      "letterSpacing",
      "wordSpacing",
      "tabSize"
    ];
    const mirror = document.createElement("div");
    document.body.appendChild(mirror);
    const style = mirror.style;
    const computed = window.getComputedStyle(el);
    style.position = "absolute";
    style.visibility = "hidden";
    style.top = "0";
    style.left = "0";
    style.whiteSpace = "pre-wrap";
    style.wordWrap = "break-word";
    properties.forEach((prop) => {
      style[prop] = computed[prop];
    });
    if (el.nodeName === "INPUT") {
      style.whiteSpace = "nowrap";
      style.wordWrap = "normal";
    } else {
      style.height = "auto";
    }
    mirror.textContent = el.value.substring(0, position);
    const marker = document.createElement("span");
    marker.textContent = el.value.substring(position) || ".";
    mirror.appendChild(marker);
    const coordinates = {
      left: marker.offsetLeft - (el.scrollLeft || 0) + parseInt(computed["borderLeftWidth"], 10),
      top: marker.offsetTop + parseInt(computed["borderTopWidth"], 10),
      height: parseInt(computed["lineHeight"], 10) || parseFloat(computed["fontSize"])
    };
    document.body.removeChild(mirror);
    return coordinates;
  }
  function positionDropdown(dropdown, targetEl) {
    const dialog = document.querySelector(".lc-modal-dialog");
    if (!dialog || !targetEl) return;
    const targetRect = targetEl.getBoundingClientRect();
    let caretX = targetRect.left;
    try {
      const caret = getCaretCoordinates(targetEl, targetEl.selectionStart || 0);
      caretX = targetRect.left + caret.left;
    } catch (err) {
      caretX = targetRect.left;
    }
    const maxW = Math.min(360, Math.max(240, targetRect.width));
    dropdown.style.maxWidth = `${maxW}px`;
    dropdown.style.minWidth = "220px";
    dropdown.style.width = "max-content";
    const estHeight = 210;
    let top;
    if (window.innerHeight - targetRect.bottom < estHeight && targetRect.top > estHeight) {
      top = targetRect.top - estHeight - 4;
    } else {
      top = targetRect.bottom + 4;
    }
    dropdown.style.display = "flex";
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
    const cleanTag = selectedTag.replace(/^[#＃]/, "").trim();
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
    el.dispatchEvent(new Event("input", { bubbles: true }));
    hideTagAutocomplete();
    el.focus();
  }
  function checkTagAutocomplete(el) {
    if (!el) return;
    const pos = el.selectionStart;
    const val = el.value;
    const textBefore = val.slice(0, pos);
    let match = textBefore.match(/(?:^|\s)([#＃][^\s#＃]*)$/);
    if (!match && el.id === "lc-input-tags") {
      const tagMatch = textBefore.match(/(?:^|\s)([^\s#＃]+)$/);
      if (tagMatch) {
        match = tagMatch;
      }
    }
    if (match) {
      const token = match[1];
      const hasHash = token.startsWith("#") || token.startsWith("＃");
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
    const dropdown = document.getElementById("lc-tag-dropdown");
    const isVisible = dropdown && dropdown.style.display !== "none";
    if (!isVisible) return false;
    const totalSelectable = activeAutocomplete.items.length + (activeAutocomplete.query.length > 0 && !activeAutocomplete.hasExactMatch ? 1 : 0);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      e.stopPropagation();
      if (totalSelectable > 0) {
        activeAutocomplete.highlightedIndex = (activeAutocomplete.highlightedIndex + 1) % totalSelectable;
        updateDropdownHighlight(dropdown);
      }
      return true;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      e.stopPropagation();
      if (totalSelectable > 0) {
        activeAutocomplete.highlightedIndex = (activeAutocomplete.highlightedIndex - 1 + totalSelectable) % totalSelectable;
        updateDropdownHighlight(dropdown);
      }
      return true;
    }
    if (e.key === "Enter" || e.key === "Tab") {
      if (e.ctrlKey || e.metaKey) return false;
      e.preventDefault();
      e.stopPropagation();
      if (totalSelectable > 0) {
        let tagToSelect = "";
        if (activeAutocomplete.highlightedIndex < activeAutocomplete.items.length) {
          tagToSelect = activeAutocomplete.items[activeAutocomplete.highlightedIndex].tag;
        } else {
          tagToSelect = activeAutocomplete.query;
        }
        applyTagSelection(tagToSelect);
      }
      return true;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      hideTagAutocomplete();
      return true;
    }
    return false;
  }

  // src/spaces.js
  var LS_TARGET_SPACE_KEY = "memos_lc_target_space_v2";
  function readCachedTargetSpace() {
    try {
      const raw = localStorage.getItem(LS_TARGET_SPACE_KEY);
      if (!raw) return null;
      if (raw.startsWith("{")) {
        const parsed = JSON.parse(raw);
        return parsed && parsed.name ? { name: parsed.name, title: parsed.title || "", manual: parsed.manual === true } : null;
      }
      return { name: raw, title: "", manual: false };
    } catch (e) {
      return null;
    }
  }
  function writeCachedTargetSpace(name, title, manual = false) {
    try {
      localStorage.setItem(LS_TARGET_SPACE_KEY, JSON.stringify({
        name,
        title: title || "",
        manual: Boolean(manual)
      }));
    } catch (e) {
    }
  }
  function clearTargetSpaceCache() {
    try {
      localStorage.removeItem(LS_TARGET_SPACE_KEY);
    } catch (e) {
    }
  }
  async function getAllSpaces(force) {
    if (!force && state.allSpaces.length) return state.allSpaces;
    const token = await getMemosAuthToken();
    const spaces = await fetchAllSpaces(token);
    state.allSpaces = spaces;
    return spaces;
  }
  async function getCardTypes(options) {
    const force = Boolean(options && options.force);
    if (!force && state.types.length) {
      if (!state.activeTypeManuallySelected) {
        state.activeType = sortTypes(state.types)[0] || activeTypeForNew(state.types, getCurrentSpace());
      }
      return state.types;
    }
    const spaces = await getAllSpaces(force);
    const types = sortTypes(spaces.map((space) => {
      const marker = extractMarker(space.description);
      return marker ? normalizeType(marker, space) : null;
    }).filter(Boolean));
    state.types = types;
    const cached = readCachedTargetSpace();
    const cachedType = cached && typeForSpace(types, cached.name);
    state.activeTypeManuallySelected = Boolean(cached && cached.manual);
    if (state.activeTypeManuallySelected && cachedType) {
      state.activeType = cachedType;
    } else {
      state.activeTypeManuallySelected = false;
      state.activeType = sortTypes(types)[0] || activeTypeForNew(types, getCurrentSpace());
    }
    return types;
  }
  function setActiveType(typeId, manualSelection = true) {
    const type = state.types.find((t) => t.id === typeId);
    if (!type) return null;
    state.activeType = type;
    state.activeTypeManuallySelected = manualSelection;
    if (type.spaceName) writeCachedTargetSpace(type.spaceName, type.spaceTitle, manualSelection);
    return type;
  }
  function refreshQuickSpaceSelector() {
    const text = document.getElementById("lc-space-select-text");
    const options = document.getElementById("lc-space-select-options");
    if (!text || !options) return;
    const active = state.activeType || sortTypes(state.types)[0];
    text.innerText = active ? active.spaceTitle || active.name : "No card spaces";
    options.innerHTML = "";
    state.types.forEach((type) => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = `lc-space-select-option${active && active.id === type.id ? " active" : ""}`;
      option.setAttribute("data-type-id", type.id);
      option.innerText = type.spaceTitle || type.name;
      option.title = type.spaceName || type.name;
      option.onclick = (event) => {
        event.stopPropagation();
        const selected = setActiveType(type.id);
        if (!selected) return;
        const panel = document.getElementById("lc-space-select-panel");
        const trigger = document.getElementById("lc-space-select-btn");
        if (panel) panel.hidden = true;
        if (trigger) trigger.setAttribute("aria-expanded", "false");
        refreshQuickSpaceSelector();
        if (typeof state.onQuickTypeSelected === "function") {
          state.onQuickTypeSelected(selected);
        }
      };
      options.appendChild(option);
    });
  }
  function swipeQuickSpaceSelector(delta) {
    const types = sortTypes(state.types);
    if (types.length < 2) return null;
    const currentIndex = types.findIndex((type) => state.activeType && type.id === state.activeType.id);
    const startIndex = currentIndex < 0 ? 0 : currentIndex;
    const nextIndex = (startIndex + delta + types.length) % types.length;
    const selected = setActiveType(types[nextIndex].id);
    refreshQuickSpaceSelector();
    if (selected && typeof state.onQuickTypeSelected === "function") {
      state.onQuickTypeSelected(selected);
    }
    return selected;
  }
  async function resolveTargetSpace(options) {
    const force = Boolean(options && options.force);
    if (!force) {
      const cached = readCachedTargetSpace();
      if (cached && cached.manual && typeForSpace(state.types, cached.name)) {
        return {
          space: cached.name,
          title: cached.title,
          matches: state.types,
          fromCache: true,
          type: typeForSpace(state.types, cached.name) || state.activeType
        };
      }
    }
    const types = await getCardTypes({ force });
    const active = state.activeType || typeForSpace(types, getCurrentSpace()) || activeTypeForNew(types, getCurrentSpace());
    if (active && active.spaceName) {
      writeCachedTargetSpace(active.spaceName, active.spaceTitle, state.activeTypeManuallySelected);
      return {
        space: active.spaceName,
        title: active.spaceTitle,
        matches: types,
        fromCache: false,
        type: active
      };
    }
    clearTargetSpaceCache();
    return { space: null, title: "", matches: types, fromCache: false, type: active };
  }
  function setSpaceIndicatorState(stateName, text) {
    const btn = document.getElementById("lc-space-indicator");
    const textEl = document.getElementById("lc-space-indicator-text");
    if (!btn || !textEl) return;
    btn.classList.remove("lc-si-loading", "lc-si-ok", "lc-si-warn", "lc-si-missing");
    btn.classList.add(`lc-si-${stateName}`);
    textEl.innerText = "⚙ Manage";
    btn.title = `${text} — manage card types and spaces`;
  }
  function updateSpaceHint(spaceName, spaceTitle) {
    const hint = document.getElementById("lc-space-hint");
    if (!hint) return;
    const label = spaceTitle || (spaceName ? stripSpacePrefix2(spaceName) : "");
    hint.innerText = state.activeType ? `Type: ${state.activeType.name}` + (spaceName ? ` · ${label}` : "") : spaceName ? `Target Space: ${label}` : "Target Space: Personal Space";
  }
  async function refreshSpaceIndicator(force) {
    if (state.spaceResolutionInFlight) return state.spaceResolutionInFlight;
    state.spaceResolutionInFlight = (async () => {
      setSpaceIndicatorState("loading", "⏳ Checking card types…");
      try {
        const result = await resolveTargetSpace({ force: Boolean(force) });
        const count = state.types.length;
        if (count > 0) {
          const suffix = count > 1 ? ` · ${count} types` : "";
          setSpaceIndicatorState("ok", `🃏 ${state.activeType ? state.activeType.name : "Card types"}${suffix}`);
        } else if (result.space) {
          setSpaceIndicatorState("ok", `🃏 ${result.title || stripSpacePrefix2(result.space)}`);
        } else {
          setSpaceIndicatorState("missing", "⛔ No card types yet");
        }
        updateSpaceHint(result.space, result.title);
        refreshQuickSpaceSelector();
        return result;
      } catch (err) {
        console.warn("[LanguageCard] card type resolution failed", err);
        setSpaceIndicatorState("missing", "⛔ Card type check failed");
        return null;
      } finally {
        state.spaceResolutionInFlight = null;
      }
    })();
    return state.spaceResolutionInFlight;
  }
  function hideSpaceInfoPopup() {
    const overlay = document.getElementById("lc-space-info-overlay");
    if (overlay) overlay.style.display = "none";
  }
  async function warmMemoSpaceCache() {
    if (state.memoSpaceWarmed) return;
    state.memoSpaceWarmed = true;
    const token = await getMemosAuthToken();
    await Promise.all(state.types.map(async (type) => {
      if (!type.spaceName) return;
      try {
        const memos = await listMemosForSpace(type.spaceName, token);
        memos.forEach((memo) => {
          if (memo && memo.name) state.memoSpaceCache.set(memo.name, type.spaceName);
        });
      } catch (e) {
      }
    }));
  }

  // src/space-manager.js
  var draftType = null;
  var migrationPlan = [];
  var migrationType = null;
  function status(message, isError) {
    const el = document.getElementById("lc-manager-status");
    if (!el) return;
    el.innerText = message;
    el.className = `lc-manager-status${isError ? " lc-manager-error" : ""}`;
  }
  function spaceDescriptionFor(name) {
    const space = state.allSpaces.find((s) => s.name === name);
    return space ? space.description || "" : "";
  }
  function replaceMarker(description, marker) {
    const text = String(description || "");
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end <= start) return `${text.trim()}
${marker}`.trim();
    return `${text.substring(0, start)}${marker}${text.substring(end + 1)}`;
  }
  function sectionRowHtml(section, index) {
    return `
    <div class="lc-section-row" data-sec-row="${index}">
      <input class="lc-form-input" data-field="key" data-sec-index="${index}" value="${escapeHtml(section.key)}" placeholder="key" title="the key stored in the note" />
      <input class="lc-form-input" data-field="label" data-sec-index="${index}" value="${escapeHtml(section.label)}" placeholder="label" title="display label (the chip code is derived from this)" />
      <input class="lc-form-input" data-field="color" data-sec-index="${index}" value="${escapeHtml(section.color)}" placeholder="#38bdf8" title="colour" />
      <button type="button" class="lc-btn-icon" data-action="section-toggle-hidden" data-sec-index="${index}" title="${section.defaultHidden ? "Hidden by default — click to show by default" : "Shown by default — click to hide by default"}">${section.defaultHidden ? "🚫" : "👁"}</button>
      <button type="button" class="lc-btn-icon" data-action="section-up" data-sec-index="${index}" title="Move up">↑</button>
      <button type="button" class="lc-btn-icon" data-action="section-down" data-sec-index="${index}" title="Move down">↓</button>
      <button type="button" class="lc-btn-icon" data-action="section-remove" data-sec-index="${index}" title="Remove">✕</button>
    </div>`;
  }
  function typeCardHtml(type, index, total, inUseId) {
    const inUse = type.id === inUseId;
    const open = Boolean(draftType && draftType.id === type.id);
    const aliasCount = Object.keys(type.sectionAliases || {}).length;
    return `
    <li class="lc-type-card${inUse ? " lc-type-in-use" : ""}${open ? " lc-type-open" : ""}">
      <div class="lc-type-card-head">
        <button type="button" class="lc-type-card-title" data-action="type-edit" data-type-id="${escapeHtml(type.id)}" title="Click to edit this type">
          <b>${escapeHtml(type.name)}</b>
          ${inUse ? '<span class="lc-type-badge-use">In use</span>' : ""}
          <span class="lc-type-meta">
            ${escapeHtml(type.spaceName || "no space")} &middot;
            ${type.sections.length ? type.sections.map((s) => escapeHtml(s.label)).join(" · ") : "no sections yet"} &middot;
            per-language + unified explanations
            ${aliasCount ? ` &middot; ${aliasCount} name alias${aliasCount > 1 ? "es" : ""}` : ""}
          </span>
        </button>
        <div class="lc-type-row-actions">
          <button type="button" class="lc-btn-icon" data-action="type-up" data-type-id="${escapeHtml(type.id)}" ${index === 0 ? "disabled" : ""} title="Move up">↑</button>
          <button type="button" class="lc-btn-icon" data-action="type-down" data-type-id="${escapeHtml(type.id)}" ${index === total - 1 ? "disabled" : ""} title="Move down">↓</button>
          ${inUse ? "" : `<button type="button" class="lc-btn lc-btn-secondary" data-action="type-use" data-type-id="${escapeHtml(type.id)}">Use for new cards</button>`}
          <button type="button" class="lc-btn lc-btn-secondary" data-action="type-edit" data-type-id="${escapeHtml(type.id)}">${open ? "Close" : "Edit"}</button>
        </div>
      </div>
      ${open ? `<div class="lc-type-card-body">${typeEditorHtml()}</div>` : ""}
    </li>`;
  }
  function typeEditorHtml() {
    const type = draftType;
    return `
    <div class="lc-manager-grid">
      <label class="lc-form-label">Name <input id="lc-type-name" class="lc-form-input" value="${escapeHtml(type.name)}" /></label>
      <span class="lc-manager-hint">Cards support per-language explanations and one unified explanation.</span>
    </div>
    <div class="lc-editor-block">
      <h4>Language sections</h4>
      <p class="lc-manager-hint">Each section = one key stored in the note + its display label (the short chip code is derived from the label) + colour. The order below is the left-to-right order in cards and the JSON key order. The 👁 / 🚫 button decides whether the section starts open or closed when creating a new card.</p>
      <div id="lc-section-rows">${type.sections.map(sectionRowHtml).join("") || '<p class="lc-manager-hint">No sections yet — add one below.</p>'}</div>
      <button type="button" class="lc-btn lc-btn-secondary" id="lc-add-section-btn">+ Add section</button>
    </div>
    <div class="lc-manager-actions">
      <button type="button" class="lc-btn lc-btn-primary" id="lc-save-type-btn">Save to space description</button>
      <button type="button" class="lc-btn lc-btn-secondary" id="lc-copy-marker-btn">Copy marker JSON</button>
    </div>
    <pre id="lc-marker-preview" class="lc-preview-box">${escapeHtml(markerFromType(draftType))}</pre>
    <p class="lc-manager-hint">Writing requires space administrator rights; otherwise copy this marker into the space description manually.</p>`;
  }
  function openTypeEditor(typeId) {
    if (draftType && draftType.id === typeId) {
      draftType = null;
    } else {
      const type = state.types.find((t) => t.id === typeId);
      draftType = type ? JSON.parse(JSON.stringify(type)) : null;
    }
    renderTypeList();
  }
  function renderTypeList() {
    const host = document.getElementById("lc-type-list");
    if (!host) return;
    const types = state.types;
    const inUseType = state.activeType || types[0];
    host.innerHTML = types.map((t, i) => typeCardHtml(t, i, types.length, inUseType && inUseType.id)).join("") || "<li>No card types yet — declare a space below.</li>";
  }
  async function writeTypeMarker(type, successMessage) {
    const marker = markerFromType(type);
    const description = replaceMarker(spaceDescriptionFor(type.spaceName), marker);
    const token = await getMemosAuthToken();
    const res = await updateSpaceDescription(type.spaceName, description, token);
    if (res && res.ok) {
      status(successMessage || "Marker saved.");
      await getCardTypes({ force: true });
      await refreshSpaceIndicator(true);
      await renderManager();
      return true;
    }
    const code = res ? res.status : "no response";
    status(
      `Could not write the space description (HTTP ${code}). ` + (code === 401 || code === 403 ? "Admin rights are required — copy the marker below into the space description yourself." : "The marker JSON is shown below for manual use."),
      true
    );
    const preview = document.getElementById("lc-marker-preview");
    if (preview) preview.innerText = marker;
    return false;
  }
  function collectDraft() {
    const name = document.getElementById("lc-type-name");
    if (!draftType) return null;
    if (name && name.value) draftType.name = name.value;
    draftType.sections = draftType.sections.filter((s) => s && s.key);
    if (!draftType.sections.length) {
      status("A card type needs at least one section.", true);
      return null;
    }
    const preview = document.getElementById("lc-marker-preview");
    if (preview) preview.innerText = markerFromType(draftType);
    return draftType;
  }
  function migrationOverlay() {
    let overlay = document.getElementById("lc-migration-overlay");
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.id = "lc-migration-overlay";
    overlay.className = "lc-modal-overlay lc-migration-overlay";
    overlay.style.display = "none";
    overlay.onclick = (e) => {
      if (e.target === overlay) closeMigrationWizard();
    };
    overlay.innerHTML = `
    <div class="lc-modal-dialog lc-migration-dialog">
      <div class="lc-modal-header">
        <div class="lc-modal-title-row">
          <h3 class="lc-modal-title"><span>🔧</span><span id="lc-migration-title">Migrate incompatible notes</span></h3>
        </div>
        <div class="lc-modal-header-actions">
          <button type="button" class="lc-modal-close" id="lc-migration-close-btn" title="Close (Esc)">&times;</button>
        </div>
      </div>
      <div class="lc-modal-body" id="lc-migration-body">
        <p class="lc-manager-hint">Scanning…</p>
      </div>
      <div class="lc-modal-footer">
        <label class="lc-migration-save" title="Persist the choices so future notes / renders match automatically">
          <input type="checkbox" id="lc-migration-save-aliases" checked />
          Save chosen mappings as section aliases
        </label>
        <div style="display:flex; gap:10px;">
          <button type="button" class="lc-btn lc-btn-secondary" id="lc-migration-preview-btn">Preview</button>
          <button type="button" class="lc-btn lc-btn-primary" id="lc-migration-apply-btn">Migrate</button>
        </div>
      </div>
    </div>
  `;
    document.body.appendChild(overlay);
    const closeBtn = document.getElementById("lc-migration-close-btn");
    if (closeBtn) closeBtn.onclick = closeMigrationWizard;
    const previewBtn = document.getElementById("lc-migration-preview-btn");
    if (previewBtn) previewBtn.onclick = showMigrationPreview;
    const applyBtn = document.getElementById("lc-migration-apply-btn");
    if (applyBtn) applyBtn.onclick = runMigration;
    const body = document.getElementById("lc-migration-body");
    if (body) {
      body.addEventListener("change", (e) => {
        const noteIndex = e.target && e.target.getAttribute ? Number(e.target.getAttribute("data-mig-note")) : NaN;
        const rowIndex = e.target && e.target.getAttribute ? Number(e.target.getAttribute("data-mig-row")) : NaN;
        if (Number.isNaN(noteIndex) || Number.isNaN(rowIndex)) return;
        const row = migrationPlan[noteIndex] && migrationPlan[noteIndex].rows[rowIndex];
        if (row) row.target = e.target.value || "__keep";
      });
    }
    document.addEventListener("keydown", (ev) => {
      const el = document.getElementById("lc-migration-overlay");
      if (ev.key === "Escape" && el && el.style.display !== "none") {
        closeMigrationWizard();
      }
    }, true);
    return overlay;
  }
  function closeMigrationWizard() {
    const overlay = document.getElementById("lc-migration-overlay");
    if (overlay) overlay.style.display = "none";
  }
  function migrationStatus(message, isError) {
    const el = document.getElementById("lc-migration-status");
    if (!el) return;
    el.innerText = message;
    el.className = `lc-manager-status${isError ? " lc-manager-error" : ""}`;
  }
  function collectMigrationMapping() {
    const mapping = {};
    migrationPlan.forEach((note) => note.rows.forEach((row) => {
      if (row.target && row.target !== "__keep") mapping[row.key] = row.target;
    }));
    return mapping;
  }
  function renderMigrationList() {
    const body = document.getElementById("lc-migration-body");
    if (!body) return;
    const type = migrationType;
    if (!migrationPlan.length) {
      body.innerHTML = '<p class="lc-manager-hint">No incompatible notes found in this space.</p>';
      return;
    }
    body.innerHTML = `
    <p class="lc-manager-hint">Every note below carries keys that don't match a section of <b>${escapeHtml(type ? type.name : "")}</b>. Choose, per key, which section it should become &mdash; you can see the actual value next to it. "keep as-is" leaves the key untouched. Nothing is written until you press Migrate.</p>
    ${migrationPlan.map((note, ni) => `
      <div class="lc-migration-note">
        <div class="lc-migration-note-head">
          <b>${escapeHtml(note.memoName || "memo")}</b>
          <span class="lc-space-info-uid">${escapeHtml(note.kind)}</span>
        </div>
        ${note.rows.map((row, ri) => `
          <div class="lc-migration-key-row">
            <code class="lc-migration-key">${escapeHtml(row.key)}</code>
            <select class="lc-form-input lc-migration-target" data-mig-note="${ni}" data-mig-row="${ri}">
              <option value="__keep" ${row.target === "__keep" ? "selected" : ""}>keep as-is</option>
              ${(type ? type.sections : []).map((s) => `<option value="${escapeHtml(s.key)}" ${row.target === s.key ? "selected" : ""}>${escapeHtml(s.label)} (${escapeHtml(s.key)})</option>`).join("")}
            </select>
            <span class="lc-migration-sample">"${escapeHtml(row.sample)}"</span>
          </div>`).join("")}
      </div>`).join("")}
    <pre id="lc-migration-preview" class="lc-preview-box"></pre>
    <div id="lc-migration-status" class="lc-manager-status"></div>`;
  }
  function showMigrationPreview() {
    const mapping = collectMigrationMapping();
    const host = document.getElementById("lc-migration-preview");
    if (!host) return;
    host.innerText = migrationPlan.map((note) => {
      const before = note.raw.slice(0, 140);
      const after = migratedContent(note.raw, mapping) || "(unparseable)";
      return `${note.memoName}
  before: ${before}
  after:  ${after.slice(0, 140)}`;
    }).join("\n\n") || "Nothing to preview.";
  }
  function migratedContent(rawText, mapping) {
    const start = rawText.indexOf("{");
    const end = rawText.lastIndexOf("}");
    if (start === -1 || end <= start) return null;
    let data;
    try {
      data = JSON.parse(rawText.substring(start, end + 1));
    } catch (e) {
      return null;
    }
    const mapped = mapSectionKeys(data, mapping);
    mapped._t = data._t || "lc";
    mapped.v = V3_VERSION;
    return `${rawText.substring(0, start)}${JSON.stringify(mapped)}${rawText.substring(end + 1)}`;
  }
  async function openMigrationWizard() {
    const type = state.activeType || state.types[0];
    if (!type || !type.spaceName) {
      status("Pick a card type bound to a space first.", true);
      return;
    }
    migrationType = type;
    const overlay = migrationOverlay();
    overlay.style.display = "flex";
    const title = document.getElementById("lc-migration-title");
    if (title) title.innerText = `Migrate notes — ${type.name} (${type.spaceName})`;
    const body = document.getElementById("lc-migration-body");
    if (body) body.innerHTML = '<p class="lc-manager-hint">Scanning notes in this space…</p>';
    try {
      const token = await getMemosAuthToken();
      const memos = await listMemosForSpace(type.spaceName, token);
      const keys = sectionKeys(type);
      migrationPlan = memos.map((memo) => {
        const raw = String(memo.content || "");
        const v3 = parseCardV3(raw);
        const legacy = v3 ? null : parseCardMemo(raw, type.spaceName);
        const values = v3 ? v3.values : legacy ? legacy.data : null;
        if (!values) return null;
        const rows = Object.keys(values).filter((k) => !["_t", "v", "_e", "_x"].includes(k) && !keys.includes(k)).map((k) => ({
          key: k,
          sample: String(values[k] || "").replace(/\s+/g, " ").slice(0, 40),
          // Default to a saved alias when it matches a section; otherwise leave
          // "keep as-is" so the user makes an explicit, visible choice.
          target: type.sectionAliases[k] && keys.includes(type.sectionAliases[k]) ? type.sectionAliases[k] : "__keep"
        }));
        return rows.length ? { memoName: memo.name || "", raw, kind: v3 ? "V3, unknown keys" : "V2 / legacy keys", rows } : null;
      }).filter(Boolean);
      renderMigrationList();
    } catch (err) {
      migrationPlan = [];
      if (body) {
        body.innerHTML = `<p class="lc-manager-error">Could not list memos: ${escapeHtml(err.message)}. Check your token / space permissions.</p>`;
      }
    }
  }
  async function runMigration() {
    const mapping = collectMigrationMapping();
    if (!migrationPlan.length) return;
    const token = await getMemosAuthToken();
    let done = 0;
    let failed = 0;
    for (const note of migrationPlan) {
      const content = migratedContent(note.raw, mapping);
      if (!content) {
        failed++;
        continue;
      }
      try {
        const res = await patchMemoContent(note.memoName, content, token);
        if (res && res.ok) done++;
        else failed++;
      } catch (e) {
        failed++;
      }
    }
    let aliasNote = "";
    const saveBox = document.getElementById("lc-migration-save-aliases");
    if (saveBox && saveBox.checked && migrationType && Object.keys(mapping).length && done > 0) {
      migrationType.sectionAliases = { ...migrationType.sectionAliases, ...mapping };
      const ok = await writeTypeMarkerSilently(migrationType);
      if (ok) {
        await getCardTypes({ force: true });
        aliasNote = " Mappings saved as section aliases.";
      } else {
        aliasNote = " (mappings were NOT saved to the type definition)";
      }
    }
    migrationStatus(`Migrated ${done} note(s), ${failed} failed.${aliasNote}`, failed > 0);
    migrationPlan = [];
    renderMigrationList();
  }
  function bindManagerEvents(bodyEl) {
    bodyEl.onclick = async (e) => {
      const target = e.target && e.target.closest ? e.target.closest("button") : null;
      if (!target) return;
      const action = target.getAttribute("data-action") || target.id;
      const typeId = target.getAttribute("data-type-id");
      const index = Number(target.getAttribute("data-sec-index"));
      if (action === "type-edit") return openTypeEditor(typeId);
      if (action === "type-use") {
        setActiveType(typeId);
        await refreshSpaceIndicator(true);
        return renderManager();
      }
      if (action === "type-up" || action === "type-down") return reorderTypes(typeId, action === "type-up" ? -1 : 1);
      if (action === "declare-space") {
        const space = state.allSpaces.find((s) => s.name === typeId);
        if (!space) return;
        const type = defaultType(space);
        type.id = `type-${String(space.name).replace(/^spaces\//, "")}`;
        type.order = state.types.length * 10 + 10;
        type.sections = [];
        return writeTypeMarker(type, `Declared ${space.title || space.name} as a card type.`);
      }
      if (action === "create-space") return createSpaceFromManager();
      if (action === "section-toggle-hidden") {
        if (!draftType || !draftType.sections[index]) return;
        draftType.sections[index].defaultHidden = !draftType.sections[index].defaultHidden;
        return renderTypeList();
      }
      if (action === "section-up" || action === "section-down" || action === "section-remove") {
        if (!draftType) return;
        const sections = draftType.sections;
        if (action === "section-remove") sections.splice(index, 1);
        else {
          const swap = index + (action === "section-up" ? -1 : 1);
          if (swap < 0 || swap >= sections.length) return;
          [sections[index], sections[swap]] = [sections[swap], sections[index]];
        }
        return renderTypeList();
      }
      if (action === "add-section" || target.id === "lc-add-section-btn") {
        if (!draftType) return;
        draftType.sections.push({ key: `section${draftType.sections.length + 1}`, label: "New section", color: "#38bdf8", defaultHidden: false });
        return renderTypeList();
      }
      if (action === "save-type" || target.id === "lc-save-type-btn") {
        const type = collectDraft();
        if (type) return writeTypeMarker(type, `Saved ${type.name}.`);
      }
      if (action === "copy-marker" || target.id === "lc-copy-marker-btn") {
        const type = collectDraft() || draftType;
        if (type) return copyText(markerFromType(type), target);
      }
      if (action === "open-migration" || target.id === "lc-migration-open-btn") return openMigrationWizard();
    };
    bodyEl.addEventListener("input", (e) => {
      const secField = e.target && e.target.getAttribute ? e.target.getAttribute("data-field") : null;
      if (!secField || !draftType) return;
      const index = Number(e.target.getAttribute("data-sec-index"));
      if (draftType.sections[index]) draftType.sections[index][secField] = e.target.value || "";
      const preview = document.getElementById("lc-marker-preview");
      if (preview) preview.innerText = markerFromType(draftType);
    });
  }
  async function createSpaceFromManager() {
    const titleInput = document.getElementById("lc-new-space-title");
    const title = titleInput ? titleInput.value.trim() : "";
    if (!title) {
      status("Enter a name for the new space.", true);
      if (titleInput) titleInput.focus();
      return;
    }
    const button = document.getElementById("lc-create-space-btn");
    if (button) {
      button.disabled = true;
      button.innerText = "Creating…";
    }
    try {
      const source = draftType || state.activeType || state.types[0] || defaultType(null);
      const type = JSON.parse(JSON.stringify(source));
      type.id = `type-new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      type.name = title;
      type.spaceName = "";
      type.spaceTitle = title;
      type.order = state.types.reduce((max, item) => Math.max(max, item.order), -10) + 10;
      type.sectionAliases = {};
      const token = await getMemosAuthToken();
      const res = await createSpace(title, markerFromType(type), token);
      if (!res || !res.ok) {
        const code = res ? res.status : "no response";
        let detail = "";
        if (res) {
          const body = await res.text().catch(() => "");
          try {
            const parsed = JSON.parse(body);
            detail = parsed.message || "";
          } catch (e) {
            detail = body.replace(/\s+/g, " ").trim().slice(0, 160);
          }
        }
        throw new Error(`HTTP ${code}${detail ? ` — ${detail}` : ""}`);
      }
      const created = await res.json();
      if (!created || !created.name) {
        throw new Error("The server created the space but returned no resource name. Reload the page and check the space list.");
      }
      await getCardTypes({ force: true });
      const createdType = state.types.find((item) => item.spaceName === created.name);
      if (!createdType) {
        throw new Error("The space was created, but its card type was not returned by the space list. Reload the page to refresh.");
      }
      setActiveType(createdType.id);
      if (typeof state.onQuickTypeSelected === "function") {
        state.onQuickTypeSelected(createdType);
      }
      await refreshSpaceIndicator(true);
      await renderManager();
      status(`Created "${title}" with the current language sections. It will be used for new cards; your open draft is unchanged.`);
    } catch (err) {
      status(`Could not create space: ${err.message}`, true);
      const currentButton = document.getElementById("lc-create-space-btn");
      if (currentButton) {
        currentButton.disabled = false;
        currentButton.innerText = "Create & use for new cards";
      }
    }
  }
  async function reorderTypes(typeId, delta) {
    const types = [...state.types];
    const index = types.findIndex((t) => t.id === typeId);
    const swap = index + delta;
    if (index < 0 || swap < 0 || swap >= types.length) return;
    [types[index], types[swap]] = [types[swap], types[index]];
    types.forEach((type, i) => {
      type.order = i * 10;
    });
    state.types = types;
    for (const type of types) {
      const ok = await writeTypeMarkerSilently(type);
      if (!ok) return;
    }
    await renderManager();
    status("Type order updated.");
  }
  async function writeTypeMarkerSilently(type) {
    const marker = markerFromType(type);
    const token = await getMemosAuthToken();
    const res = await updateSpaceDescription(
      type.spaceName,
      replaceMarker(spaceDescriptionFor(type.spaceName), marker),
      token
    );
    if (!res || !res.ok) {
      status(`Could not reorder (HTTP ${res ? res.status : "no response"}). Admin rights are required.`, true);
      return false;
    }
    return true;
  }
  async function renderManager() {
    const bodyEl = document.getElementById("lc-space-info-body");
    if (!bodyEl) return;
    bodyEl.innerHTML = '<p class="lc-manager-hint">Loading spaces…</p>';
    try {
      const [types, spaces] = await Promise.all([getCardTypes({ force: true }), getAllSpaces(true)]);
      const marked = new Set(types.map((t) => t.spaceName));
      const unmarked = spaces.filter((s) => !marked.has(s.name));
      const inUseType = state.activeType || types[0];
      bodyEl.innerHTML = `
      <div class="lc-manager">
        <p class="lc-manager-hint">Each marked space defines one card type. Click a card to edit its definition inline &mdash; the open card is the one being edited. Definitions live only in the space description, never in notes.</p>
        <div class="lc-manager-section">
          <h4>Create a Language Card space</h4>
          <p class="lc-manager-hint">Create a new Memos space from here. It will start with the current card type's language sections and become the target for new cards.</p>
          <div class="lc-manager-create-space">
            <input id="lc-new-space-title" class="lc-form-input" type="text" maxlength="100" placeholder="Space name" aria-label="New space name" />
            <button type="button" class="lc-btn lc-btn-primary" id="lc-create-space-btn" data-action="create-space">Create &amp; use for new cards</button>
          </div>
        </div>
        <div class="lc-manager-section">
          <h4>Card types (${types.length})</h4>
          <ul class="lc-type-list" id="lc-type-list"></ul>
        </div>
        <div class="lc-manager-section">
          <h4>Spaces without a marker (${unmarked.length})</h4>
          <ul class="lc-space-info-list">
            ${unmarked.map((s) => `<li><b>${escapeHtml(s.title || s.name)}</b><span class="lc-space-info-uid">${escapeHtml(s.name)}</span><button type="button" class="lc-btn lc-btn-secondary" data-action="declare-space" data-type-id="${escapeHtml(s.name)}">Declare as card type</button></li>`).join("") || "<li>None</li>"}
          </ul>
        </div>
        <div class="lc-manager-section">
          <h4>Incompatible notes</h4>
          <p class="lc-manager-hint">Notes whose keys don't match this type can be migrated in a dedicated window: the scanner lists each note with its real key values, and you choose per key which section it should become.</p>
          <button type="button" class="lc-btn lc-btn-secondary" id="lc-migration-open-btn" data-action="open-migration">Open migration wizard…</button>
        </div>
        <div id="lc-manager-status" class="lc-manager-status"></div>
      </div>`;
      bindManagerEvents(bodyEl);
      if (!draftType || !types.some((t) => t.id === draftType.id)) {
        draftType = inUseType ? JSON.parse(JSON.stringify(inUseType)) : null;
      }
      renderTypeList();
    } catch (err) {
      bodyEl.innerHTML = `<p class="lc-manager-error">Could not load spaces: ${escapeHtml(err.message)}. Reload the page and try again.</p>`;
    }
  }
  async function showTypeManager() {
    const overlay = document.getElementById("lc-space-info-overlay");
    const titleEl = document.getElementById("lc-space-info-title");
    if (!overlay) return;
    if (titleEl) titleEl.innerText = "🃏 Card types & spaces";
    overlay.style.display = "flex";
    status("");
    await renderManager();
  }
  async function showCreateSpaceManager() {
    await showTypeManager();
    const input = document.getElementById("lc-new-space-title");
    if (input) {
      input.scrollIntoView({ block: "center" });
      input.focus();
    }
  }

  // src/editor.js
  var pageScrollLock = null;
  var spaceSwipeAnimationTimer = null;
  function animateSpaceSwipe(direction) {
    const header = document.getElementById("lc-modal-header");
    if (!header) return;
    header.classList.remove("lc-space-swipe-next", "lc-space-swipe-previous");
    void header.offsetWidth;
    header.classList.add(direction > 0 ? "lc-space-swipe-next" : "lc-space-swipe-previous");
    clearTimeout(spaceSwipeAnimationTimer);
    spaceSwipeAnimationTimer = setTimeout(() => {
      header.classList.remove("lc-space-swipe-next", "lc-space-swipe-previous");
      spaceSwipeAnimationTimer = null;
    }, 260);
  }
  function lockPageScroll() {
    if (pageScrollLock) return;
    const root = document.documentElement;
    const body = document.body;
    const lock = {
      rootOverflow: root.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
      scrollY: window.scrollY || window.pageYOffset || 0
    };
    pageScrollLock = lock;
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${lock.scrollY}px`;
    body.style.width = "100%";
    const preventBackgroundScroll = (event) => {
      const target = event.target;
      const inDialog = target && target.closest && target.closest(".lc-modal-dialog");
      if (inDialog) return;
      event.preventDefault();
    };
    document.addEventListener("touchmove", preventBackgroundScroll, { capture: true, passive: false });
    document.addEventListener("wheel", preventBackgroundScroll, { capture: true, passive: false });
    lock.preventBackgroundScroll = preventBackgroundScroll;
  }
  function unlockPageScroll() {
    if (!pageScrollLock) return;
    const lock = pageScrollLock;
    pageScrollLock = null;
    document.removeEventListener("touchmove", lock.preventBackgroundScroll, true);
    document.removeEventListener("wheel", lock.preventBackgroundScroll, true);
    document.documentElement.style.overflow = lock.rootOverflow;
    document.body.style.overflow = lock.bodyOverflow;
    document.body.style.position = lock.bodyPosition;
    document.body.style.top = lock.bodyTop;
    document.body.style.width = lock.bodyWidth;
    if (typeof window.scrollTo === "function") window.scrollTo(0, lock.scrollY);
  }
  function currentSections() {
    return state.editingType && state.editingType.sections || CONFIG.languages;
  }
  function toggleModalLocalLang(key) {
    if (state.modalActiveLangs.includes(key)) {
      if (state.modalActiveLangs.length <= 1) return;
      state.modalActiveLangs = state.modalActiveLangs.filter((k) => k !== key);
    } else {
      const next = [...state.modalActiveLangs, key];
      state.modalActiveLangs = currentSections().map((s) => s.key).filter((k) => next.includes(k));
    }
    updateModalEditorSlots();
  }
  function isExplanationSectionEnabled(key) {
    return !state.hiddenExplanationSections.includes(key);
  }
  function updateModalExplanationSlots() {
    const sections = currentSections();
    let activeCount = 0;
    sections.forEach((section) => {
      const toggle = document.getElementById(`lc-explanation-section-toggle-${section.key}`);
      const slot = document.getElementById(`lc-explanation-slot-${section.key}`);
      const languageEnabled = state.modalActiveLangs.includes(section.key);
      const explanationEnabled = isExplanationSectionEnabled(section.key);
      const visible = languageEnabled && explanationEnabled;
      if (visible) activeCount++;
      if (slot) slot.style.display = visible ? "flex" : "none";
      if (toggle) {
        toggle.classList.toggle("active", explanationEnabled);
        toggle.classList.toggle("language-hidden", !languageEnabled);
        toggle.style.borderColor = explanationEnabled ? section.color : "transparent";
        toggle.style.color = explanationEnabled ? section.color : "var(--lc-text-muted)";
        toggle.setAttribute("aria-pressed", String(explanationEnabled));
      }
    });
    const explanationGrid = document.getElementById("lc-explanation-inputs");
    if (explanationGrid) {
      explanationGrid.style.setProperty("--lc-explanation-cols", Math.max(1, activeCount));
    }
    const unifiedSlot = document.querySelector(".lc-unified-explanation-slot");
    if (unifiedSlot) unifiedSlot.style.display = "flex";
  }
  function toggleExplanationSection(key) {
    if (isExplanationSectionEnabled(key)) {
      state.hiddenExplanationSections = [...state.hiddenExplanationSections, key];
    } else {
      state.hiddenExplanationSections = state.hiddenExplanationSections.filter((k) => k !== key);
    }
    updateModalExplanationSlots();
    updatePreview();
  }
  function updateModalEditorSlots() {
    const sections = currentSections();
    const activeCount = sections.filter((s) => state.modalActiveLangs.includes(s.key)).length;
    const editorGrid = document.getElementById("lc-editor-grid");
    if (editorGrid) {
      editorGrid.style.setProperty("--lc-editor-cols", Math.max(1, activeCount));
    }
    sections.forEach((s) => {
      const slotEl = document.getElementById(`lc-editor-col-${s.key}`);
      const pillBtn = document.getElementById(`lc-modal-toggle-${s.key}`);
      const isAct = state.modalActiveLangs.includes(s.key);
      if (slotEl) {
        slotEl.style.display = isAct ? "flex" : "none";
      }
      if (pillBtn) {
        pillBtn.classList.toggle("active", isAct);
        pillBtn.style.borderColor = isAct ? s.color : "transparent";
        pillBtn.style.color = isAct ? s.color : "var(--lc-text-muted)";
      }
    });
    updateModalExplanationSlots();
    updatePreview();
  }
  function renderExplanationArea(type, explanations, unifiedExplanation) {
    const host = document.getElementById("lc-explanation-area");
    if (!host) return;
    if (state.editingVersion !== 3) {
      host.innerHTML = "";
      return;
    }
    const sections = currentSections();
    const sectionToggles = sections.map((s) => `
      <button type="button" id="lc-explanation-section-toggle-${escapeHtml(s.key)}" class="lc-modal-lang-chip lc-explanation-section-toggle ${isExplanationSectionEnabled(s.key) ? "active" : ""} ${state.modalActiveLangs.includes(s.key) ? "" : "language-hidden"}" style="border-color:${isExplanationSectionEnabled(s.key) ? s.color : "transparent"}; color:${isExplanationSectionEnabled(s.key) ? s.color : "var(--lc-text-muted)"}" aria-pressed="${isExplanationSectionEnabled(s.key)}" title="Show / hide ${escapeHtml(s.label)} explanation">
        ${escapeHtml(s.code)}
      </button>`).join("");
    const sectionInputs = sections.map((s) => `
      <div id="lc-explanation-slot-${escapeHtml(s.key)}" class="lc-explanation-slot" data-lc-explanation-slot="${escapeHtml(s.key)}">
        <label class="lc-form-label">${escapeHtml(s.label)}</label>
        <textarea id="lc-explain-${escapeHtml(s.key)}" class="lc-explanation-input" rows="2" placeholder="Explanation for ${escapeHtml(s.label)}">${escapeHtml(explanations && explanations[s.key] || "")}</textarea>
      </div>`).join("");
    host.innerHTML = `
      <div class="lc-explanation-panel">
        <div id="lc-explanation-section-toggles" class="lc-modal-lang-bar lc-explanation-section-toggles">
          <span class="lc-modal-lang-label">Sections:</span>
          ${sectionToggles}
        </div>
        <div id="lc-explanation-inputs" class="lc-explanation-inputs" style="--lc-explanation-cols:${Math.max(1, currentSections().length)}">
          ${sectionInputs}
        </div>
        <div class="lc-unified-explanation-slot">
          <label class="lc-form-label">Unified explanation</label>
          <textarea id="lc-explain-unified" class="lc-explanation-input" rows="2" placeholder="Explanation for the whole card">${escapeHtml(unifiedExplanation || "")}</textarea>
        </div>
      </div>`;
    currentSections().forEach((section) => {
      const sectionToggle = document.getElementById(`lc-explanation-section-toggle-${section.key}`);
      if (sectionToggle) sectionToggle.onclick = () => toggleExplanationSection(section.key);
    });
  }
  function renderEditorForType(type, values, explanations, unifiedExplanation) {
    const chips = document.getElementById("lc-modal-lang-bar");
    if (chips) {
      chips.innerHTML = `<span class="lc-modal-lang-label">This note:</span>` + type.sections.map((s) => `
        <button type="button" id="lc-modal-toggle-${escapeHtml(s.key)}" class="lc-modal-lang-chip active" style="border-color:${s.color}; color:${s.color}">
          ${escapeHtml(s.code)}
        </button>`).join("");
      type.sections.forEach((s) => {
        const btn = document.getElementById(`lc-modal-toggle-${s.key}`);
        if (btn) {
          btn.onclick = (e) => {
            e.stopPropagation();
            toggleModalLocalLang(s.key);
          };
        }
      });
    }
    const grid = document.getElementById("lc-editor-grid");
    if (grid) {
      grid.innerHTML = type.sections.map((s) => `
        <div class="lc-editor-slot" id="lc-editor-col-${escapeHtml(s.key)}">
          <div class="lc-slot-header">
            <span class="lc-slot-badge" style="color: ${s.color};">${escapeHtml(s.label)} (${escapeHtml(s.key)})</span>
            <span class="lc-slot-hint">${escapeHtml(s.code)}</span>
          </div>
          <textarea id="lc-input-${escapeHtml(s.key)}" class="lc-slot-textarea" placeholder="${escapeHtml(s.placeholder || "")}" rows="3"></textarea>
        </div>`).join("");
      type.sections.forEach((s) => {
        const el = document.getElementById(`lc-input-${s.key}`);
        if (el) el.value = String(values && values[s.key] || "");
      });
    }
    renderExplanationArea(type, explanations, unifiedExplanation);
    bindEditorInputs(type.sections.map((s) => s.key));
  }
  function applyQuickSelectedType(type) {
    const overlay = document.getElementById("lc-modal-overlay");
    if (!overlay || overlay.style.display === "none" || state.editingMemoName) return;
    const previousSections = currentSections();
    const values = {};
    const explanations = {};
    previousSections.forEach((section) => {
      values[section.key] = document.getElementById(`lc-input-${section.key}`)?.value || "";
      explanations[section.key] = document.getElementById(`lc-explain-${section.key}`)?.value || "";
    });
    const unifiedExplanation = document.getElementById("lc-explain-unified")?.value || "";
    const previousActive = new Set(state.modalActiveLangs);
    const previousHiddenExplanations = new Set(state.hiddenExplanationSections);
    state.editingType = type;
    state.activeType = type;
    const keys = type.sections.map((section) => section.key);
    state.modalActiveLangs = keys.filter((key) => previousActive.has(key));
    state.hiddenExplanationSections = keys.filter((key) => previousHiddenExplanations.has(key));
    if (!state.modalActiveLangs.length) {
      state.modalActiveLangs = keys.filter((key) => !type.sections.some((section) => section.key === key && section.defaultHidden));
    }
    if (!state.modalActiveLangs.length && keys.length) state.modalActiveLangs = [...keys];
    renderEditorForType(type, values, explanations, unifiedExplanation);
    updateModalEditorSlots();
    updateSpaceHint(type.spaceName, type.spaceTitle);
    const title = document.getElementById("lc-modal-title-text");
    if (title) title.innerText = `#${type.order + 1} · ${type.name}`;
    refreshQuickSpaceSelector();
  }
  function bindEditorInputs(keys) {
    const ids = [
      ...keys.map((k) => `lc-input-${k}`),
      ...keys.map((k) => `lc-explain-${k}`),
      "lc-explain-unified"
    ];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", () => {
        updatePreview();
        checkTagAutocomplete(el);
      });
      el.addEventListener("click", () => {
        checkTagAutocomplete(el);
      });
      el.addEventListener("keyup", (e) => {
        if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
          checkTagAutocomplete(el);
        }
      });
      el.addEventListener("blur", () => {
        setTimeout(() => {
          const dropdown = document.getElementById("lc-tag-dropdown");
          if (dropdown && !dropdown.contains(document.activeElement)) {
            hideTagAutocomplete();
          }
        }, 180);
      });
      el.addEventListener("keydown", (e) => {
        if (handleTagAutocompleteKeydown(e, el)) return;
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
          e.preventDefault();
          saveCard();
        }
        if (e.key === "Escape") closeModal();
      });
    });
  }
  function bindTagsInput() {
    const el = document.getElementById("lc-input-tags");
    if (!el) return;
    el.addEventListener("input", () => {
      updatePreview();
      checkTagAutocomplete(el);
    });
    el.addEventListener("click", () => checkTagAutocomplete(el));
    el.addEventListener("keyup", (e) => {
      if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) checkTagAutocomplete(el);
    });
    el.addEventListener("blur", () => {
      setTimeout(() => {
        const dropdown = document.getElementById("lc-tag-dropdown");
        if (dropdown && !dropdown.contains(document.activeElement)) hideTagAutocomplete();
      }, 180);
    });
    el.addEventListener("keydown", (e) => {
      if (handleTagAutocompleteKeydown(e, el)) return;
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        saveCard();
      }
      if (e.key === "Escape") closeModal();
    });
  }
  function injectCreatorUI() {
    if (document.getElementById("lc-floating-bar")) return;
    if (CONFIG.dedicatedSpaceKeyword) {
      if (!window.location.pathname.includes(CONFIG.dedicatedSpaceKeyword)) return;
    }
    const bar = document.createElement("div");
    bar.id = "lc-floating-bar";
    bar.className = "lc-floating-bar";
    bar.innerHTML = `
      <button id="lc-fab-btn" class="lc-fab">
        <span>🔤</span><span>New Card</span>
      </button>
    `;
    document.body.appendChild(bar);
    document.getElementById("lc-fab-btn").onclick = async () => {
      await refreshSpaceIndicator(true);
      openModal();
    };
    const overlay = document.createElement("div");
    overlay.id = "lc-modal-overlay";
    overlay.className = "lc-modal-overlay";
    overlay.style.display = "none";
    overlay.onclick = (e) => {
      if (e.target === overlay) closeModal();
    };
    let swipeStart = null;
    let horizontalSwipe = false;
    overlay.addEventListener("touchstart", (e) => {
      if (state.editingMemoName || document.getElementById("lc-space-info-overlay")?.style.display === "flex") return;
      const target = e.target;
      if (!target || !target.closest || !target.closest(".lc-modal-header")) return;
      const touch = e.touches && e.touches[0];
      swipeStart = touch ? { x: touch.clientX, y: touch.clientY } : null;
      horizontalSwipe = false;
    }, { passive: true });
    overlay.addEventListener("touchmove", (e) => {
      if (!swipeStart) return;
      const touch = e.touches && e.touches[0];
      if (!touch) return;
      const dx = touch.clientX - swipeStart.x;
      const dy = touch.clientY - swipeStart.y;
      if (Math.abs(dx) >= 10 && Math.abs(dx) > Math.abs(dy)) {
        horizontalSwipe = true;
        e.preventDefault();
        e.stopPropagation();
      }
    }, { passive: false });
    overlay.addEventListener("touchend", (e) => {
      if (!swipeStart) return;
      const touch = e.changedTouches && e.changedTouches[0];
      const dx = touch ? touch.clientX - swipeStart.x : 0;
      const dy = touch ? touch.clientY - swipeStart.y : 0;
      swipeStart = null;
      if (horizontalSwipe && Math.abs(dx) >= 35 && Math.abs(dx) > Math.abs(dy)) {
        const direction = dx < 0 ? 1 : -1;
        if (swipeQuickSpaceSelector(direction)) animateSpaceSwipe(direction);
      }
      horizontalSwipe = false;
    }, { passive: true });
    overlay.addEventListener("touchcancel", () => {
      swipeStart = null;
      horizontalSwipe = false;
    }, { passive: true });
    overlay.innerHTML = `
      <div class="lc-modal-dialog">
        <div class="lc-modal-header" id="lc-modal-header">
          <div class="lc-modal-title-row">
            <h3 class="lc-modal-title">
              <span>🔤</span>
              <span id="lc-modal-title-text">New Language Card</span>
            </h3>
            <div class="lc-space-controls">
              <button type="button" id="lc-space-indicator" class="lc-space-indicator lc-si-loading" title="Manage card types and spaces">
              <span id="lc-space-indicator-text">⏳ Checking card types…</span>
              </button>
              <div id="lc-space-select" class="lc-space-select">
                <button type="button" id="lc-space-select-btn" class="lc-space-select-btn" aria-expanded="false" aria-controls="lc-space-select-panel">
                  <span id="lc-space-select-text">Loading spaces…</span><span aria-hidden="true">⌄</span>
                </button>
                <div id="lc-space-select-panel" class="lc-space-select-panel" hidden>
                  <div id="lc-space-select-options" class="lc-space-select-options"></div>
                  <button type="button" id="lc-add-space-btn" class="lc-space-select-add">＋ Add new space</button>
                </div>
              </div>
            </div>
          </div>

          <div class="lc-modal-header-actions">
            <div class="lc-modal-lang-bar" id="lc-modal-lang-bar" title="Sections for this card only"></div>
            <button class="lc-modal-close" id="lc-modal-close-btn" title="Close (Esc)">&times;</button>
          </div>
        </div>

        <div class="lc-modal-body">
          <div id="lc-modal-error" style="display:none; color:#ef4444; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); border-radius:8px; padding:8px 12px; font-size:13px;"></div>

          <div class="lc-editor-grid" id="lc-editor-grid"></div>
          <div id="lc-explanation-area"></div>

          <div class="lc-form-group" style="margin-top: 4px;">
            <label class="lc-form-label">Tags (separated by space or comma)</label>
            <input type="text" id="lc-input-tags" class="lc-form-input" placeholder="e.g. #vocab #daily #reading" autocomplete="off" />
          </div>

          <div class="lc-form-group">
            <label class="lc-form-label" style="display:flex; justify-content:space-between;">
              <span>Memos Payload Preview</span>
              <span id="lc-space-hint" style="font-weight: normal; font-size: 11px; opacity: 0.8;"></span>
            </label>
            <div id="lc-json-preview" class="lc-preview-box">{"_t":"lc","v":3}</div>
          </div>

        </div>

        <div class="lc-modal-footer">
          <div style="font-size: 12px; color: var(--lc-text-muted);">
            Shortcut: <kbd style="background:rgba(128,128,128,0.2); padding:2px 6px; border-radius:4px;">Ctrl</kbd> + <kbd style="background:rgba(128,128,128,0.2); padding:2px 6px; border-radius:4px;">Enter</kbd>
          </div>
          <div style="display:flex; gap:10px;">
            <button class="lc-btn lc-btn-secondary" id="lc-btn-cancel">Cancel</button>
            <button class="lc-btn lc-btn-primary" id="lc-btn-save">Save Card</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    const infoOverlay = document.createElement("div");
    infoOverlay.id = "lc-space-info-overlay";
    infoOverlay.className = "lc-modal-overlay lc-space-info-overlay";
    infoOverlay.style.display = "none";
    infoOverlay.onclick = (e) => {
      if (e.target === infoOverlay) hideSpaceInfoPopup();
    };
    infoOverlay.innerHTML = `
      <div class="lc-modal-dialog lc-space-info-dialog">
        <div class="lc-modal-header">
          <div class="lc-modal-title-row">
            <h3 class="lc-modal-title"><span id="lc-space-info-title">Card types & spaces</span></h3>
          </div>
          <div class="lc-modal-header-actions">
            <button class="lc-modal-close" id="lc-space-info-close-btn" title="Close (Esc)">&times;</button>
          </div>
        </div>
        <div class="lc-modal-body" id="lc-space-info-body"></div>
        <div class="lc-modal-footer">
          <div style="font-size: 12px; color: var(--lc-text-muted);">Definitions live only in space descriptions.</div>
          <div style="display:flex; gap:10px;">
            <button class="lc-btn lc-btn-primary" id="lc-space-info-ok-btn">Done</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(infoOverlay);
    document.getElementById("lc-space-info-close-btn").onclick = hideSpaceInfoPopup;
    document.getElementById("lc-space-info-ok-btn").onclick = hideSpaceInfoPopup;
    const spaceIndicator = document.getElementById("lc-space-indicator");
    if (spaceIndicator) {
      spaceIndicator.onclick = async (e) => {
        e.stopPropagation();
        await refreshSpaceIndicator(true);
        showTypeManager();
      };
    }
    state.onQuickTypeSelected = applyQuickSelectedType;
    const spaceSelectButton = document.getElementById("lc-space-select-btn");
    const spaceSelectPanel = document.getElementById("lc-space-select-panel");
    const spaceSelect = document.getElementById("lc-space-select");
    if (spaceSelectButton && spaceSelectPanel) {
      spaceSelectButton.onclick = async (e) => {
        e.stopPropagation();
        await refreshSpaceIndicator(true);
        spaceSelectPanel.hidden = !spaceSelectPanel.hidden;
        spaceSelectButton.setAttribute("aria-expanded", String(!spaceSelectPanel.hidden));
      };
    }
    document.addEventListener("pointerdown", (e) => {
      if (!spaceSelectPanel || spaceSelectPanel.hidden) return;
      if (spaceSelect && e.target && spaceSelect.contains(e.target)) return;
      spaceSelectPanel.hidden = true;
      if (spaceSelectButton) spaceSelectButton.setAttribute("aria-expanded", "false");
    }, true);
    const addSpaceButton = document.getElementById("lc-add-space-btn");
    if (addSpaceButton) {
      addSpaceButton.onclick = async (e) => {
        e.stopPropagation();
        if (spaceSelectPanel) spaceSelectPanel.hidden = true;
        if (spaceSelectButton) spaceSelectButton.setAttribute("aria-expanded", "false");
        await showCreateSpaceManager();
      };
    }
    refreshSpaceIndicator();
    document.getElementById("lc-modal-close-btn").onclick = closeModal;
    document.getElementById("lc-btn-cancel").onclick = closeModal;
    document.getElementById("lc-btn-save").onclick = saveCard;
    bindTagsInput();
    refreshQuickSpaceSelector();
  }
  function openModal(editData, initialLangs) {
    syncThemeClass();
    const overlay = document.getElementById("lc-modal-overlay");
    if (!overlay) return;
    lockPageScroll();
    overlay.style.display = "flex";
    clearError();
    refreshSpaceIndicator();
    state.editingMemoName = editData && editData.name ? editData.name : null;
    if (!state.editingMemoName && state.types.length) {
      setActiveType(state.types[0].id, false);
    }
    const isV3Edit = Boolean(editData && editData.version === 3);
    state.editingVersion = isV3Edit ? 3 : state.editingMemoName ? 2 : 3;
    const type = state.editingVersion === 3 ? isV3Edit && editData.type || state.activeType || activeTypeForNew(state.types, getCurrentSpace()) : defaultType(null);
    state.editingType = type;
    if (state.editingVersion === 3) state.activeType = type;
    const quickSelect = document.getElementById("lc-space-select");
    if (quickSelect) quickSelect.style.display = state.editingMemoName ? "none" : "";
    refreshQuickSpaceSelector();
    const titleText = document.getElementById("lc-modal-title-text");
    if (titleText) {
      titleText.innerText = state.editingMemoName ? `Edit · ${type.name}` : `#${type.order + 1} · ${type.name}`;
    }
    const saveBtn = document.getElementById("lc-btn-save");
    if (saveBtn) saveBtn.innerText = state.editingMemoName ? "Update Card" : "Save Card";
    const keys = type.sections.map((s) => s.key);
    const values = {};
    if (isV3Edit) {
      keys.forEach((k) => {
        values[k] = editData.values && editData.values[k] || "";
      });
    } else {
      CONFIG.languages.forEach((l) => {
        values[l.key] = editData && editData[l.key] || "";
      });
    }
    const tagsEl = document.getElementById("lc-input-tags");
    if (tagsEl) tagsEl.value = editData && editData.tags || "";
    state.hiddenExplanationSections = isV3Edit && Array.isArray(editData.hiddenExplanationSections) ? editData.hiddenExplanationSections.filter((key) => keys.includes(key)) : [];
    state.modalActiveLangs = initialLangs && initialLangs.length ? keys.filter((k) => initialLangs.includes(k)) : keys.filter((k) => !type.sections.some((s) => s.key === k && s.defaultHidden));
    if (!state.modalActiveLangs.length) state.modalActiveLangs = [...keys];
    renderEditorForType(
      type,
      values,
      isV3Edit ? editData.explanations : {},
      isV3Edit ? editData.unifiedExplanation : ""
    );
    updateModalEditorSlots();
    updateSpaceHint(type.spaceName, type.spaceTitle);
    hideTagAutocomplete();
    tagStore.scanPage();
    tagStore.fetchServer();
    const firstKey = state.modalActiveLangs.includes("en") ? "en" : state.modalActiveLangs[0];
    const firstInput = document.getElementById(`lc-input-${firstKey}`);
    if (firstInput) setTimeout(() => firstInput.focus(), 60);
  }
  function closeModal() {
    hideTagAutocomplete();
    const overlay = document.getElementById("lc-modal-overlay");
    if (overlay) overlay.style.display = "none";
    unlockPageScroll();
  }
  function buildCardPayload() {
    const rawTags = (document.getElementById("lc-input-tags")?.value || "").trim();
    const sections = currentSections();
    if (state.editingVersion === 3 && state.editingType) {
      const type = state.editingType;
      const values = {};
      sections.forEach((s) => {
        values[s.key] = (document.getElementById(`lc-input-${s.key}`)?.value || "").trim();
      });
      const explanations = {};
      sections.forEach((s) => {
        explanations[s.key] = (document.getElementById(`lc-explain-${s.key}`)?.value || "").trim();
      });
      const unifiedExplanation = (document.getElementById("lc-explain-unified")?.value || "").trim();
      const result = buildCardContentV3(
        type,
        values,
        explanations,
        true,
        rawTags,
        state.modalActiveLangs,
        unifiedExplanation,
        state.hiddenExplanationSections
      );
      return { content: result.content, tags: result.tags, hasAny: result.hasAny, data: result.data };
    }
    const data = { _t: CONFIG.typeIdentifier, v: CONFIG.cardVersion };
    let hasAny = false;
    CONFIG.languages.forEach((lang) => {
      const val = (document.getElementById(`lc-input-${lang.key}`)?.value || "").trim();
      if (val) {
        data[lang.key] = val;
        hasAny = true;
      }
    });
    const tags = normalizeTags(rawTags);
    const content = JSON.stringify(data) + (tags ? `
${tags}` : "");
    return { data, tags, content, hasAny };
  }
  function updatePreview() {
    const previewEl = document.getElementById("lc-json-preview");
    if (!previewEl) return;
    const { content } = buildCardPayload();
    previewEl.innerText = content;
  }
  function showError(msg) {
    const errBox = document.getElementById("lc-modal-error");
    if (errBox) {
      errBox.innerText = msg;
      errBox.style.display = "block";
    }
  }
  function clearError() {
    const errBox = document.getElementById("lc-modal-error");
    if (errBox) {
      errBox.innerText = "";
      errBox.style.display = "none";
    }
  }
  async function saveCard() {
    clearError();
    const { content, hasAny } = buildCardPayload();
    if (!hasAny) {
      showError("Please fill in at least one language slot!");
      return;
    }
    const saveBtn = document.getElementById("lc-btn-save");
    saveBtn.disabled = true;
    saveBtn.innerText = "Saving...";
    const isEdit = Boolean(state.editingMemoName);
    const payload = {
      content,
      visibility: "PRIVATE"
    };
    let url = "/api/memos";
    let method = "POST";
    const bareId = isEdit ? (state.editingMemoName || "").replace(/^memos\//, "").trim() : "";
    const usePatch = isEdit && bareId.length > 0;
    if (usePatch) {
      url = `/api/memos/${encodeURIComponent(bareId)}?updateMask=content`;
      method = "PATCH";
    } else {
      let dedicatedSpace = state.editingType && state.editingType.spaceName;
      try {
        const resolved = await resolveTargetSpace();
        dedicatedSpace = dedicatedSpace || resolved.space;
      } catch (e) {
        console.warn("[LanguageCard] target space resolution failed", e);
      }
      const targetSpace = dedicatedSpace || getCurrentSpace();
      if (targetSpace) payload.space = targetSpace;
    }
    try {
      let token = await getMemosAuthToken();
      const sendRequest = async (authToken, requestUrl) => {
        const headers = {
          "Content-Type": "application/json"
        };
        if (authToken) {
          headers["Authorization"] = `Bearer ${authToken}`;
        }
        try {
          return await fetch(requestUrl || url, {
            method,
            headers,
            credentials: "include",
            body: JSON.stringify(payload)
          });
        } catch (networkErr) {
          throw new Error(`Network error (${method} ${requestUrl || url}): ${networkErr.message}`);
        }
      };
      let res = await sendRequest(token);
      if (res.status === 401) {
        clearTargetSpaceCache();
        token = await getMemosAuthToken(true);
        if (token) {
          res = await sendRequest(token);
        }
      }
      if (isLegacyFallbackStatus(res.status) && url.startsWith("/api/")) {
        const legacyUrl = url.replace(/^\/api\//, "/api/v1/");
        res = await sendRequest(token, legacyUrl);
        url = legacyUrl;
      }
      if (res.status === 403) {
        clearTargetSpaceCache();
      }
      if (!res.ok) {
        const rawBody = await res.text().catch(() => "");
        let serverMsg = "";
        try {
          const errJson = JSON.parse(rawBody);
          serverMsg = errJson.message || errJson.code || "";
        } catch (_) {
        }
        console.error("[LanguageCard] Save failed", {
          page: window.location.href,
          request: `${method} ${url}`,
          absoluteUrl: res.url || url,
          status: res.status,
          statusText: res.statusText,
          usePatch,
          space: payload.space || null,
          hasAuthToken: Boolean(token),
          responseBody: rawBody.slice(0, 1e3)
        });
        const bodySnippet = (serverMsg || rawBody).replace(/\s+/g, " ").trim().slice(0, 200);
        throw new Error(
          `HTTP ${res.status}${res.statusText ? " " + res.statusText : ""} — ${method} ${res.url || url}` + (bodySnippet ? ` — ${bodySnippet}` : "") + ` (page: ${window.location.href})`
        );
      }
      const savedRawTags = (document.getElementById("lc-input-tags")?.value || "").trim();
      if (savedRawTags) {
        savedRawTags.split(/[\s,]+/).forEach((t) => tagStore.add(t));
      }
      currentSections().forEach((s) => {
        const txt = document.getElementById(`lc-input-${s.key}`)?.value || "";
        (txt.match(/#[^\s#]+/g) || []).forEach((t) => tagStore.add(t));
      });
      [...currentSections().map((s) => `lc-input-${s.key}`), "lc-input-tags"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });
      if (usePatch) {
        refreshCardLocally(state.editingMemoName, content);
      }
      state.editingMemoName = null;
      closeModal();
    } catch (err) {
      showError("Failed to save card: " + err.message);
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerText = state.editingMemoName ? "Update Card" : "Save Card";
    }
  }

  // src/card-render.js
  function getMemoNameFromContainer(container) {
    const own = container.getAttribute("data-lc-memo-name");
    if (own) return own;
    const article = container.closest("article");
    const holders = [
      container.querySelector("[data-memo-name]"),
      container.closest("[data-memo-name]"),
      article && article.querySelector("[data-memo-name]")
    ];
    for (const holder of holders) {
      const value = holder && holder.getAttribute("data-memo-name");
      if (value) return value;
    }
    const link = article && article.querySelector('a[href^="/memos/"]');
    if (link) {
      const match = (link.getAttribute("href") || "").match(/^\/(memos\/[^/?#]+)/);
      if (match) return match[1];
    }
    return null;
  }
  function renderV3Card(container, parsed, tags, memoName) {
    const baseType = typeForMemo(state.types, memoName, getCurrentSpace(), state.memoSpaceCache);
    const known = sectionKeys(baseType);
    const extras = Object.keys(parsed.values || {}).filter((k) => !known.includes(k));
    const type = extras.length ? {
      ...baseType,
      sections: [
        ...baseType.sections,
        ...extras.map((k) => ({
          key: k,
          label: k,
          code: String(k).slice(0, 4).toUpperCase(),
          color: "#94a3b8"
        }))
      ]
    } : baseType;
    const values = valuesFor(parsed, type);
    const explanations = sectionExplanationsFor(parsed, type);
    const unifiedExplanation = unifiedExplanationFor(parsed, type);
    const activeKeys = (parsed.enabledSections || []).filter((key) => known.includes(key) || extras.includes(key));
    const valueKeys = type.sections.filter((s) => values[s.key]).map((s) => s.key);
    const visibleKeys = activeKeys.length ? activeKeys : valueKeys.length ? valueKeys : type.sections.map((s) => s.key);
    const wrapper = document.createElement("div");
    wrapper.className = "lc-card-wrapper";
    const noteBar = document.createElement("div");
    noteBar.className = "lc-card-note-bar";
    const controls = document.createElement("div");
    controls.className = "lc-card-note-controls";
    if (memoName) {
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "lc-btn-icon lc-card-edit-btn";
      editBtn.title = "Edit this card";
      editBtn.innerText = "✏️";
      editBtn.onclick = (e) => {
        e.stopPropagation();
        openModal({
          name: memoName,
          tags: tags.join(" "),
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
    const grid = document.createElement("div");
    grid.className = "lc-card-grid";
    grid.style.setProperty("--lc-cols", Math.max(1, visibleKeys.length));
    type.sections.forEach((section) => {
      const slot = document.createElement("div");
      slot.className = "lc-card-slot";
      slot.setAttribute("data-lc-slot", section.key);
      slot.style.display = visibleKeys.includes(section.key) ? "flex" : "none";
      const header = document.createElement("div");
      header.className = "lc-card-header";
      const badge = document.createElement("span");
      badge.className = "lc-card-badge";
      badge.style.color = section.color;
      badge.innerText = section.label;
      header.appendChild(badge);
      slot.appendChild(header);
      const val = values[section.key];
      const textEl = document.createElement("div");
      textEl.className = "lc-card-text" + (val ? "" : " lc-card-empty");
      textEl.innerText = val || "—";
      slot.appendChild(textEl);
      grid.appendChild(slot);
    });
    wrapper.appendChild(grid);
    const boxes = document.createElement("div");
    boxes.className = "lc-card-explanations";
    boxes.style.setProperty("--lc-cols", Math.max(1, visibleKeys.length));
    type.sections.forEach((section) => {
      const text = explanations[section.key];
      if (!text || !visibleKeys.includes(section.key) || (parsed.hiddenExplanationSections || []).includes(section.key)) return;
      const box = document.createElement("div");
      box.className = "lc-card-explanation";
      box.setAttribute("data-lc-explanation", section.key);
      box.style.gridColumn = String(visibleKeys.indexOf(section.key) + 1);
      box.innerText = text;
      boxes.appendChild(box);
    });
    if (boxes.children.length) wrapper.appendChild(boxes);
    if (unifiedExplanation) {
      const box = document.createElement("div");
      box.className = "lc-card-explanation lc-card-explanation-global";
      box.innerText = unifiedExplanation;
      wrapper.appendChild(box);
    }
    if (tags.length > 0) {
      const tagsContainer = document.createElement("div");
      tagsContainer.className = "lc-card-tags";
      tags.forEach((tag) => {
        const chip = document.createElement("span");
        chip.className = "lc-tag-chip";
        chip.innerText = tag;
        tagsContainer.appendChild(chip);
      });
      wrapper.appendChild(tagsContainer);
    }
    container.innerHTML = "";
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
      const forced = container.hasAttribute("data-lc-force");
      container.removeAttribute("data-lc-force");
      const hasWrapper = Boolean(container.querySelector(".lc-card-wrapper"));
      if (!forced && container.hasAttribute("data-lc-raw") && hasWrapper) return;
      const liveText = container.innerText.trim();
      if (!forced) {
        if (liveText.includes("{")) {
          container.setAttribute("data-lc-raw", liveText);
          container.removeAttribute("data-lc-memo-name");
        } else if (!container.getAttribute("data-lc-raw")) {
          container.setAttribute("data-lc-raw", liveText);
        }
        if (!liveText) return;
      }
      const rawText = container.getAttribute("data-lc-raw");
      const parsed = parseAnyCard(rawText, currentSpace);
      if (!parsed) return;
      container.setAttribute("data-lc-parsed", "true");
      const { data, tags } = parsed;
      if (tags && tags.length > 0) {
        tags.forEach((t) => tagStore.add(t));
      }
      const memoName = getMemoNameFromContainer(container);
      if (memoName) container.setAttribute("data-lc-memo-name", memoName);
      if (parsed.version === 3) {
        renderV3Card(container, parsed, tags, memoName);
        return;
      }
      const cardWrapper = document.createElement("div");
      cardWrapper.className = "lc-card-wrapper";
      const cardLangs = cardPresentLangs(data);
      const activeLangs = new Set(
        (cardLangs.length > 0 ? cardLangs : globalEnabled).filter(
          (k) => CONFIG.languages.some((l) => l.key === k)
        )
      );
      const noteBar = document.createElement("div");
      noteBar.className = "lc-card-note-bar";
      const noteControls = document.createElement("div");
      noteControls.className = "lc-card-note-controls";
      if (memoName) {
        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.className = "lc-btn-icon lc-card-edit-btn";
        editBtn.title = "Edit this card";
        editBtn.innerText = "✏️";
        editBtn.onclick = (e) => {
          e.stopPropagation();
          const editValues = { name: memoName, tags: tags.join(" "), version: 2 };
          CONFIG.languages.forEach((l) => {
            editValues[l.key] = cardLangValue(data, l.key);
          });
          openModal(editValues, Array.from(activeLangs));
        };
        noteControls.appendChild(editBtn);
      }
      noteBar.appendChild(noteControls);
      cardWrapper.appendChild(noteBar);
      const grid = document.createElement("div");
      grid.className = "lc-card-grid";
      grid.style.setProperty("--lc-cols", Math.max(1, activeLangs.size));
      CONFIG.languages.forEach((lang) => {
        const val = cardLangValue(data, lang.key);
        const slot = document.createElement("div");
        slot.className = "lc-card-slot";
        slot.setAttribute("data-lc-slot", lang.key);
        slot.style.display = activeLangs.has(lang.key) ? "flex" : "none";
        const header = document.createElement("div");
        header.className = "lc-card-header";
        const badge = document.createElement("span");
        badge.className = "lc-card-badge";
        badge.style.color = lang.color;
        badge.innerText = lang.label;
        header.appendChild(badge);
        slot.appendChild(header);
        const textEl = document.createElement("div");
        textEl.className = "lc-card-text" + (val ? "" : " lc-card-empty");
        textEl.innerText = val || "—";
        slot.appendChild(textEl);
        grid.appendChild(slot);
      });
      cardWrapper.appendChild(grid);
      if (tags.length > 0) {
        const tagsContainer = document.createElement("div");
        tagsContainer.className = "lc-card-tags";
        tags.forEach((tag) => {
          const chip = document.createElement("span");
          chip.className = "lc-tag-chip";
          chip.innerText = tag;
          tagsContainer.appendChild(chip);
        });
        cardWrapper.appendChild(tagsContainer);
      }
      container.innerHTML = "";
      container.appendChild(cardWrapper);
    });
  }
  function refreshCardLocally(memoName, newRawText) {
    document.querySelectorAll("[data-lc-memo-name]").forEach((el) => {
      if (el.getAttribute("data-lc-memo-name") === memoName) {
        el.setAttribute("data-lc-raw", newRawText);
        el.removeAttribute("data-lc-parsed");
        el.setAttribute("data-lc-force", "1");
      }
    });
    renderLanguageCards();
  }
  function forceRerenderCards() {
    document.querySelectorAll("[data-lc-parsed]").forEach((el) => {
      el.setAttribute("data-lc-force", "1");
    });
    renderLanguageCards();
  }

  // src/quick-actions.js
  var QUICK_ACTION_TIMEOUT_MS = 1200;
  function findMoreTrigger(actionsEl) {
    if (!actionsEl) return null;
    return actionsEl.querySelector(
      'button[aria-label="More"], button[data-slot="dropdown-menu-trigger"]'
    );
  }
  function findMenuForTrigger(triggerEl) {
    const menus = [...document.querySelectorAll('[role="menu"]')];
    if (triggerEl && triggerEl.id) {
      return menus.find((m) => m.getAttribute("aria-labelledby") === triggerEl.id) || null;
    }
    return menus.length ? menus[menus.length - 1] : null;
  }
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
  function findMenuItem(menu, label, iconName) {
    if (!menu) return null;
    const items = [...menu.querySelectorAll('[role="menuitem"]')];
    const textOf = (el) => (el.innerText || "").trim();
    const lowerLabel = String(label).toLowerCase();
    let item = items.find((el) => textOf(el) === label);
    if (!item) item = items.find((el) => textOf(el).toLowerCase().includes(lowerLabel));
    if (!item && iconName) {
      try {
        item = items.find((el) => el.querySelector("svg." + iconName));
      } catch (e) {
      }
    }
    return item || null;
  }
  function closeMenuForTrigger(triggerEl) {
    if (triggerEl && findMenuForTrigger(triggerEl)) triggerEl.click();
  }
  async function triggerNativeAction(actionsEl, action) {
    const trigger = findMoreTrigger(actionsEl);
    if (!trigger) return;
    let menu = findMenuForTrigger(trigger);
    if (!menu) {
      trigger.click();
      menu = await waitForMenu(trigger, QUICK_ACTION_TIMEOUT_MS);
      if (!menu) {
        trigger.click();
        menu = await waitForMenu(trigger, QUICK_ACTION_TIMEOUT_MS);
      }
    }
    if (!menu) {
      console.warn('[LanguageCard] quick action "' + action.label + '": dropdown menu did not open');
      return;
    }
    let currentMenu = menu;
    for (let i = 0; i < action.path.length - 1; i++) {
      const subTrigger = findMenuItem(currentMenu, action.path[i]);
      if (!subTrigger) {
        closeMenuForTrigger(trigger);
        return;
      }
      subTrigger.dispatchEvent(new MouseEvent("pointermove", { bubbles: true }));
      subTrigger.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      subTrigger.click();
      const subMenu = await waitForMenu(subTrigger, QUICK_ACTION_TIMEOUT_MS);
      if (!subMenu) {
        closeMenuForTrigger(trigger);
        return;
      }
      currentMenu = subMenu;
    }
    const leafLabel = action.path[action.path.length - 1];
    let item = action.menuItemSelector ? currentMenu.querySelector(action.menuItemSelector) : null;
    if (!item) item = findMenuItem(currentMenu, leafLabel, action.iconName);
    if (!item) {
      console.warn('[LanguageCard] quick action "' + action.label + '": menu item not found');
      closeMenuForTrigger(trigger);
      return;
    }
    item.click();
  }
  function buildQuickActionButton(actionsEl, action, moreBtn) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = (moreBtn.className ? moreBtn.className + " " : "") + "lc-quick-action";
    btn.setAttribute("aria-label", action.label);
    btn.title = action.label;
    btn.innerHTML = action.icon;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      triggerNativeAction(actionsEl, action);
    });
    return btn;
  }
  function injectQuickActions() {
    const actions = CONFIG.quickActions || [];
    const clusterActions = actions.filter((a) => a.placement !== "far-left");
    const farLeftActions = actions.filter((a) => a.placement === "far-left");
    if (!clusterActions.length && !farLeftActions.length) return;
    document.querySelectorAll('article [data-slot="memo-header-actions"]').forEach((actionsEl) => {
      const moreBtn = findMoreTrigger(actionsEl);
      if (!moreBtn) return;
      if (clusterActions.length && !actionsEl.hasAttribute("data-lc-quick-actions")) {
        actionsEl.setAttribute("data-lc-quick-actions", "1");
        const fragment = document.createDocumentFragment();
        clusterActions.forEach((action) => {
          fragment.appendChild(buildQuickActionButton(actionsEl, action, moreBtn));
        });
        actionsEl.insertBefore(fragment, moreBtn);
      }
      if (farLeftActions.length) {
        const row = actionsEl.closest("article");
        const meta = row ? row.querySelector('[data-slot="memo-header-meta"]') : null;
        const leftGroup = meta && meta.parentElement;
        const anchor = leftGroup || actionsEl;
        if (!anchor.querySelector(".lc-quick-action-far-left")) {
          farLeftActions.forEach((action) => {
            const btn = buildQuickActionButton(actionsEl, action, moreBtn);
            btn.classList.add("lc-quick-action-far-left");
            anchor.insertBefore(btn, anchor.firstChild);
          });
        }
      }
    });
  }

  // src/main.js
  function injectStyles(css) {
    if (!css || typeof document === "undefined" || document.getElementById("lc-injected-style")) return;
    const style = document.createElement("style");
    style.id = "lc-injected-style";
    style.textContent = css;
    (document.head || document.body).appendChild(style);
  }
  injectStyles(styles_default);
  getCardTypes().then(() => warmMemoSpaceCache()).then(() => forceRerenderCards()).catch(() => {
  });
  var debounceTimer = null;
  var observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      renderLanguageCards();
      injectCreatorUI();
      injectQuickActions();
    }, 120);
  });
  observer.observe(document.body, { childList: true, subtree: true });
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      renderLanguageCards();
      injectCreatorUI();
      injectQuickActions();
    });
  } else {
    renderLanguageCards();
    injectCreatorUI();
    injectQuickActions();
  }
})();
