/**
 * gitleaks.js — runs gitleaks over the commits a branch adds and returns what it found, without values.
 *
 * Purpose: gitleaks (the version scripts/ci/pins.sh pins) with the repository's .gitleaks.toml, over
 *          `<base>..HEAD` without merges, the commits scripts/ci-secret-scan.js walks. --redact keeps every
 *          value out of the report, and inline `gitleaks:allow` comments are ignored, so a line cannot exempt
 *          itself: an exemption is a reviewed change to .gitleaks.toml.
 * Version: 0.1.0
 * Sprint:  16 (hardening), for scripts/ci-secret-scan.js
 *
 * The binary is $GITLEAKS_BIN or `gitleaks` on the PATH. `required` (CI) turns a missing or other-version
 * gitleaks into an error; otherwise a missing one returns null and the caller says it did not run.
 */

'use strict';

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// gitleaks exits 1 on an error too, so findings get an exit code of their own.
const LEAKS_EXIT = 3;

/** The version scripts/ci/pins.sh pins: CI installs exactly that one. */
function pinnedVersion(root) {
  const pins = fs.readFileSync(path.join(root, 'scripts/ci/pins.sh'), 'utf8');
  const match = pins.match(/^GITLEAKS_PIN_VERSION="([^"]+)"$/m);
  if (!match) throw new Error('scripts/ci/pins.sh pins no gitleaks version');
  return match[1];
}

/**
 * Findings ({ file, label }) gitleaks reports for `base..HEAD` in the repository at `cwd`, or null when gitleaks
 * is not installed and not `required`. `root` is where .gitleaks.toml and scripts/ci/pins.sh live.
 */
function runGitleaks(base, { required = false, cwd = process.cwd(), root = cwd } = {}) {
  const bin = process.env.GITLEAKS_BIN || 'gitleaks';
  const version = spawnSync(bin, ['version'], { encoding: 'utf8' });
  if (version.error && version.error.code === 'ENOENT') {
    if (!required) return null;
    throw new Error(`gitleaks is required but "${bin}" is not installed (bash scripts/ci/install-pinned.sh gitleaks)`);
  }
  if (version.error) throw version.error;
  const pinned = pinnedVersion(root);
  if (required && version.stdout.trim() !== pinned) {
    throw new Error(`gitleaks ${pinned} is required; "${bin}" reports ${version.stdout.trim()}`);
  }

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gitleaks-'));
  const report = path.join(dir, 'report.json');
  try {
    const args = ['git', '.', '--config', path.join(root, '.gitleaks.toml'), '--redact', '--no-banner', '--no-color'];
    args.push('--ignore-gitleaks-allow', '--log-level', 'error', '--log-opts', `--no-merges ${base}..HEAD`);
    args.push('--report-format', 'json', '--report-path', report, '--exit-code', String(LEAKS_EXIT));
    const run = spawnSync(bin, args, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    if (run.error) throw run.error;
    if (run.status !== 0 && run.status !== LEAKS_EXIT) {
      throw new Error(`gitleaks failed (exit ${run.status}): ${String(run.stderr).trim().slice(0, 2000)}`);
    }
    const leaks = JSON.parse(fs.readFileSync(report, 'utf8'));
    if (run.status === LEAKS_EXIT && leaks.length === 0) throw new Error('gitleaks reported leaks but wrote none');
    return leaks.map((leak) => ({
      file: leak.File,
      label: `gitleaks ${leak.RuleID} (line ${leak.StartLine}, commit ${String(leak.Commit).slice(0, 12)})`,
    }));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

module.exports = { runGitleaks, pinnedVersion, LEAKS_EXIT };
