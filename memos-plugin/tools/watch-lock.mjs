import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const lockPath = path.join(os.tmpdir(), 'memos-language-card-watch.lock');

function readLock() {
    try {
        const parsed = JSON.parse(readFileSync(lockPath, 'utf8'));
        return parsed && Number.isInteger(parsed.pid) ? parsed : null;
    } catch {
        return null;
    }
}

function isPidAlive(pid) {
    if (!Number.isInteger(pid) || pid <= 0) return false;
    try {
        process.kill(pid, 0);
        return true;
    } catch (error) {
        // EPERM means the process exists but belongs to another session/user.
        return error.code === 'EPERM';
    }
}

/** Claim the single watcher slot. Returns { ok: false, holder } when taken. */
export function acquireWatchLock({ name = 'memos-plugin watcher' } = {}) {
    const existing = readLock();
    if (existing && existing.pid !== process.pid && isPidAlive(existing.pid)) {
        return { ok: false, holder: existing };
    }

    try {
        rmSync(lockPath, { force: true });
        writeFileSync(lockPath, JSON.stringify({
            pid: process.pid,
            name,
            startedAt: new Date().toISOString()
        }));
    } catch {
        // Unwritable temp dir should not stop the watcher; run without a lock.
        return { ok: true, lockPath: null };
    }

    // Guard against two processes claiming the slot in the same instant.
    const winner = readLock();
    if (winner && winner.pid !== process.pid && isPidAlive(winner.pid)) {
        return { ok: false, holder: winner };
    }
    return { ok: true, lockPath };
}

/** Release the slot, but only if this process still owns it. */
export function releaseWatchLock() {
    try {
        const existing = readLock();
        if (existing && existing.pid === process.pid) {
            rmSync(lockPath, { force: true });
        }
    } catch {
        // Nothing to clean up.
    }
}
