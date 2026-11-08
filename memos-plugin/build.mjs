import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';
import { acquireWatchLock, releaseWatchLock } from './tools/watch-lock.mjs';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const cssSource = path.join(projectRoot, 'src/styles/language-card.css');
const outJs = path.join(projectRoot, 'language-card.js');
const outCss = path.join(projectRoot, 'language-card.css');

const isWatch = process.argv.includes('--watch');
// The default build inlines the CSS into the JS (one file to paste).
// --no-inline-css keeps the classic two-box install (Additional Script + Style).
const noInlineCss = process.argv.includes('--no-inline-css');

const jsBanner = `/* ============================================================================
 * Language Card Extension for Memos - GENERATED FILE, DO NOT EDIT HERE.
 * Sources: src/*.js and src/styles/language-card.css
 * Rebuild: npm run build (or npm run watch for automatic rebuilds)
 * Paste this whole file into Settings -> System -> Additional Script.
 * ============================================================================ */
"use strict";`;
const cssBanner = `/* Language Card Extension for Memos - GENERATED FILE.
 * Source: src/styles/language-card.css. Rebuild: npm run build.
 * Optional: the default language-card.js already inlines these styles.
 * Paste into Settings -> System -> Additional Style only when using
 * a --no-inline-css build (or the classic two-box install).
 */`;

const readCss = () => readFileSync(cssSource, 'utf8').replace(/\r\n/g, '\n');

function writeCssOutput() {
    writeFileSync(outCss, `${cssBanner}\n${readCss()}`, 'utf8');
}

const cssPlugin = {
    name: 'language-card-css',
    setup(build) {
        build.onResolve({ filter: /\.css$/ }, () => ({
            path: 'styles/language-card.css',
            namespace: 'lc-css'
        }));
        build.onLoad({ filter: /.*/, namespace: 'lc-css' }, () => ({
            contents: `export default ${JSON.stringify(noInlineCss ? '' : readCss())};`,
            loader: 'js',
            // The CSS is not a real JS import: tell esbuild to watch it anyway.
            watchFiles: [cssSource]
        }));
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
    console.log('Watching src/ for changes; output: language-card.js (single file).');
} else {
    await esbuild.build(options);
    console.log(`Built ${path.relative(projectRoot, outJs)} (single file, CSS ${noInlineCss ? 'kept separate' : 'inlined'})`);
    console.log(`Built ${path.relative(projectRoot, outCss)}`);
}
