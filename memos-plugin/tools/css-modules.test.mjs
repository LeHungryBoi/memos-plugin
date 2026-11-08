import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectCss } from './css-manifest.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const stylesDir = path.join(projectRoot, 'src/styles');
const entry = path.join(stylesDir, 'index.css');
const { css, files } = collectCss(entry);

function listCssFiles(dir) {
    return readdirSync(dir, { withFileTypes: true }).flatMap(item => {
        const file = path.join(dir, item.name);
        if (item.isDirectory()) return listCssFiles(file);
        return item.name.endsWith('.css') ? [file] : [];
    });
}

// Every module on disk must be registered once; collectCss() already rejects
// missing files, duplicate imports and nested @imports.
const onDisk = listCssFiles(stylesDir).filter(file => file !== entry);
const orphans = onDisk.filter(file => !files.includes(file));
if (orphans.length > 0) {
    throw new Error(`CSS modules missing from src/styles/index.css: ${orphans.map(f => path.relative(stylesDir, f)).join(', ')}`);
}

const names = files.map(file => path.relative(stylesDir, file).replace(/\\/g, '/'));
if (names[1] !== 'base/tokens.css' || names[names.length - 1] !== 'utilities/overrides.css') {
    throw new Error('load order broken: tokens must come first, utilities/overrides.css last');
}

// A rule is identified by its full nesting path + normalized declarations.
// Two identical definitions are a copy/paste mistake; the same selector with
// different declarations is a legitimate late override (documented below).
function collectRules(text) {
    const rules = [];
    const stack = [];
    let buffer = '';
    for (const char of text.replace(/\/\*[\s\S]*?\*\//g, '')) {
        if (char === '{') {
            stack.push(buffer.trim().replace(/\s+/g, ' '));
            buffer = '';
        } else if (char === '}') {
            const declarations = buffer.trim().replace(/\s+/g, ' ');
            const selector = stack.pop();
            if (selector && !selector.startsWith('@') && declarations) {
                rules.push({ key: [...stack, selector].join(' > '), declarations });
            }
            buffer = '';
        } else {
            buffer += char;
        }
    }
    return rules;
}

const KNOWN_OVERRIDES = new Set(['.lc-space-info-dialog']); // 460px -> 860px, late override
const seen = new Set();
const selectorCounts = new Map();
for (const rule of collectRules(css)) {
    const definition = `${rule.key} { ${rule.declarations} }`;
    if (seen.has(definition)) {
        throw new Error(`duplicate CSS rule definition: ${definition.slice(0, 160)}`);
    }
    seen.add(definition);
    selectorCounts.set(rule.key, (selectorCounts.get(rule.key) || 0) + 1);
}
for (const [key, count] of selectorCounts) {
    if (count > 1 && !KNOWN_OVERRIDES.has(key)) {
        throw new Error(`selector declared ${count}x (${key}); consolidate it or add it to KNOWN_OVERRIDES with a reason`);
    }
}

// Published artifacts must match the manifest; catches "edited src/ but forgot to build".
const generatedCss = readFileSync(path.join(projectRoot, 'language-card.css'), 'utf8');
const bannerEnd = ' */\n';
const cssStart = generatedCss.indexOf(bannerEnd);
if (cssStart < 0 || generatedCss.slice(cssStart + bannerEnd.length) !== css) {
    throw new Error('language-card.css is stale: run npm run build');
}
const bundle = readFileSync(path.join(projectRoot, 'language-card.js'), 'utf8');
if (!bundle.includes(css)) {
    throw new Error('language-card.js has stale inlined CSS: run npm run build');
}

console.log(`CSS modules passed: ${names.length - 1} modules in cascade order, ${seen.size} unique rules, artifacts up to date.`);
