# AGENTS.md

Instructions and engineering guidelines for coding agents working in this repository.

## Required implementation and deployment workflow

1. Make the requested changes, then run the relevant tests (`npm test` from
   `memos-plugin/` for plugin changes).
2. After edits and tests are complete, run
   `npm run verify:deploy` from `memos-plugin/` and wait for it to exit. This
   command rebuilds the final `dist/` artifacts, uploads both Additional
   Script and Additional Style, and reads them back from the Memos 0.31.0
   instance. Continue only if it exits successfully and prints
   `VERIFY_DEPLOY_OK`; a watcher build message is not deployment confirmation.
3. Then use the available Chrome MCP to refresh the relevant Memos page and
   verify the requested behavior in the live UI. Report separately whether
   build/upload verification and browser verification passed. Do not claim the
   feature is verified if either step was unavailable or failed.

The final verification command writes to the configured Memos instance. If
`.env` is missing or still has placeholder values, it creates/preserves the
ignored template and fails clearly; ask the user to configure it rather than
skipping the deployment gate or exposing credentials.

## Repository references

Before changing this project, keep these repository-specific references and
version boundaries in mind:

- `/memos` is upstream `main` development source. It may be ahead of the
  latest release candidate and does not necessarily match the user's server.
- `/memos-api-docs/` contains the newest crawled API documentation, not the
  user's server API. The user's Memos server is 0.31.0 and uses the v1 API.
  For API changes, verify the 0.31.0 contract first; see the API version notes
  in [memos-plugin/AI-LOG.md](./memos-plugin/AI-LOG.md).
- `/memos/web` contains the official web client and is a useful reference for
  UI behavior that overlaps with this plugin.

Do not assume the newest workspace API docs or `/memos` source apply to the
0.31.0 server.

## Tone & Personality 

- avoid padding, long winded paragraph, jargon, defensive hedging.
- skip intros, restating your request, and line-by-line code recaps—only state what changed, why, and any open issues.

## Code Style & Modularity

- **Prefer modular code**: Organize code into cohesive, single-responsibility modules with clear boundaries and minimal coupling.
- **Keep functions small and focused**: Each function should do one thing well, making it easy to read, test, and maintain. Extract helper functions or separate modules when logic grows complex or handles multiple concerns.
- **Keep UI and backend separate**: Maintain strict separation between UI and backend/domain logic so either layer can evolve independently.

## File Length Limits

- **Target concise files**: Aim to keep single files under **500 lines**, and treat **1,000 lines** as a soft ceiling (maximum length).
- **Split large files**: If a file approaches 1,000 lines, split it into smaller, focused modules unless there is a clear reason to keep it together (such as generated code or large test fixtures).

## Architecture Maintenance

- **Keep `ARCHITECTURE.md` up to date**: At the end of every round of changes, review and update `ARCHITECTURE.md` to reflect any new modules, changed responsibilities, updated data flows, or architectural decisions before concluding the task.
- **Describe current state, not a changelog**: `ARCHITECTURE.md` must always reflect the *current* architecture of the system—never turn it into a changelog, commit history, or chronological list of past edits. Update existing sections in place rather than appending dated entries, "Recent Changes" logs, or "Changed X to Y" notes.
- **Maintain `/docs/` for backend APIs**: Keep backend API contracts, state models, and interfaces documented in `/docs/` so the UI can be modified without reading backend code.