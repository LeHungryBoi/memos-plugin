import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Resolves src/styles/index.css into one stylesheet.
 *
 * The manifest is intentionally flat: every @import names one module and the
 * order of the lines is the cascade order. Modules are concatenated verbatim
 * (no injected separators), so the published CSS stays byte-for-byte equal to
 * the old single-file source. Browsers cannot resolve these relative imports
 * from Memos' Additional Style / an injected <style>, hence the build step.
 */
const IMPORT_RE = /^\s*@import\s+["']([^"']+\.css)["']\s*;\s*$/;
const withoutComments = text => text.replace(/\/\*[\s\S]*?\*\//g, '');
const normalize = text => text.replace(/\r\n/g, '\n');

export function collectCss(entryPath) {
    const baseDir = path.dirname(entryPath);
    const entry = normalize(readFileSync(entryPath, 'utf8'));
    const files = [entryPath];
    const chunks = [];
    const seen = new Set([entryPath]);

    withoutComments(entry).split('\n').forEach((line, index) => {
        if (!line.trim()) return;
        const match = IMPORT_RE.exec(line);
        if (!match) {
            throw new Error(`${path.basename(entryPath)}:${index + 1}: expected an @import line, got: ${line.trim()}`);
        }
        const specifier = match[1];
        const file = path.resolve(baseDir, specifier);
        if (!file.startsWith(`${baseDir}${path.sep}`)) {
            throw new Error(`CSS module must stay inside ${baseDir}: ${specifier}`);
        }
        if (seen.has(file)) {
            throw new Error(`CSS module imported twice (would duplicate rules): ${specifier}`);
        }
        seen.add(file);

        let css;
        try {
            css = normalize(readFileSync(file, 'utf8'));
        } catch (error) {
            throw new Error(`CSS module not found: ${specifier} (${error.message})`);
        }
        if (/@import\b/i.test(withoutComments(css))) {
            throw new Error(`nested @import in ${specifier}: keep index.css the only manifest`);
        }
        if (!css.endsWith('\n')) {
            throw new Error(`CSS module must end with a newline: ${specifier}`);
        }
        files.push(file);
        chunks.push(css);
    });

    if (chunks.length === 0) {
        throw new Error(`no CSS modules listed in ${entryPath}`);
    }
    return { css: chunks.join(''), files };
}
