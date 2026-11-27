# Memos Language Card

This repository contains a custom language-card UI for Memos, implemented with
Memos' Additional Script and Additional Style settings.

- Plugin source, build instructions, and deployment workflow: [memos-plugin/README.md](./memos-plugin/README.md)
- Historical implementation notes and API findings: [memos-plugin/AI-LOG.md](./memos-plugin/AI-LOG.md)

## Build the plugin

From `memos-plugin/`, run `npm ci` once, then `npm run build` to generate
`dist/language-card.js`. In VS Code, the folder-open watcher builds its initial
`.watch/` script automatically and rebuilds it when source files change.
