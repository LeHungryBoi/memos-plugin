import {
  deleteMemo, fetchJsonWithFallback, fetchMemoContent, listMemosForSpace, patchMemoContent,
  sendJsonWithFallback
} from '../src/api.js';

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
  if (url === '/api/memos?parent=spaces%2Ftarget&pageSize=1000') {
    return response(404);
  }
  if (url === '/api/v1/memos?parent=spaces%2Ftarget&pageSize=1000') {
    return response(200, {
      memos: [
        { name: 'memos/in-target', space: 'spaces/target', content: '{"_t":"lc","v":2,"en":"one"}' },
        { name: 'memos/from-other-space', space: 'spaces/other', content: '{"_t":"lc","v":2,"en":"two"}' }
      ]
    });
  }
  if (url === '/api/v1/memos/abc?updateMask=content' && options.method === 'PATCH') {
    savedContent = JSON.parse(options.body).content;
    return response(200, { name: 'memos/abc' });
  }
  if (url === '/api/v1/memos/old' && options.method === 'DELETE') {
    return response(200, {});
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
  if (patch.url !== '/api/v1/memos/abc?updateMask=content'
    || body.content !== content || body.visibility !== 'PRIVATE') {
    throw new Error('migration PATCH must use the same content payload as editor updates');
  }
  const scopedMemos = await listMemosForSpace('spaces/target', 'test-token');
  if (scopedMemos.length !== 1 || scopedMemos[0].name !== 'memos/in-target') {
    throw new Error('space migration scans must exclude memos explicitly belonging to another space');
  }
  if (!requests.some(request => request.url === '/api/v1/memos?parent=spaces%2Ftarget&pageSize=1000')) {
    throw new Error('space-scoped memo listing must preserve the requested parent on the v1 API');
  }
  if (requests.some(request => request.url === '/api/memos?parent=spaces%2Ftarget&pageSize=1000')) {
    throw new Error('Memos 0.31 must use the v1 endpoint without probing an unsupported path');
  }
  const deleted = await deleteMemo('memos/old', 'test-token');
  if (!deleted || !deleted.ok) throw new Error('legacy API memo delete did not succeed');
  const deleteRequests = requests.filter(request => request.options.method === 'DELETE');
  if (deleteRequests.length !== 1
    || deleteRequests[0].url !== '/api/v1/memos/old'
    || Object.prototype.hasOwnProperty.call(deleteRequests[0].options, 'body')) {
    throw new Error('Memos 0.31 memo deletion must use v1 directly and send no body');
  }

  const fallbackRequests = [];
  globalThis.fetch = async url => {
    fallbackRequests.push(url);
    return response(url === '/api/v1/test' ? 410 : 200);
  };
  const modernApiResponse = await fetchJsonWithFallback(['/api/v1/test', '/api/test'], 'test-token');
  if (!modernApiResponse.ok
    || fallbackRequests.length !== 2
    || fallbackRequests[0] !== '/api/v1/test'
    || fallbackRequests[1] !== '/api/test') {
    throw new Error('newer Memos versions must remain available through the v1-first fallback');
  }
  fallbackRequests.length = 0;
  const modernWriteResponse = await sendJsonWithFallback(
    ['/api/v1/test', '/api/test'], 'PATCH', { value: 'test' }, 'test-token'
  );
  if (!modernWriteResponse.ok
    || fallbackRequests.length !== 2
    || fallbackRequests[0] !== '/api/v1/test'
    || fallbackRequests[1] !== '/api/test') {
    throw new Error('newer Memos writes must remain available through the v1-first fallback');
  }
  console.log('Memo API checks passed (v1 preference, newer API fallback, patch/read-back/delete).');
} finally {
  globalThis.fetch = originalFetch;
}
