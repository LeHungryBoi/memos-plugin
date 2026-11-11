import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ENV_TEMPLATE = [
    '# Memos 0.31.0 instance used by the automatic plugin uploader.',
    'MEMOS_INSTANCE_URL=https://your-memos.example.com',
    'MEMOS_ADMIN_TOKEN=replace-with-admin-bearer-token',
    ''
].join('\n');

export function ensureEnvTemplate(workspaceRoot) {
    const envPath = path.join(workspaceRoot, '.env');
    if (existsSync(envPath)) return envPath;
    try {
        writeFileSync(envPath, ENV_TEMPLATE, { encoding: 'utf8', flag: 'wx' });
    } catch (error) {
        if (error.code !== 'EEXIST') throw error;
    }
    return envPath;
}

function readEnvFile(envPath) {
    const source = readFileSync(envPath, 'utf8').replace(/^\uFEFF/, '');
    const values = {};
    for (const line of source.split(/\r?\n/)) {
        const match = line.match(/^\s*(MEMOS_INSTANCE_URL|MEMOS_ADMIN_TOKEN)\s*=\s*(.*?)\s*$/);
        if (!match) continue;
        const value = match[2];
        values[match[1]] = value.length >= 2 && (
            (value.startsWith('"') && value.endsWith('"'))
            || (value.startsWith("'") && value.endsWith("'"))
        ) ? value.slice(1, -1) : value;
    }
    return values;
}

function hasUsableCredentials({ MEMOS_INSTANCE_URL: instanceUrl, MEMOS_ADMIN_TOKEN: token }) {
    if (!instanceUrl || !token) return false;
    return !/your-memos|replace-with|<.*>/i.test(instanceUrl)
        && !/replace-with|your-token|<.*>/i.test(token);
}

function instanceBaseUrl(value) {
    let url;
    try {
        url = new URL(value);
    } catch {
        throw new Error('MEMOS_INSTANCE_URL must be a valid http(s) URL.');
    }
    if (!['http:', 'https:'].includes(url.protocol)
        || url.username || url.password || url.search || url.hash
        || (url.pathname !== '/' && url.pathname !== '')) {
        throw new Error('MEMOS_INSTANCE_URL must be the instance origin, without credentials, path, query, or fragment.');
    }
    return url.origin;
}

async function getGeneralSettings(fetchImpl, endpoint, token) {
    const response = await fetchImpl(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        redirect: 'error'
    });
    if (!response.ok) {
        throw new Error(`Could not read Memos GENERAL settings (HTTP ${response.status}).`);
    }
    let setting;
    try {
        setting = await response.json();
    } catch {
        throw new Error('Memos returned invalid JSON for GENERAL settings.');
    }
    if (!setting || !setting.generalSetting || typeof setting.generalSetting !== 'object'
        || Array.isArray(setting.generalSetting)) {
        throw new Error('Memos GENERAL settings response did not contain a generalSetting object.');
    }
    return setting;
}

export async function deployGeneratedAssets({
    projectRoot,
    assetDir = path.join(projectRoot, 'dist'),
    envPath = path.resolve(projectRoot, '..', '.env'),
    fetchImpl = globalThis.fetch,
    requireConfig = false
}) {
    ensureEnvTemplate(path.dirname(envPath));
    const credentials = readEnvFile(envPath);
    if (!hasUsableCredentials(credentials)) {
        if (requireConfig) {
            throw new Error(`Set MEMOS_INSTANCE_URL and MEMOS_ADMIN_TOKEN in ${envPath} before uploading.`);
        }
        return { skipped: true };
    }

    if (typeof fetchImpl !== 'function') throw new Error('This Node.js version does not provide fetch().');
    const instanceUrl = instanceBaseUrl(credentials.MEMOS_INSTANCE_URL);
    const token = credentials.MEMOS_ADMIN_TOKEN;
    const additionalScript = readFileSync(path.join(assetDir, 'language-card.js'), 'utf8');
    const additionalStyle = readFileSync(path.join(assetDir, 'language-card.css'), 'utf8');
    const endpoint = `${instanceUrl}/api/v1/instance/settings/GENERAL`;
    const existing = await getGeneralSettings(fetchImpl, endpoint, token);
    const updated = {
        ...existing,
        generalSetting: {
            ...existing.generalSetting,
            additionalScript,
            additionalStyle
        }
    };
    const patchResponse = await fetchImpl(endpoint, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updated),
        redirect: 'error'
    });
    if (!patchResponse.ok) {
        throw new Error(`Could not update Memos GENERAL settings (HTTP ${patchResponse.status}).`);
    }

    const persisted = await getGeneralSettings(fetchImpl, endpoint, token);
    if (persisted.generalSetting.additionalScript !== additionalScript
        || persisted.generalSetting.additionalStyle !== additionalStyle) {
        throw new Error('Memos accepted the settings update but did not persist both plugin assets.');
    }
    return { skipped: false };
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
    const projectRoot = path.resolve(path.dirname(currentFile), '..');
    const workspaceRoot = path.dirname(projectRoot);
    const envPath = ensureEnvTemplate(workspaceRoot);
    try {
        await deployGeneratedAssets({
            projectRoot,
            assetDir: path.join(projectRoot, 'dist'),
            envPath,
            requireConfig: true
        });
        console.log('Uploaded and verified Additional Script + Additional Style.');
    } catch (error) {
        console.error(`Deployment failed: ${error.message}`);
        process.exitCode = 1;
    }
}
