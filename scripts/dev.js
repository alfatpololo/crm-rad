#!/usr/bin/env node
/**
 * Self-healing dev runner for Next.js.
 *
 * Problem: after an unclean shutdown, Next dev can get stuck at "Starting…" due to bad cache.
 *
 * Important: do NOT delete the whole `.next` folder on every dirty boot — that forces a
 * full cold rebuild and feels "forever" slow after closing the laptop.
 *
 * Default heal: only drop `.next/cache` + `.next/trace` (fast; fixes most stuck states).
 * Full heal: set NEXT_DEV_FULL_HEAL=1 once, or use `npm run dev:clean`.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const projectRoot = process.cwd();
const nextDir = path.join(projectRoot, '.next');
const dirtyMarker = path.join(projectRoot, '.next-dev-dirty');

function rmrf(targetPath) {
  try {
    fs.rmSync(targetPath, { recursive: true, force: true });
  } catch (_) {
    // best-effort
  }
}

function healNextState() {
  const fullHeal =
    process.env.NEXT_DEV_FULL_HEAL === '1' ||
    process.env.NEXT_DEV_FULL_HEAL === 'true';

  if (fullHeal) {
    rmrf(nextDir);
    return;
  }

  // Light heal: webpack/swc cache + trace (enough for many "stuck starting" cases)
  rmrf(path.join(nextDir, 'cache'));
  rmrf(path.join(nextDir, 'trace'));
  // Chunk server kadang stale (mis. Cannot find module './vendor-chunks/@opentelemetry.js' / 'next.js')
  rmrf(path.join(nextDir, 'server'));
  // Chunk klien di .next/static harus selaras dengan server; bila hanya server di-drop, HMR bisa 404 main-app.js
  rmrf(path.join(nextDir, 'static'));
}

function writeMarker() {
  try {
    fs.writeFileSync(
      dirtyMarker,
      `pid=${process.pid}\nstartedAt=${new Date().toISOString()}\n`
    );
  } catch (_) {
    // best-effort
  }
}

function clearMarker() {
  try {
    fs.rmSync(dirtyMarker, { force: true });
  } catch (_) {
    // best-effort
  }
}

if (fs.existsSync(dirtyMarker)) {
  healNextState();
}

writeMarker();

const binExt = process.platform === 'win32' ? '.cmd' : '';
const nextBin = path.join(projectRoot, 'node_modules', '.bin', `next${binExt}`);

const args = process.argv.slice(2);
const child = spawn(nextBin, args, {
  stdio: 'inherit',
  env: {
    ...process.env,
    NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED ?? '1',
  },
});

const cleanupAndExit = (code) => {
  clearMarker();
  process.exit(typeof code === 'number' ? code : 0);
};

process.on('SIGINT', () => {
  if (child?.pid) child.kill('SIGINT');
});
process.on('SIGTERM', () => {
  if (child?.pid) child.kill('SIGTERM');
});

child.on('exit', (code, signal) => {
  if (signal) return cleanupAndExit(1);
  return cleanupAndExit(code);
});
