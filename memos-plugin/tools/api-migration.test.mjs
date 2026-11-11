import { fetchMemoContent, patchMemoContent } from '../src/api.js';

const originalFetch = globalThis.fetch;
const requests = [];
let savedContent = '{"_t":"lc","v":2,"en":"before"}';
const response = (status, body = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body
});

globalThis.fetch = async (url, options = {}) => {
  requests.push({ url, options });
  if (url === '/api/memos/abc?updateMask=content' || url === '/api/memos/abc') {
    return response(404);
  }
  if (url === '/api/v1/memos/abc?updateMask=content' && options.method === 'PATCH') {
    savedContent = JSON.parse(options.body).content;
    return response(200, { name: 'memos/abc' });
  }
  if (url === '/api/v1/memos/abc') {
    return response(200, { name: 'memos/abc', content: savedContent });
  }
  return response(404);
};

try {
  const content = '{"_t":"lc","v":3,"_s":["en"],"en":"after"}';
  const patched = await patchMemoContent('memos/abc', content, 'test-token');
  if (!patched || !patched.ok) throw new Error('legacy API content PATCH did not succeed');
  const storedContent = await fetchMemoContent('memos/abc', 'test-token');
  if (storedContent !== content) throw new Error('read-back verification returned stale memo content');

  const patch = requests.find(request => request.options.method === 'PATCH');
  const body = JSON.parse(patch.options.body);
  if (body.content !== content || body.visibility !== 'PRIVATE') {
    throw new Error('migration PATCH must use the same content payload as editor updates');
  }
  console.log('Memo migration API checks passed (legacy fallback, patch payload, persisted read-back).');
} finally {
  globalThis.fetch = originalFetch;
}
