import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deployGeneratedAssets, ensureEnvTemplate } from './deploy.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = path.dirname(projectRoot);
const envPath = ensureEnvTemplate(workspaceRoot);

const build = spawnSync(process.execPath, ['build.mjs'], {
    cwd: projectRoot,
    stdio: 'inherit',
    windowsHide: true
});

if (build.error) {
    console.error(`Final build could not start: ${build.error.message}`);
    process.exitCode = 1;
} else if (build.status !== 0) {
    console.error(`Final build failed with exit code ${build.status ?? 'unknown'}.`);
    process.exitCode = build.status || 1;
} else {
    try {
        await deployGeneratedAssets({
            projectRoot,
            assetDir: path.join(projectRoot, 'dist'),
            envPath,
            requireConfig: true
        });
        console.log('VERIFY_DEPLOY_OK: build completed; Additional Script and Additional Style were uploaded and read back successfully.');
    } catch (error) {
        console.error(`VERIFY_DEPLOY_FAILED: ${error.message}`);
        process.exitCode = 1;
    }
}
