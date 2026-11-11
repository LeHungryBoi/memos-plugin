# Agent Reference

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
