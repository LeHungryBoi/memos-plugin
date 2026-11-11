import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { deployGeneratedAssets, ensureEnvTemplate } from './deploy.mjs';

const tempRoot = mkdtempSync(path.join(os.tmpdir(), 'memos-plugin-deploy-test-'));

try {
    const projectRoot = path.join(tempRoot, 'memos-plugin');
    const assetDir = path.join(projectRoot, 'dist');
    const envPath = path.join(tempRoot, '.env');
    mkdirSync(assetDir, { recursive: true });

    const script = 'generated javascript';
    const style = 'generated css';
    writeFileSync(path.join(assetDir, 'language-card.js'), script);
    writeFileSync(path.join(assetDir, 'language-card.css'), style);
    writeFileSync(envPath, [
        'MEMOS_INSTANCE_URL=https://memos.example.test/',
        'MEMOS_ADMIN_TOKEN="test-secret-token"',
        ''
    ].join('\n'));

    const originalSetting = {
        name: 'instance/settings/GENERAL',
        generalSetting: {
            additionalScript: 'old script',
            additionalStyle: 'old style',
            disallowUserRegistration: true,
            disallowPasswordAuth: true,
            weekStartDayOffset: 1
        }
    };
    let persisted = structuredClone(originalSetting);
    const requests = [];
    const fetchImpl = async (url, options = {}) => {
        requests.push({ url, options });
        assert.equal(url, 'https://memos.example.test/api/v1/instance/settings/GENERAL');
        assert.equal(options.headers.Authorization, 'Bearer test-secret-token');
        if (options.method === 'PATCH') {
            const body = JSON.parse(options.body);
            assert.equal(body.name, originalSetting.name);
            assert.equal(body.generalSetting.additionalScript, script);
            assert.equal(body.generalSetting.additionalStyle, style);
            assert.equal(body.generalSetting.disallowUserRegistration, true);
            assert.equal(body.generalSetting.disallowPasswordAuth, true);
            assert.equal(body.generalSetting.weekStartDayOffset, 1);
            assert.equal(Object.hasOwn(body, 'updateMask'), false);
            persisted = body;
            return { ok: true, status: 200 };
        }
        return { ok: true, status: 200, json: async () => structuredClone(persisted) };
    };

    const result = await deployGeneratedAssets({ projectRoot, assetDir, envPath, fetchImpl });
    assert.deepEqual(result, { skipped: false });
    assert.deepEqual(requests.map(({ options }) => options.method || 'GET'), ['GET', 'PATCH', 'GET']);

    const templateRoot = path.join(tempRoot, 'template-check');
    mkdirSync(templateRoot);
    const generatedEnvPath = ensureEnvTemplate(templateRoot);
    const template = readFileSync(generatedEnvPath, 'utf8');
    assert.match(template, /MEMOS_INSTANCE_URL=/);
    assert.match(template, /MEMOS_ADMIN_TOKEN=/);
    writeFileSync(generatedEnvPath, 'keep existing config');
    ensureEnvTemplate(templateRoot);
    assert.equal(readFileSync(generatedEnvPath, 'utf8'), 'keep existing config');

    const emptyWorkspace = path.join(tempRoot, 'empty-workspace');
    mkdirSync(emptyWorkspace);
    const skipped = await deployGeneratedAssets({
        projectRoot,
        assetDir,
        envPath: path.join(emptyWorkspace, '.env'),
        fetchImpl: async () => { throw new Error('upload must be skipped without credentials'); }
    });
    assert.deepEqual(skipped, { skipped: true });
    assert.match(readFileSync(path.join(emptyWorkspace, '.env'), 'utf8'), /replace-with-admin-bearer-token/);

    console.log('Deployment checks passed (v1 GET/PATCH/verify, settings preservation, env template).');
} finally {
    rmSync(tempRoot, { recursive: true, force: true });
}
