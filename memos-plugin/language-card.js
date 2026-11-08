/* ============================================================================
 * Language Card Extension for Memos - GENERATED FILE, DO NOT EDIT HERE.
 * Sources: src/*.js and src/styles/language-card.css
 * Rebuild: npm run build (or npm run watch for automatic rebuilds)
 * Paste this whole file into Settings -> System -> Additional Script.
 * ============================================================================ */
"use strict";
(() => {
  // lc-css:styles/language-card.css
  var language_card_default = `/* ==========================================================================
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

.lc-card-note-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--lc-text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0.8;
}

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
  margin: 6px 0 10px 0;
  box-sizing: border-box;
}

.lc-card-slot {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 8px 10px;
  border-radius: 9px;
  border: 1px solid var(--lc-border-card);
  background: var(--lc-bg-card);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
  min-width: 0;
}

@media (min-width: 640px) {
  .lc-card-slot {
    padding: 10px 14px;
    border-radius: 10px;
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

/* --- Floating Action Bar (Pills + Button) --- */
.lc-floating-bar {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 8px;
}

.lc-lang-toggles {
  display: inline-flex;
  align-items: center;
  padding: 3px 4px;
  background: var(--lc-modal-bg);
  border: 1px solid var(--lc-modal-border);
  border-radius: 30px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  gap: 2px;
}

.lc-lang-btn {
  padding: 3px 8px;
  border-radius: 20px;
  border: 1px solid transparent;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  background: transparent;
  color: var(--lc-text-muted);
  transition: all 0.15s ease;
  user-select: none;
}

.lc-lang-btn.active {
  background: rgba(140, 140, 140, 0.15);
  color: var(--lc-text-primary);
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
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--lc-modal-border);
  gap: 10px;
  flex-wrap: wrap;
}

.lc-modal-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
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

/* --- Space Indicator (replaces the old _t badge in the modal header) --- */
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

.lc-modal-header-actions {
  display: flex;
  align-items: center;
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
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-height: 75vh;
  overflow-y: auto;
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

/* Very narrow phones: three icons + reaction + three-dots would cramp the
   header, so keep the three-dots menu as the only path there. */
@media (max-width: 479px) {
  .lc-quick-action {
    display: none !important;
  }
}

/* --- Space Info Popup (opened from the space indicator) --- */
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
`;

  // src/config.js
  var CONFIG = {
    typeIdentifier: "lc",
    cardVersion: 2,
    dedicatedSpaceKeyword: null,
    // Ordered: JA (left) -> EN (middle) -> ZH (right)
    languages: [
      { key: "ja", label: "日本語", code: "JA", color: "#fbbf24", ttsLang: "ja-JP", placeholder: "e.g. セレンディピティ" },
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
    // Add / remove entries to change the quick action set.
    quickActions: [
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
      }
    ]
  };
  var LS_GLOBAL_LANGS_KEY = "memos_lc_enabled_langs_v2";

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
  function stripSpacePrefix(name) {
    return String(name || "").replace(/^spaces\//, "");
  }
  function getCardHeaderJson() {
    return JSON.stringify({ _t: CONFIG.typeIdentifier, v: CONFIG.cardVersion });
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

  // src/api.js
  function isLegacyFallbackStatus(status) {
    return status === 404 || status === 410;
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

  // src/spaces.js
  var LS_TARGET_SPACE_KEY = "memos_lc_target_space_v2";
  function parseSpaceHeader(description) {
    if (!description || !description.includes("{")) return null;
    const start = description.indexOf("{");
    const end = description.lastIndexOf("}");
    if (start === -1 || end <= start) return null;
    try {
      const data = JSON.parse(description.substring(start, end + 1));
      return data && data._t === CONFIG.typeIdentifier ? data : null;
    } catch (e) {
      return null;
    }
  }
  async function findDedicatedSpaces() {
    const token = await getMemosAuthToken();
    const spaces = await fetchAllSpaces(token);
    return spaces.filter((space) => parseSpaceHeader(space.description)).sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }
  function readCachedTargetSpace() {
    try {
      const raw = localStorage.getItem(LS_TARGET_SPACE_KEY);
      if (!raw) return null;
      if (raw.startsWith("{")) {
        const parsed = JSON.parse(raw);
        return parsed && parsed.name ? { name: parsed.name, title: parsed.title || "" } : null;
      }
      return { name: raw, title: "" };
    } catch (e) {
      return null;
    }
  }
  function writeCachedTargetSpace(name, title) {
    try {
      localStorage.setItem(LS_TARGET_SPACE_KEY, JSON.stringify({ name, title: title || "" }));
    } catch (e) {
    }
  }
  async function resolveTargetSpace(options) {
    const force = Boolean(options && options.force);
    if (!force) {
      const cached = readCachedTargetSpace();
      if (cached) return { space: cached.name, title: cached.title, matches: null, fromCache: true };
    }
    const matches = await findDedicatedSpaces();
    if (matches.length === 1) {
      writeCachedTargetSpace(matches[0].name, matches[0].title || "");
      return { space: matches[0].name, title: matches[0].title || "", matches, fromCache: false };
    }
    clearTargetSpaceCache();
    return { space: null, title: "", matches, fromCache: false };
  }
  function clearTargetSpaceCache() {
    try {
      localStorage.removeItem(LS_TARGET_SPACE_KEY);
    } catch (e) {
    }
  }
  function setSpaceIndicatorState(state2, text) {
    const btn = document.getElementById("lc-space-indicator");
    const textEl = document.getElementById("lc-space-indicator-text");
    if (!btn || !textEl) return;
    btn.classList.remove("lc-si-loading", "lc-si-ok", "lc-si-warn", "lc-si-missing");
    btn.classList.add(`lc-si-${state2}`);
    textEl.innerText = text;
    btn.title = `${text} — click for details`;
  }
  function updateSpaceHint(spaceName, spaceTitle) {
    const hint = document.getElementById("lc-space-hint");
    if (!hint) return;
    const label = spaceTitle || (spaceName ? stripSpacePrefix(spaceName) : "");
    hint.innerText = spaceName ? `Target Space: ${label}` : "Target Space: Personal Space";
  }
  async function refreshSpaceIndicator(force) {
    if (state.spaceResolutionInFlight) return state.spaceResolutionInFlight;
    state.spaceResolutionInFlight = (async () => {
      setSpaceIndicatorState("loading", "⏳ Checking spaces…");
      try {
        const result = await resolveTargetSpace({ force: Boolean(force) });
        if (result.space) {
          setSpaceIndicatorState("ok", `🃏 ${result.title || stripSpacePrefix(result.space)}`);
        } else if (result.matches && result.matches.length > 1) {
          setSpaceIndicatorState("warn", `⚠️ ${result.matches.length} spaces with header`);
        } else if (result.matches) {
          setSpaceIndicatorState("missing", "⛔ No space with header");
        } else {
          setSpaceIndicatorState("missing", "⛔ Space check failed");
        }
        if (result.space) {
          updateSpaceHint(result.space, result.title);
        } else {
          updateSpaceHint(getCurrentSpace(), "");
        }
        return result;
      } catch (err) {
        console.warn("[LanguageCard] space resolution failed", err);
        setSpaceIndicatorState("missing", "⛔ Space check failed");
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
    const overlay = document.getElementById("lc-space-info-overlay");
    const titleEl = document.getElementById("lc-space-info-title");
    const bodyEl = document.getElementById("lc-space-info-body");
    if (!overlay || !titleEl || !bodyEl) return;
    let title = "Language Card Space";
    let bodyHtml = "";
    if (!result) {
      title = "⚠️ Space check failed";
      bodyHtml = `<p>The space list could not be read from the server. This usually means the access token expired — reload the page and click the indicator again.</p>`;
    } else if (result.space) {
      title = "🃏 Language card space";
      const displayTitle = result.title || stripSpacePrefix(result.space);
      bodyHtml = `
        <p>New cards are saved into this space:</p>
        <div class="lc-space-info-name">${escapeHtml(displayTitle)}</div>
        ${result.title ? `<div class="lc-space-info-uid">uid: ${escapeHtml(stripSpacePrefix(result.space))}</div>` : ""}
        <p>It is identified by this header in its description:</p>
        ${spaceHeaderCodeHtml()}`;
    } else if (result.matches && result.matches.length > 1) {
      title = `⚠️ ${result.matches.length} spaces carry the header`;
      bodyHtml = `
        <p><b>Only one space</b> may carry the language card header, so no target space is selected. Remove the header from the description of all but one space:</p>
        <ul class="lc-space-info-list">
          ${result.matches.map((s) => `<li><b>${escapeHtml(s.title || stripSpacePrefix(s.name))}</b><span class="lc-space-info-uid">${escapeHtml(stripSpacePrefix(s.name))}</span></li>`).join("")}
        </ul>
        <p>This is the header to look for:</p>
        ${spaceHeaderCodeHtml()}`;
    } else {
      title = "⛔ No language card space found";
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
    const copyBtn = document.getElementById("lc-space-info-copy-btn");
    if (copyBtn) {
      copyBtn.onclick = (e) => {
        e.stopPropagation();
        copyText(getCardHeaderJson(), copyBtn);
      };
    }
    overlay.style.display = "flex";
    const onKey = (ev) => {
      if (ev.key === "Escape") {
        hideSpaceInfoPopup();
        document.removeEventListener("keydown", onKey, true);
      }
    };
    document.addEventListener("keydown", onKey, true);
  }
  function hideSpaceInfoPopup() {
    const overlay = document.getElementById("lc-space-info-overlay");
    if (overlay) overlay.style.display = "none";
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

  // src/editor.js
  function toggleModalLocalLang(key) {
    if (state.modalActiveLangs.includes(key)) {
      if (state.modalActiveLangs.length <= 1) return;
      state.modalActiveLangs = state.modalActiveLangs.filter((k) => k !== key);
    } else {
      const next = [...state.modalActiveLangs, key];
      state.modalActiveLangs = CONFIG.languages.map((l) => l.key).filter((k) => next.includes(k));
    }
    updateModalEditorSlots();
  }
  function updateFloatingBar() {
    const bar = document.getElementById("lc-floating-bar");
    if (!bar) return;
    const globalEnabled = getGlobalEnabledLangs();
    CONFIG.languages.forEach((l) => {
      const btn = document.getElementById(`lc-toggle-btn-${l.key}`);
      if (btn) {
        const isAct = globalEnabled.includes(l.key);
        btn.classList.toggle("active", isAct);
        btn.style.borderColor = isAct ? l.color : "transparent";
      }
    });
  }
  function updateModalEditorSlots() {
    const activeCount = CONFIG.languages.filter((l) => state.modalActiveLangs.includes(l.key)).length;
    const editorGrid = document.querySelector(".lc-editor-grid");
    if (editorGrid) {
      editorGrid.style.setProperty("--lc-editor-cols", Math.max(1, activeCount));
    }
    CONFIG.languages.forEach((l) => {
      const slotEl = document.getElementById(`lc-editor-col-${l.key}`);
      const pillBtn = document.getElementById(`lc-modal-toggle-${l.key}`);
      const isAct = state.modalActiveLangs.includes(l.key);
      if (slotEl) {
        slotEl.style.display = isAct ? "flex" : "none";
      }
      if (pillBtn) {
        pillBtn.classList.toggle("active", isAct);
        pillBtn.style.borderColor = isAct ? l.color : "transparent";
        pillBtn.style.color = isAct ? l.color : "var(--lc-text-muted)";
      }
    });
    updatePreview();
  }
  function injectCreatorUI() {
    if (document.getElementById("lc-floating-bar")) return;
    if (CONFIG.dedicatedSpaceKeyword) {
      if (!window.location.pathname.includes(CONFIG.dedicatedSpaceKeyword)) return;
    }
    const bar = document.createElement("div");
    bar.id = "lc-floating-bar";
    bar.className = "lc-floating-bar";
    const globalEnabled = getGlobalEnabledLangs();
    let togglesHtml = `<div class="lc-lang-toggles" title="Global language default for notes">`;
    CONFIG.languages.forEach((l) => {
      const isAct = globalEnabled.includes(l.key);
      togglesHtml += `
        <button type="button" id="lc-toggle-btn-${l.key}" class="lc-lang-btn ${isAct ? "active" : ""}" style="border-color:${isAct ? l.color : "transparent"}">
          ${l.code}
        </button>
      `;
    });
    togglesHtml += `</div>`;
    bar.innerHTML = `
      ${togglesHtml}
      <button id="lc-fab-btn" class="lc-fab">
        <span>🔤</span><span>New Card</span>
      </button>
    `;
    document.body.appendChild(bar);
    CONFIG.languages.forEach((l) => {
      const btn = document.getElementById(`lc-toggle-btn-${l.key}`);
      if (btn) {
        btn.onclick = (e) => {
          e.stopPropagation();
          toggleGlobalLang(l.key);
        };
      }
    });
    document.getElementById("lc-fab-btn").onclick = () => openModal();
    const overlay = document.createElement("div");
    overlay.id = "lc-modal-overlay";
    overlay.className = "lc-modal-overlay";
    overlay.style.display = "none";
    overlay.onclick = (e) => {
      if (e.target === overlay) closeModal();
    };
    overlay.innerHTML = `
      <div class="lc-modal-dialog">
        <div class="lc-modal-header">
          <div class="lc-modal-title-row">
            <h3 class="lc-modal-title">
              <span>🔤</span>
              <span id="lc-modal-title-text">New Language Card</span>
            </h3>
            <!-- Space indicator: replaces the old _t badge. Shows the dedicated
                 language card space (or warnings when it is ambiguous/missing) -->
            <button type="button" id="lc-space-indicator" class="lc-space-indicator lc-si-loading" title="Language card target space (click for details)">
              <span id="lc-space-indicator-text">⏳ Checking spaces…</span>
            </button>
          </div>

          <!-- Language Visibility Toggles in Modal (Local to this note) -->
          <div class="lc-modal-header-actions">
            <div class="lc-modal-lang-bar" title="Language slots for this card only">
              <span class="lc-modal-lang-label">This note:</span>
              ${CONFIG.languages.map((l) => `
                <button type="button" id="lc-modal-toggle-${l.key}" class="lc-modal-lang-chip ${globalEnabled.includes(l.key) ? "active" : ""}" style="border-color:${globalEnabled.includes(l.key) ? l.color : "transparent"}; color:${globalEnabled.includes(l.key) ? l.color : "var(--lc-text-muted)"}">
                  ${l.code}
                </button>
              `).join("")}
            </div>
            <button class="lc-modal-close" id="lc-modal-close-btn" title="Close (Esc)">&times;</button>
          </div>
        </div>

        <div class="lc-modal-body">
          <div id="lc-modal-error" style="display:none; color:#ef4444; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); border-radius:8px; padding:8px 12px; font-size:13px;"></div>

          <!-- Side-by-Side Card Editor Grid (JA on left, EN in middle, ZH on right) -->
          <div class="lc-editor-grid">
            <div class="lc-editor-slot lc-slot-ja" id="lc-editor-col-ja">
              <div class="lc-slot-header">
                <span class="lc-slot-badge ja" style="color: ${CONFIG.languages[0].color};">日本語 (ja)</span>
                <span class="lc-slot-hint">JA</span>
              </div>
              <textarea id="lc-input-ja" class="lc-slot-textarea" placeholder="e.g. セレンディピティ" rows="3"></textarea>
            </div>

            <div class="lc-editor-slot lc-slot-en" id="lc-editor-col-en">
              <div class="lc-slot-header">
                <span class="lc-slot-badge en" style="color: ${CONFIG.languages[1].color};">English (en)</span>
                <span class="lc-slot-hint">EN</span>
              </div>
              <textarea id="lc-input-en" class="lc-slot-textarea" placeholder="e.g. serendipity" rows="3"></textarea>
            </div>

            <div class="lc-editor-slot lc-slot-zh" id="lc-editor-col-zh">
              <div class="lc-slot-header">
                <span class="lc-slot-badge zh" style="color: ${CONFIG.languages[2].color};">中文 (zh)</span>
                <span class="lc-slot-hint">ZH</span>
              </div>
              <textarea id="lc-input-zh" class="lc-slot-textarea" placeholder="e.g. 意外发现珍宝的运气 / 缘分" rows="3"></textarea>
            </div>
          </div>

          <div class="lc-form-group" style="margin-top: 4px;">
            <label class="lc-form-label">Tags (separated by space or comma)</label>
            <input type="text" id="lc-input-tags" class="lc-form-input" placeholder="e.g. #vocab #daily #reading" autocomplete="off" />
          </div>

          <div class="lc-form-group">
            <label class="lc-form-label" style="display:flex; justify-content:space-between;">
              <span>Memos Payload Preview</span>
              <span id="lc-space-hint" style="font-weight: normal; font-size: 11px; opacity: 0.8;"></span>
            </label>
            <div id="lc-json-preview" class="lc-preview-box">{"_t":"lc","v":2}</div>
          </div>

          <!-- Language card header: paste into the description of the space that should receive cards -->
          <div class="lc-form-group">
            <label class="lc-form-label" style="display:flex; justify-content:space-between;">
              <span>Language Card Header (space description marker)</span>
              <span style="font-weight: normal; font-size: 11px; opacity: 0.8;">only one space may carry it</span>
            </label>
            <div class="lc-header-box">
              <code id="lc-header-json" class="lc-header-json"></code>
              <button type="button" id="lc-header-copy-btn" class="lc-header-copy-btn" title="Copy header JSON">📋</button>
            </div>
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
            <h3 class="lc-modal-title"><span id="lc-space-info-title">Language Card Space</span></h3>
          </div>
          <div class="lc-modal-header-actions">
            <button class="lc-modal-close" id="lc-space-info-close-btn" title="Close (Esc)">&times;</button>
          </div>
        </div>
        <div class="lc-modal-body" id="lc-space-info-body"></div>
        <div class="lc-modal-footer">
          <div style="font-size: 12px; color: var(--lc-text-muted);">Only one space may carry the language card header.</div>
          <div style="display:flex; gap:10px;">
            <button class="lc-btn lc-btn-primary" id="lc-space-info-ok-btn">Got it</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(infoOverlay);
    document.getElementById("lc-space-info-close-btn").onclick = hideSpaceInfoPopup;
    document.getElementById("lc-space-info-ok-btn").onclick = hideSpaceInfoPopup;
    const headerJsonEl = document.getElementById("lc-header-json");
    if (headerJsonEl) headerJsonEl.innerText = getCardHeaderJson();
    const headerCopyBtn = document.getElementById("lc-header-copy-btn");
    if (headerCopyBtn) {
      headerCopyBtn.onclick = (e) => {
        e.stopPropagation();
        copyText(getCardHeaderJson(), headerCopyBtn);
      };
    }
    const spaceIndicator = document.getElementById("lc-space-indicator");
    if (spaceIndicator) {
      spaceIndicator.onclick = async (e) => {
        e.stopPropagation();
        const result = await refreshSpaceIndicator(true);
        showSpaceInfoPopup(result);
      };
    }
    refreshSpaceIndicator();
    CONFIG.languages.forEach((l) => {
      const btn = document.getElementById(`lc-modal-toggle-${l.key}`);
      if (btn) {
        btn.onclick = (e) => {
          e.stopPropagation();
          toggleModalLocalLang(l.key);
        };
      }
    });
    document.getElementById("lc-modal-close-btn").onclick = closeModal;
    document.getElementById("lc-btn-cancel").onclick = closeModal;
    document.getElementById("lc-btn-save").onclick = saveCard;
    [...CONFIG.languages.map((l) => `lc-input-${l.key}`), "lc-input-tags"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", (e) => {
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
          if (handleTagAutocompleteKeydown(e, el)) {
            return;
          }
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            saveCard();
          }
          if (e.key === "Escape") {
            closeModal();
          }
        });
      }
    });
  }
  function openModal(editData, initialLangs) {
    syncThemeClass();
    const overlay = document.getElementById("lc-modal-overlay");
    if (!overlay) return;
    overlay.style.display = "flex";
    clearError();
    updateSpaceHint(getCurrentSpace());
    refreshSpaceIndicator();
    state.editingMemoName = editData && editData.name ? editData.name : null;
    const titleText = document.getElementById("lc-modal-title-text");
    if (titleText) {
      titleText.innerText = state.editingMemoName ? "Edit Language Card" : "New Language Card";
    }
    const saveBtn = document.getElementById("lc-btn-save");
    if (saveBtn) saveBtn.innerText = state.editingMemoName ? "Update Card" : "Save Card";
    const values = { tags: editData && editData.tags || "" };
    CONFIG.languages.forEach((l) => {
      values[l.key] = editData && editData[l.key] || "";
    });
    [...CONFIG.languages.map((l) => l.key), "tags"].forEach((key) => {
      const el = document.getElementById(`lc-input-${key}`);
      if (el) el.value = values[key];
    });
    state.modalActiveLangs = initialLangs && initialLangs.length ? CONFIG.languages.map((l) => l.key).filter((k) => initialLangs.includes(k)) : [...getGlobalEnabledLangs()];
    updateModalEditorSlots();
    hideTagAutocomplete();
    tagStore.scanPage();
    tagStore.fetchServer();
    const firstKey = state.modalActiveLangs.includes("en") ? "en" : state.modalActiveLangs[0] || "en";
    const firstInput = document.getElementById(`lc-input-${firstKey}`);
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 60);
    }
  }
  function closeModal() {
    hideTagAutocomplete();
    const overlay = document.getElementById("lc-modal-overlay");
    if (overlay) overlay.style.display = "none";
  }
  function buildCardPayload() {
    const data = { _t: CONFIG.typeIdentifier, v: CONFIG.cardVersion };
    let hasAny = false;
    CONFIG.languages.forEach((lang) => {
      const val = (document.getElementById(`lc-input-${lang.key}`)?.value || "").trim();
      if (val) {
        data[lang.key] = val;
        hasAny = true;
      }
    });
    const rawTags = (document.getElementById("lc-input-tags")?.value || "").trim();
    const tags = rawTags ? rawTags.split(/[\s,]+/).map((t) => t.startsWith("#") ? t : `#${t}`).filter((t) => t.length > 1).join(" ") : "";
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
      let dedicatedSpace = null;
      try {
        const resolved = await resolveTargetSpace();
        dedicatedSpace = resolved.space;
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
      CONFIG.languages.map((l) => `lc-input-${l.key}`).forEach((id) => {
        const txt = document.getElementById(id)?.value || "";
        (txt.match(/#[^\s#]+/g) || []).forEach((t) => tagStore.add(t));
      });
      [...CONFIG.languages.map((l) => `lc-input-${l.key}`), "lc-input-tags"].forEach((id) => {
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

  // src/state.js
  var state = {
    modalActiveLangs: ["en", "zh"],
    editingMemoName: null,
    spaceResolutionInFlight: null
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
  function setGlobalEnabledLangs(langs) {
    try {
      localStorage.setItem(LS_GLOBAL_LANGS_KEY, JSON.stringify(langs));
    } catch (e) {
    }
  }
  function toggleGlobalLang(key) {
    const current = getGlobalEnabledLangs();
    let next;
    if (current.includes(key)) {
      if (current.length <= 1) return;
      next = current.filter((k) => k !== key);
    } else {
      next = [...current, key];
      next = CONFIG.languages.map((l) => l.key).filter((k) => next.includes(k));
    }
    setGlobalEnabledLangs(next);
    document.querySelectorAll("[data-lc-parsed]").forEach((el) => {
      el.removeAttribute("data-lc-parsed");
      el.setAttribute("data-lc-force", "1");
    });
    renderLanguageCards();
    updateFloatingBar();
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
      const parsed = parseCardMemo(rawText, currentSpace);
      if (!parsed) return;
      container.setAttribute("data-lc-parsed", "true");
      const { data, tags } = parsed;
      if (tags && tags.length > 0) {
        tags.forEach((t) => tagStore.add(t));
      }
      const memoName = getMemoNameFromContainer(container);
      if (memoName) container.setAttribute("data-lc-memo-name", memoName);
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
      const titleEl = document.createElement("div");
      titleEl.className = "lc-card-note-title";
      titleEl.innerHTML = `<span>🔤</span><span>Card</span>`;
      noteBar.appendChild(titleEl);
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
          const editValues = { name: memoName, tags: tags.join(" ") };
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
    const item = findMenuItem(currentMenu, leafLabel, action.iconName);
    if (!item) {
      console.warn('[LanguageCard] quick action "' + action.label + '": menu item not found');
      closeMenuForTrigger(trigger);
      return;
    }
    item.click();
  }
  function injectQuickActions() {
    if (!CONFIG.quickActions || CONFIG.quickActions.length === 0) return;
    document.querySelectorAll('article [data-slot="memo-header-actions"]').forEach((actionsEl) => {
      if (actionsEl.hasAttribute("data-lc-quick-actions")) return;
      const moreBtn = findMoreTrigger(actionsEl);
      if (!moreBtn) return;
      actionsEl.setAttribute("data-lc-quick-actions", "1");
      const fragment = document.createDocumentFragment();
      CONFIG.quickActions.forEach((action) => {
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
        fragment.appendChild(btn);
      });
      actionsEl.insertBefore(fragment, moreBtn);
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
  injectStyles(language_card_default);
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
