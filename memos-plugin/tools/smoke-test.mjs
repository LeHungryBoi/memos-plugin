/**
 * Build smoke test: runs the generated single-file plugin in a minimal mock
 * DOM and exercises the main interaction paths. With --baseline <legacy.js>
 * it also compares DOM output, fetch traffic and storage writes against the
 * pre-refactor monolith.
 *
 *   npm test
 *   node tools/smoke-test.mjs --baseline path/to/legacy-language-card.js
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bundlePath = path.join(root, 'dist', 'language-card.js');
const baselineFlag = process.argv.indexOf('--baseline');
const baselinePath = baselineFlag === -1 ? null : path.resolve(root, process.argv[baselineFlag + 1]);

function makeEnvironment() {
    const ids = new Map();
    const htmlById = new Map();
    const created = [];
    const fetchCalls = [];
    const spaces = [
        { name: 'spaces/lc', title: 'Language Cards', description: '{"_t":"lc","v":2}' },
        {
            name: 'spaces/other',
            title: 'Other',
            description: '{"_t":"lc","v":3,"typeId":"other","name":"Other","order":10,"sections":[{"key":"en","label":"English","color":"#38bdf8"}]}'
        }
    ];
    const storageWrites = {};
    const storage = new Map([
        ['memos_access_token', 'test-token']
    ]);
    const listeners = new Map();

    const classList = () => {
        const set = new Set();
        return {
            add: (...c) => c.forEach(x => set.add(x)),
            remove: (...c) => c.forEach(x => set.delete(x)),
            contains: c => set.has(c),
            toggle: (c, force) => {
                const on = force === undefined ? !set.has(c) : Boolean(force);
                if (on) set.add(c); else set.delete(c);
                return on;
            }
        };
    };

    class El {
        constructor(tag = 'div') {
            this.tagName = tag.toUpperCase();
            this.nodeName = this.tagName;
            this.id = '';
            this.className = '';
            this.classList = classList();
            this.attributes = new Map();
            this.children = [];
            this.listeners = new Map();
            this.style = { setProperty(k, v) { this[k] = v; } };
            this._innerHTML = '';
            this.innerText = '';
            this.textContent = '';
            this.value = '';
            this.selectionStart = 0;
            this.selectionEnd = 0;
            this.offsetLeft = 0;
            this.offsetTop = 0;
            this.offsetWidth = 240;
            this.offsetHeight = 200;
            this.isConnected = true;
        }
        set innerHTML(value) {
            this._innerHTML = String(value);
            if (this.id) htmlById.set(this.id, this._innerHTML);
            for (const m of this._innerHTML.matchAll(/id="([^"]+)"/g)) {
                if (!ids.has(m[1])) {
                    const child = new El();
                    child.id = m[1];
                    ids.set(m[1], child);
                    created.push(m[1]);
                }
            }
        }
        get innerHTML() { return this._innerHTML; }
        setAttribute(k, v) { this.attributes.set(k, String(v)); }
        getAttribute(k) { return this.attributes.has(k) ? this.attributes.get(k) : null; }
        removeAttribute(k) { this.attributes.delete(k); }
        hasAttribute(k) { return this.attributes.has(k); }
        appendChild(child) {
            this.children.push(child);
            if (child.id && !ids.has(child.id)) ids.set(child.id, child);
            return child;
        }
        removeChild(child) { this.children = this.children.filter(c => c !== child); return child; }
        insertBefore(child) { return this.appendChild(child); }
        querySelector() { return null; }
        querySelectorAll() { return []; }
        closest() { return null; }
        contains() { return false; }
        getBoundingClientRect() { return { left: 100, top: 100, right: 300, bottom: 140, width: 200, height: 40 }; }
        scrollIntoView() {}
        focus() { document.activeElement = this; }
        select() {}
        click() {}
        addEventListener(type, fn) {
            if (!this.listeners.has(type)) this.listeners.set(type, []);
            this.listeners.get(type).push(fn);
        }
        removeEventListener(type, fn) {
            const list = this.listeners.get(type) || [];
            this.listeners.set(type, list.filter(f => f !== fn));
        }
        dispatchEvent(event) {
            for (const fn of this.listeners.get(event.type) || []) fn(event);
            return true;
        }
    }

    class StyledEvent {
        constructor(type, init = {}) {
            this.type = type;
            Object.assign(this, init);
        }
        preventDefault() { this.defaultPrevented = true; }
        stopPropagation() { this.propagationStopped = true; }
    }

    const document = new El('body');
    document.readyState = 'complete';
    document.body = document;
    document.head = new El('head');
    document.documentElement = new El('html');
    document.activeElement = null;
    document.createElement = tag => new El(tag);
    document.createDocumentFragment = () => new El('#fragment');
    document.getElementById = id => ids.get(id) || null;
    document.execCommand = () => true;
    document.querySelector = () => null;
    document.querySelectorAll = () => [];
    document.addEventListener = (type, fn) => {
        if (!listeners.has(type)) listeners.set(type, []);
        listeners.get(type).push(fn);
    };

    const response = (status, body = {}) => ({
        ok: status >= 200 && status < 300,
        status,
        statusText: status === 404 ? 'Not Found' : 'OK',
        url: 'http://localhost/',
        json: async () => body,
        text: async () => JSON.stringify(body)
    });

    const fetch = async (url, options = {}) => {
        const method = options.method || 'GET';
        fetchCalls.push(`${method} ${url}`);
        if (method === 'POST' && url === '/api/spaces') {
            return response(404, { message: 'legacy API' });
        }
        if (method === 'POST' && url === '/api/v1/spaces') {
            const body = JSON.parse(options.body);
            const space = {
                name: 'spaces/new-vocabulary',
                title: body.title,
                description: body.description
            };
            spaces.push(space);
            return response(200, space);
        }
        if (url.startsWith('/api/spaces')) {
            return response(200, { spaces, nextPageToken: '' });
        }
        if (url.includes('/ListUserStats') || url.includes('/ListAllUserStats')) {
            return response(200, { userStats: [{ tagCounts: { vocab: 5, daily: 2 } }] });
        }
        if (url.startsWith('/api/memos')) return response(200, { name: 'memos/abc' });
        return response(404, { message: 'not found' });
    };

    const sandbox = {
        document,
        window: {
            document,
            getComputedStyle: () => ({ backgroundColor: 'rgb(255, 255, 255)' }),
            matchMedia: () => ({ matches: false }),
            addEventListener() {},
            innerWidth: 1280,
            innerHeight: 800,
            location: { pathname: '/s/other', href: 'http://localhost/s/other' }
        },
        navigator: { clipboard: { writeText: async () => {} } },
        localStorage: {
            getItem: k => (storage.has(k) ? storage.get(k) : null),
            setItem: (k, v) => { storage.set(k, String(v)); storageWrites[k] = String(v); },
            removeItem: k => { storage.delete(k); delete storageWrites[k]; }
        },
        fetch,
        Event: StyledEvent,
        MouseEvent: StyledEvent,
        MutationObserver: class {
            constructor(callback) { this.callback = callback; }
            observe() {}
            disconnect() {}
        },
        setTimeout: (fn, ms) => globalThis.setTimeout(fn, Math.min(ms || 0, 10)),
        clearTimeout: id => globalThis.clearTimeout(id),
        console: {
            log() {}, warn() {}, error(message) { throw new Error(`console.error in plugin: ${message}`); }
        }
    };
    sandbox.globalThis = sandbox;
    sandbox.self = sandbox;

    const click = id => {
        const el = ids.get(id);
        if (!el || typeof el.onclick !== 'function') throw new Error(`missing onclick for #${id}`);
        return el.onclick(new StyledEvent('click'));
    };
    const fire = (id, type, event = {}) => {
        const el = ids.get(id);
        if (!el) throw new Error(`missing element #${id}`);
        const styledEvent = new StyledEvent(type, event);
        el.dispatchEvent(styledEvent);
        return styledEvent;
    };
    const fireDocument = (type, event = {}) => {
        const styledEvent = new StyledEvent(type, event);
        for (const fn of listeners.get(type) || []) fn(styledEvent);
        return styledEvent;
    };

    return { sandbox, click, fire, fireDocument, ids, htmlById, created, fetchCalls, spaces, storageWrites };
}

const tick = ms => new Promise(resolve => setTimeout(resolve, ms));

function summarize(env) {
    const capturedIds = ['lc-floating-bar', 'lc-modal-overlay', 'lc-space-info-overlay', 'lc-space-info-body', 'lc-tag-dropdown'];
    return {
        ids: env.created.filter(id => id !== 'lc-injected-style').sort(),
        html: capturedIds.map(id => [id, env.htmlById.get(id) || null]),
        fetchCalls: [...env.fetchCalls].sort(),
        storageWrites: env.storageWrites
    };
}

async function runScript(file, label) {
    const env = makeEnvironment();
    const code = readFileSync(file, 'utf8');
    vm.runInNewContext(code, env.sandbox, { filename: label, timeout: 3000 });

    if (!env.ids.has('lc-floating-bar')) throw new Error('floating bar was not injected');
    if (!env.ids.has('lc-modal-overlay')) throw new Error('editor modal was not injected');
    if (!env.ids.has('lc-space-info-overlay')) throw new Error('space info popup was not injected');

    await tick(30); // space indicator / tag stats requests
    await env.click('lc-fab-btn'); // open editor
    await tick(20);
    if (env.ids.has('lc-toggle-btn-ja')) throw new Error('R5.1: homepage language pills must be gone');
    if (env.ids.has('lc-explanation-toggle')) throw new Error('the global explanation toggle must be removed');
    if (!env.ids.has('lc-btn-migrate') || env.ids.get('lc-btn-migrate').style.display !== 'none') {
        throw new Error('the editor migration button must be hidden unless editing a saved V2 card');
    }
    if (!env.ids.has('lc-explanation-section-toggle-en')) {
        throw new Error('each language explanation must have its own switch');
    }
    const explanationMarkup = env.htmlById.get('lc-explanation-area') || '';
    if (explanationMarkup.indexOf('lc-explanation-section-toggles') >
        explanationMarkup.indexOf('lc-explanation-inputs') ||
        explanationMarkup.indexOf('lc-explanation-section-toggle-en') >
        explanationMarkup.indexOf('lc-explain-en')) {
        throw new Error('all explanation switches must be in a separate row above their text boxes');
    }
    const jaExplanationToggle = env.ids.get('lc-explanation-section-toggle-ja');
    const jaExplanationSlot = env.ids.get('lc-explanation-slot-ja');
    if (jaExplanationToggle &&
        (!jaExplanationToggle.classList.contains('active') ||
            !jaExplanationToggle.classList.contains('language-hidden') ||
            jaExplanationSlot.style.display !== 'none')) {
        throw new Error('default-hidden language sections must also start with hidden explanation text');
    }
    if (!env.ids.has('lc-space-select-btn') || !env.ids.has('lc-space-indicator')) {
        throw new Error('space selection and space management must have separate controls');
    }
    if (!/^#1\b/.test(env.ids.get('lc-modal-title-text').innerText)) {
        throw new Error('the first new card must show counter 1 in the title');
    }
    if (!env.ids.has('lc-space-select')) {
        throw new Error('the quick Space dropdown wrapper must be available to its dismissal handler');
    }
    if (env.ids.get('lc-space-select-text').innerText !== 'Language Cards') {
        throw new Error('the first ordered type must be the default even when the page is in another space');
    }
    if (env.sandbox.document.body.style.position !== 'fixed' ||
        env.sandbox.document.documentElement.style.overflow !== 'hidden') {
        throw new Error('opening the editor must lock page scrolling');
    }
    const backgroundTouch = env.fireDocument('touchmove', {
        target: { closest: () => null }
    });
    if (!backgroundTouch.defaultPrevented) {
        throw new Error('touch scrolling outside the editor must be prevented');
    }
    const editorTouch = env.fireDocument('touchmove', {
        target: { closest: selector => selector === '.lc-modal-dialog' ? {} : null }
    });
    if (editorTouch.defaultPrevented) {
        throw new Error('touch scrolling inside the editor must remain available');
    }

    const enExplanation = env.ids.get('lc-explain-en');
    const enExplanationSlot = env.ids.get('lc-explanation-slot-en');
    const enExplanationToggle = env.ids.get('lc-explanation-section-toggle-en');
    await env.click('lc-explanation-section-toggle-en');
    if (enExplanationSlot.style.display !== 'none' ||
        enExplanationToggle.classList.contains('active') ||
        env.ids.get('lc-explanation-inputs').style['--lc-explanation-cols'] !== 1) {
        throw new Error('turning off a per-language explanation must hide only its text input');
    }
    await env.click('lc-modal-toggle-en');
    if (enExplanationSlot.style.display !== 'none' ||
        !enExplanationToggle.classList.contains('language-hidden') ||
        enExplanationToggle.getAttribute('aria-pressed') !== 'false') {
        throw new Error('language visibility must hide explanation text without changing its switch');
    }
    await env.click('lc-modal-toggle-en');
    if (enExplanationSlot.style.display !== 'none' ||
        enExplanationToggle.classList.contains('language-hidden')) {
        throw new Error('re-enabling a language must respect its independently disabled explanation');
    }
    await env.click('lc-explanation-section-toggle-en');
    await env.click('lc-modal-toggle-en');
    if (enExplanationSlot.style.display !== 'none' ||
        !enExplanationToggle.classList.contains('active') ||
        !enExplanationToggle.classList.contains('language-hidden') ||
        enExplanationToggle.getAttribute('aria-pressed') !== 'true') {
        throw new Error('an enabled explanation switch must remain on while its language is hidden');
    }
    await env.click('lc-modal-toggle-en');
    if (enExplanationSlot.style.display === 'none') {
        throw new Error('re-enabling the language must show its independently enabled explanation');
    }
    await env.click('lc-explanation-section-toggle-en');
    if (enExplanationSlot.style.display !== 'none' ||
        !(env.ids.get('lc-json-preview').innerText || '').includes('"_eh":["en"]')) {
        throw new Error('per-language explanation visibility must be hidden and included in the payload');
    }
    await env.click('lc-explanation-section-toggle-en');

    env.ids.get('lc-space-select-panel').hidden = true;
    env.fire('lc-modal-overlay', 'touchstart', {
        target: { closest: selector => selector === '.lc-modal-header' ? {} : null },
        touches: [{ clientX: 200, clientY: 100 }]
    });
    const editorSwipeMove = env.fire('lc-modal-overlay', 'touchmove', {
        target: { closest: selector => selector === '.lc-modal-header' ? {} : null },
        touches: [{ clientX: 140, clientY: 102 }]
    });
    env.fire('lc-modal-overlay', 'touchend', {
        changedTouches: [{ clientX: 140, clientY: 102 }]
    });
    if (!editorSwipeMove.defaultPrevented ||
        JSON.parse(env.storageWrites.memos_lc_target_space_v2 || '{}').name !== 'spaces/other' ||
        !env.ids.get('lc-space-select-panel').hidden ||
        !env.ids.get('lc-modal-header').classList.contains('lc-space-swipe-next') ||
        !/^#11\b/.test(env.ids.get('lc-modal-title-text').innerText)) {
        throw new Error('swiping the editor must switch spaces and show the selected Space order plus one');
    }
    const typeBeforeBodySwipe = JSON.parse(env.storageWrites.memos_lc_target_space_v2 || '{}').name;
    env.fire('lc-modal-overlay', 'touchstart', {
        target: { closest: selector => selector === '.lc-modal-body' ? {} : null },
        touches: [{ clientX: 200, clientY: 100 }]
    });
    const bodySwipeMove = env.fire('lc-modal-overlay', 'touchmove', {
        target: { closest: selector => selector === '.lc-modal-body' ? {} : null },
        touches: [{ clientX: 140, clientY: 102 }]
    });
    env.fire('lc-modal-overlay', 'touchend', {
        changedTouches: [{ clientX: 140, clientY: 102 }]
    });
    if (bodySwipeMove.defaultPrevented ||
        JSON.parse(env.storageWrites.memos_lc_target_space_v2 || '{}').name !== typeBeforeBodySwipe) {
        throw new Error('swipes in the editor body must not switch spaces');
    }

    env.ids.get('lc-space-select-panel').hidden = true;
    await env.click('lc-space-select-btn');
    if (env.ids.get('lc-space-select-panel').hidden) throw new Error('quick Space dropdown did not open');
    env.fireDocument('pointerdown', { target: { outside: true } });
    if (!env.ids.get('lc-space-select-panel').hidden || env.ids.get('lc-space-select-btn').getAttribute('aria-expanded') !== 'false') {
        throw new Error('clicking outside the Space dropdown must dismiss it');
    }

    const tagsInput = env.ids.get('lc-input-tags');
    tagsInput.value = '#vo';
    tagsInput.selectionStart = 3;
    tagsInput.selectionEnd = 3;
    env.fire('lc-input-tags', 'input');
    env.fire('lc-input-tags', 'keydown', { key: 'Enter' });
    await tick(20);

    env.ids.get('lc-input-en').value = 'hello';
    await env.click('lc-btn-save'); // POST /api/memos
    await tick(20);
    if (env.sandbox.document.body.style.position !== undefined ||
        env.sandbox.document.documentElement.style.overflow !== undefined) {
        throw new Error('closing the editor must restore page scrolling');
    }
    await env.click('lc-fab-btn');
    await tick(20);
    if (env.ids.get('lc-space-select-text').innerText !== 'Language Cards' ||
        JSON.parse(env.storageWrites.memos_lc_target_space_v2 || '{}').name !== 'spaces/lc') {
        throw new Error('each new card editor must default to the first ordered Space');
    }
    if (!/^#1\b/.test(env.ids.get('lc-modal-title-text').innerText)) {
        throw new Error('reopening the first ordered Space must keep its order-based title number');
    }
    await env.click('lc-btn-cancel');

    if (env.ids.has('lc-header-json')) throw new Error('editor must not show a second marker preview');
    const previewText = env.ids.get('lc-json-preview').innerText || '';
    if (!previewText.includes('"_t":"lc"')) throw new Error('the only preview must show the note content');
    await env.click('lc-space-indicator'); // R4: opens card type manager
    await tick(30);
    if (!env.ids.has('lc-migration-open-btn')) throw new Error('R4: migration wizard entry is missing');
    const managerHtml = env.htmlById.get('lc-space-info-body') || '';
    if (!managerHtml.includes('lc-create-space-btn')) throw new Error('space manager must provide a create-space action');
    env.ids.get('lc-new-space-title').value = 'New Vocabulary';
    const createButton = {
        id: 'lc-create-space-btn',
        getAttribute: name => name === 'data-action' ? 'create-space' : null
    };
    await env.ids.get('lc-space-info-body').onclick({
        target: { closest: () => createButton }
    });
    if (!env.fetchCalls.includes('POST /api/spaces') || !env.fetchCalls.includes('POST /api/v1/spaces')) {
        throw new Error('creating a space must fall back from the current API path to v1');
    }
    const createdSpace = env.spaces.find(space => space.name === 'spaces/new-vocabulary');
    if (!createdSpace || !createdSpace.description.includes('"v":3') || !createdSpace.description.includes('"sections"')) {
        throw new Error('new spaces must be created with a Language Card type marker and section definitions');
    }
    const selectedSpace = JSON.parse(env.storageWrites.memos_lc_target_space_v2 || '{}');
    if (selectedSpace.name !== createdSpace.name || selectedSpace.manual !== true) {
        throw new Error('the newly created space must persist as the selected target for new cards');
    }
    const createdTypeId = JSON.parse(createdSpace.description).typeId;
    await env.ids.get('lc-space-info-body').onclick({
        target: {
            closest: () => ({
                id: '',
                getAttribute: name => name === 'data-action' ? 'type-edit' : (name === 'data-type-id' ? createdTypeId : null)
            })
        }
    });
    if ((env.htmlById.get('lc-type-list') || '').includes('lc-type-order')) {
        throw new Error('type order must be controlled by the reorder buttons, not a manual field');
    }

    return summarize(env);
}

const bundle = await runScript(bundlePath, 'language-card.js');
console.log(`Bundle smoke test passed: ${bundle.ids.length} DOM ids, ${bundle.fetchCalls.length} requests.`);

const inlineStyle = readFileSync(bundlePath, 'utf8');
if (!inlineStyle.includes('lc-injected-style') || !inlineStyle.includes('--lc-bg-card')) {
    throw new Error('the single-file build must inline the stylesheet');
}
if (!inlineStyle.includes('Copy Content')) {
    throw new Error('R1: Copy Content quick action is missing');
}
if (!inlineStyle.includes('Migrate this V2 card to V3') ||
    !inlineStyle.includes('lc-btn-migrate') ||
    !inlineStyle.includes('openV2MigrationPreview') ||
    !inlineStyle.includes('lc-migration-preview-v2') ||
    !inlineStyle.includes('lc-migration-preview-v3') ||
    !inlineStyle.includes('lc-migration-raw-v2') ||
    !inlineStyle.includes('lc-migration-raw-v3') ||
    !inlineStyle.includes('lc-btn lc-btn-primary') ||
    !inlineStyle.includes('lc-v2-migration-header')) {
    throw new Error('V2 cards must offer a side-by-side V3 migration preview');
}
if (inlineStyle.includes('lc-explanation-toggle')) {
    throw new Error('global explanation toggle markup must not be in the bundle');
}
if (/\b(?:import|export)\s+(?:\{|\*|default|\w+\s+from)/.test(inlineStyle.replace(/^.*\*\//gm, ''))) {
    throw new Error('the bundle still contains ES module statements');
}

if (baselinePath) {
    const legacy = await runScript(baselinePath, 'legacy language-card.js');
    const a = JSON.stringify(legacy);
    const b = JSON.stringify(bundle);
    if (a !== b) {
        console.error('Legacy vs bundle difference:');
        console.error('legacy:', a.slice(0, 2000));
        console.error('bundle:', b.slice(0, 2000));
        throw new Error('refactor changed runtime behaviour');
    }
    console.log('Legacy monolith and generated bundle produce identical DOM, requests and storage writes.');
}
