# Agent Reference

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
