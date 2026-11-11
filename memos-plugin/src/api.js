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

/**
 * Write request with the same two-generation fallback as the GET helper.
 * Returns the response so callers can surface 401/403 to the user.
 */
  async function sendJsonWithFallback(paths, method, body, token) {
    let lastRes = null;
    for (const path of paths) {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(path, {
        method,
        headers,
        credentials: 'include',
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

  /** PATCH a space description (requires space administrator privileges). */
  async function updateSpaceDescription(spaceName, description, token) {
    const id = encodeURIComponent(String(spaceName || '').replace(/^spaces\//, ''));
    return sendJsonWithFallback(
      [`/api/spaces/${id}?updateMask=description`, `/api/v1/spaces/${id}?updateMask=description`],
      'PATCH',
      { name: spaceName, description },
      token
    );
  }

  /** Create a space; the authenticated caller becomes its first administrator. */
  async function createSpace(title, description, token) {
    return sendJsonWithFallback(
      ['/api/spaces', '/api/v1/spaces'],
      'POST',
      { title, description },
      token
    );
  }

  /** List memos inside one space (used by the compatibility scanner). */
  async function listMemosForSpace(spaceName, token) {
    const parent = encodeURIComponent(spaceName || '');
    const paths = [
      `/api/memos?parent=${parent}&pageSize=1000`,
      `/api/v1/memos?parent=${parent}&pageSize=1000`
    ];
    const res = await fetchJsonWithFallback(paths, token);
    if (!res || !res.ok) throw new Error(`ListMemos failed: HTTP ${res ? res.status : 'no response'}`);
    const json = await res.json();
    return Array.isArray(json.memos)
      ? json.memos.filter(memo => !memo.space || memo.space === spaceName)
      : [];
  }

  /** PATCH only the content of one memo (V3 migration wizard). */
  async function patchMemoContent(memoName, content, token) {
    const id = encodeURIComponent(String(memoName || '').replace(/^memos\//, ''));
    const paths = [
      `/api/memos/${id}?updateMask=content`,
      `/api/v1/memos/${id}?updateMask=content`
    ];
    const body = { content, visibility: 'PRIVATE' };
    let response = await sendJsonWithFallback(paths, 'PATCH', body, token);
    if (response && response.status === 401) {
      const refreshedToken = await getMemosAuthToken(true);
      if (refreshedToken) {
        response = await sendJsonWithFallback(paths, 'PATCH', body, refreshedToken);
      }
    }
    return response;
  }

  /** Read the memo back after migration so a successful HTTP status isn't mistaken for a persisted write. */
  async function fetchMemoContent(memoName, token) {
    const id = encodeURIComponent(String(memoName || '').replace(/^memos\//, ''));
    const paths = [`/api/memos/${id}`, `/api/v1/memos/${id}`];
    let response = await fetchJsonWithFallback(paths, token);
    if (response && response.status === 401) {
      const refreshedToken = await getMemosAuthToken(true);
      if (refreshedToken) response = await fetchJsonWithFallback(paths, refreshedToken);
    }
    if (!response || !response.ok) {
      throw new Error(`Could not verify migrated memo: HTTP ${response ? response.status : 'no response'}.`);
    }
    const memo = await response.json();
    return memo && typeof memo.content === 'string' ? memo.content : '';
  }

export {
  isLegacyFallbackStatus, fetchJsonWithFallback, fetchAllSpaces, getMemosAuthToken,
  sendJsonWithFallback, updateSpaceDescription, createSpace, listMemosForSpace,
  patchMemoContent, fetchMemoContent
};
