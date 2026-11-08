import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';
import { acquireWatchLock, releaseWatchLock } from './tools/watch-lock.mjs';
import { collectCss } from './tools/css-manifest.mjs';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const cssEntry = path.join(projectRoot, 'src/styles/index.css');
const isWatch = process.argv.includes('--watch');
const outputDir = isWatch ? path.join(projectRoot, '.watch') : projectRoot;
const outJs = path.join(outputDir, 'language-card.js');
const outCss = path.join(outputDir, 'language-card.css');
// The default build inlines the CSS into the JS (one file to paste).
// --no-inline-css keeps the classic two-box install (Additional Script + Style).
const noInlineCss = process.argv.includes('--no-inline-css');

mkdirSync(outputDir, { recursive: true });

const jsBanner = `/* ============================================================================
 * Language Card Extension for Memos - GENERATED FILE, DO NOT EDIT HERE.
 * Sources: src/*.js and the CSS modules listed in src/styles/index.css
 * Rebuild published files: npm run build; watcher output: .watch/language-card.js
 * Paste this whole file into Settings -> System -> Additional Script.
 * ============================================================================ */
"use strict";`;
const cssBanner = `/* Language Card Extension for Memos - GENERATED FILE.
 * Source: src/styles/index.css (module manifest). Rebuild: npm run build.
 * Optional: the default language-card.js already inlines these styles.
 * Paste into Settings -> System -> Additional Style only when using
 * a --no-inline-css build (or the classic two-box install).
 */`;

// index.css is a manifest: collectCss() concatenates its modules in cascade order.
function writeCssOutput() {
    writeFileSync(outCss, `${cssBanner}\n${collectCss(cssEntry).css}`, 'utf8');
}

const cssPlugin = {
    name: 'language-card-css',
    setup(build) {
        build.onResolve({ filter: /\.css$/ }, () => ({
            path: 'styles/index.css',
            namespace: 'lc-css'
        }));
        build.onLoad({ filter: /.*/, namespace: 'lc-css' }, () => {
            const { css, files } = collectCss(cssEntry);
            return {
                contents: `export default ${JSON.stringify(noInlineCss ? '' : css)};`,
                loader: 'js',
                // The CSS is not a real JS import: watch the manifest and every module.
                watchFiles: files
            };
        });
        build.onEnd(result => {
            if (result.errors.length === 0) writeCssOutput();
        });
    }
};

const options = {
    absWorkingDir: projectRoot,
    entryPoints: ['src/main.js'],
    bundle: true,
    format: 'iife',
    // The legacy script already used optional chaining and template literals;
    // es2020 keeps the bundle close to the source instead of downleveling it.
    target: ['es2020'],
    outfile: outJs,
    banner: { js: jsBanner },
    legalComments: 'none',
    charset: 'utf8',
    minify: false,
    sourcemap: false,
    plugins: [cssPlugin]
};

if (isWatch) {
    // VS Code starts this task on folderOpen; only one watcher may own the output.
    const lock = acquireWatchLock({ name: 'memos-plugin watcher' });
    if (!lock.ok) {
        const since = lock.holder.startedAt
            ? new Date(lock.holder.startedAt).toLocaleTimeString()
            : 'an earlier start';
        console.log(`Watcher already running (pid ${lock.holder.pid}, since ${since}); this instance exits.`);
        process.exit(0);
    }
    // Final net: even on a hard exit the lock must not block the next run.
    process.once('exit', () => releaseWatchLock());

    const logPlugin = {
        name: 'language-card-watch-log',
        setup(build) {
            build.onEnd(result => {
                if (result.errors.length > 0) {
                    console.error('Build failed; the previous language-card.js is still in place.');
                    return;
                }
                console.log(`[${new Date().toLocaleTimeString()}] Built language-card.js + language-card.css`);
            });
        }
    };

    const context = await esbuild.context({
        ...options,
        plugins: [...options.plugins, logPlugin]
    });
    const shutdown = async () => {
        await context.dispose();
        console.log('Stopped Memos language-card watcher.');
    };
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
    await context.watch();
    console.log('Watching src/ for changes; output: .watch/language-card.js (single file).');
} else {
    await esbuild.build(options);
    console.log(`Built ${path.relative(projectRoot, outJs)} (single file, CSS ${noInlineCss ? 'kept separate' : 'inlined'})`);
    console.log(`Built ${path.relative(projectRoot, outCss)}`);
}
