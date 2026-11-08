/** Memos REST / Connect calls, with 0.31 <-> 26.10+ path fallbacks. */

  // --- API Generation Compatibility ---
  // Two API generations exist in the wild:
  // - memos 0.31 (and older): /api/v1/... REST, /memos.api.v1.<Service>/<Method> Connect
  // - memos 26.10+ (current): /api/... REST, /memos.api.<Service>/<Method> Connect,
  //   and v1 paths answer 410 Gone
  // Requests below try the new path first and fall back to the legacy one.
  // Note: on 0.31 the new path is simply unknown -> 404 (NOT 410).
  function isLegacyFallbackStatus(status) {
    return status === 404 || status === 410;
  }

  /** GET the first path that does not answer 404/410; returns the last response otherwise */
  async function fetchJsonWithFallback(paths, token) {
    let lastRes = null;
    for (const path of paths) {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(path, { headers, credentials: 'include' });
      if (isLegacyFallbackStatus(res.status)) {
        lastRes = res;
        continue;
      }
      return res;
    }
    return lastRes;
  }

  /** List every space the current user belongs to (paginated) */
  async function fetchAllSpaces(token) {
    const spaces = [];
    let pageToken = '';
    do {
      const query = pageToken ? `?pageSize=1000&pageToken=${encodeURIComponent(pageToken)}` : '?pageSize=1000';
      const res = await fetchJsonWithFallback([`/api/spaces${query}`, `/api/v1/spaces${query}`], token);
      if (!res || !res.ok) throw new Error(`ListSpaces failed: HTTP ${res ? res.status : 'no response'}`);
      const json = await res.json();
      if (Array.isArray(json.spaces)) spaces.push(...json.spaces);
      pageToken = json.nextPageToken || '';
    } while (pageToken);
    return spaces;
  }

  /**
   * Automatically acquire active Memos Bearer token from the page context:
   * 1. Reads Memos's native localStorage memos_access_token
   * 2. If expired or missing, performs silent refresh via Memos's session cookie
   */
  async function getMemosAuthToken(forceRefresh = false) {
    if (!forceRefresh) {
      try {
        const stored = localStorage.getItem('memos_access_token');
        const expiresStr = localStorage.getItem('memos_token_expires_at');
        if (stored) {
          if (expiresStr) {
            const exp = new Date(expiresStr);
            if (exp.getTime() - Date.now() > 30000) {
              return stored;
            }
          } else {
            return stored;
          }
        }
      } catch (e) {
        // ignore
      }
    }

    // Silent refresh: try every known endpoint across both API generations.
    // New builds (26.10+) serve /memos.api.* + /api/auth/refresh; memos 0.31
    // serves /memos.api.v1.* + /api/v1/auth/refresh. Unknown paths 404, so a
    // simple sequential try is enough.
    const refreshEndpoints = [
      { url: '/memos.api.AuthService/RefreshToken', connect: true },
      { url: '/memos.api.v1.AuthService/RefreshToken', connect: true },
      { url: '/api/auth/refresh', connect: false },
      { url: '/api/v1/auth/refresh', connect: false }
    ];
    for (const endpoint of refreshEndpoints) {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (endpoint.connect) headers['Connect-Protocol-Version'] = '1';
        const res = await fetch(endpoint.url, {
          method: 'POST',
          headers: headers,
          credentials: 'include',
          body: '{}'
        });
        if (!res.ok) continue;
        const data = await res.json();
        // New builds: accessToken/accessTokenExpireTime; 0.31: same JSON names.
        const token = data.accessToken || data.access_token;
        if (token) {
          try {
            localStorage.setItem('memos_access_token', token);
            const expires = data.accessTokenExpireTime || data.expiresAt || data.expires_at;
            if (expires) localStorage.setItem('memos_token_expires_at', expires);
          } catch (e) {}
          return token;
        }
      } catch (e) {
        // try the next endpoint
      }
    }

    // Optional PAT or custom token fallback if present
    try {
      const pat = localStorage.getItem('memos_pat') || 
                  localStorage.getItem('memos_token') ||
                  localStorage.getItem('memos_access_token');
      if (pat) return pat;
    } catch (e) {}

    return null;
  }

export { isLegacyFallbackStatus, fetchJsonWithFallback, fetchAllSpaces, getMemosAuthToken };
