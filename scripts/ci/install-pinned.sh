#!/usr/bin/env bash
# Purpose: install one tool CI downloads, pinned by version and SHA-256 (scripts/ci/pins.sh): the download lands
#          in a new empty folder, its hash is checked before anything reads it, the binary's own hash and version
#          are checked after extraction, and only then does it go on the job's PATH. Nothing is piped into a
#          shell. A tool restored from a cache is checked the same way, without a download.
# Version: 0.1.0
# Sprint:  16 (hardening), carried from Sprint 00's review (TP section 7.1)
#
# Usage: bash scripts/ci/install-pinned.sh <solana|shank|bun|node|gitleaks|solana-verify>
#   solana  the Solana CLI and the platform-tools cargo-build-sbf uses, where the official installer puts them
#   shank   shank-cli, `cargo install --locked` once the crate's checksum in the index matches the pin
#   bun     the version package.json names, checked against deploy/vps/bun-<version>.sha256
# shellcheck source-path=SCRIPTDIR
set -euo pipefail
# Without this a command substitution ignores `set -e`: a failed hash check inside `$(fetch ...)` would let the
# function go on and print the path, and the caller would extract an archive that did not match its pin.
shopt -s inherit_errexit

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(cd "$here/../.." && pwd)"
# shellcheck source=pins.sh
source "$here/pins.sh"
work="${RUNNER_TEMP:-${TMPDIR:-/tmp}}"
tools="$work/pinned-tools"

die() {
  printf '::error::%s\n' "$*" >&2
  exit 1
}

# <url> <sha256> <file name>: downloads into a new empty folder, checks the hash, prints the file's path. Each
# command returns on failure by itself as well, so the check holds even where errexit is off.
fetch() {
  local dir
  dir="$(mktemp -d "$work/pinned-download.XXXXXX")" || return 1
  curl -sSfL --proto '=https' --proto-redir '=https' --retry 3 --max-time 900 -o "$dir/$3" "$1" || return 1
  if ! printf '%s  %s\n' "$2" "$dir/$3" | sha256sum --check --strict - >&2; then
    rm -rf "$dir"
    return 1
  fi
  printf '%s\n' "$dir/$3"
}

# <path printed by fetch>: removes its download folder once the tool is extracted.
discard() { rm -rf "${1%/*}"; }

# <sha256> <path>: the file must hash to the pin.
pinned() { printf '%s  %s\n' "$1" "$2" | sha256sum --check --strict - >&2; }

# Puts a folder first on the PATH of this script and of the job's later steps.
on_path() {
  export PATH="$1:$PATH"
  if [ -n "${GITHUB_PATH:-}" ]; then printf '%s\n' "$1" >>"$GITHUB_PATH"; fi
}

install_solana() {
  [ "${SOLANA_VERSION:-$SOLANA_PIN_VERSION}" = "$SOLANA_PIN_VERSION" ] ||
    die "ci.yml asks for Solana ${SOLANA_VERSION}, but scripts/ci/pins.sh pins ${SOLANA_PIN_VERSION}"
  local install="$HOME/.local/share/solana/install"
  local release="$install/releases/$SOLANA_PIN_VERSION"
  local platform="$HOME/.cache/solana/$PLATFORM_TOOLS_VERSION/platform-tools"
  local archive
  if [ ! -e "$release/solana-release/bin/cargo-build-sbf" ]; then
    archive="$(fetch "$SOLANA_URL" "$SOLANA_SHA256" solana-release.tar.bz2)"
    rm -rf "$release" && mkdir -p "$release"
    tar -xjf "$archive" -C "$release"
    discard "$archive"
  fi
  if [ ! -e "$platform/version.md" ]; then
    archive="$(fetch "$PLATFORM_TOOLS_URL" "$PLATFORM_TOOLS_SHA256" platform-tools.tar.bz2)"
    rm -rf "$platform" && mkdir -p "$platform"
    tar -xjf "$archive" -C "$platform"
    discard "$archive"
  fi
  pinned "$SOLANA_BIN_SHA256" "$release/solana-release/bin/solana"
  pinned "$CARGO_BUILD_SBF_SHA256" "$release/solana-release/bin/cargo-build-sbf"
  (cd "$platform" && printf '%s\n' "$PLATFORM_TOOLS_FILES" | sha256sum --check --strict - >&2)
  ln -sfn "$release/solana-release" "$install/active_release"
  on_path "$install/active_release/bin"
  # Read whole, then matched: `cmd | grep -q` under pipefail fails when grep stops reading first.
  local reported
  reported="$(solana --version)"
  grep -q "^solana-cli $SOLANA_PIN_VERSION " <<<"$reported" || die "solana reports: $reported"
  reported="$(cargo-build-sbf --version)"
  grep -qx "platform-tools $PLATFORM_TOOLS_VERSION" <<<"$reported" ||
    die "cargo-build-sbf does not use platform-tools $PLATFORM_TOOLS_VERSION: $reported"
}

install_shank() {
  [ "${SHANK_VERSION:-$SHANK_PIN_VERSION}" = "$SHANK_PIN_VERSION" ] ||
    die "ci.yml asks for shank-cli ${SHANK_VERSION}, but scripts/ci/pins.sh pins ${SHANK_PIN_VERSION}"
  local dir="$HOME/.local/share/shank-cli" index
  if [ ! -e "$dir/bin/shank" ]; then
    index="$(curl -sSfL --proto '=https' --retry 3 --max-time 60 https://index.crates.io/sh/an/shank-cli)"
    jq -e --arg v "$SHANK_PIN_VERSION" --arg c "$SHANK_CRATE_SHA256" 'select(.vers == $v) | .cksum == $c' \
      <<<"$index" >/dev/null || die "the crates.io index does not give shank-cli $SHANK_PIN_VERSION the pinned checksum"
    cargo install --locked --version "$SHANK_PIN_VERSION" --root "$dir" shank-cli
  fi
  on_path "$dir/bin"
  [ "$(shank --version)" = "shank-cli $SHANK_PIN_VERSION" ] || die "shank reports: $(shank --version)"
}

install_bun() {
  local manager version sums sha zip dir
  manager="$(jq -r '.packageManager // ""' "$root/package.json")"
  version="${manager#bun@}"
  [[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || die "package.json's packageManager is not bun@<x.y.z>: $manager"
  sums="$root/deploy/vps/bun-$version.sha256"
  [ -f "$sums" ] || die "no pinned checksum for Bun $version: add deploy/vps/bun-$version.sha256 (the zip's SHA-256)"
  sha="$(awk '$2 == "bun-linux-x64.zip" { print $1 }' "$sums")"
  [[ "$sha" =~ ^[0-9a-f]{64}$ ]] || die "$sums has no line for bun-linux-x64.zip"
  zip="$(fetch "https://github.com/oven-sh/bun/releases/download/bun-v$version/bun-linux-x64.zip" "$sha" bun.zip)"
  dir="$tools/bun-$version"
  rm -rf "$dir" && mkdir -p "$dir"
  unzip -q -j "$zip" bun-linux-x64/bun -d "$dir"
  discard "$zip"
  chmod 0755 "$dir/bun"
  ln -sfn bun "$dir/bunx"
  on_path "$dir"
  [ "$(bun --version)" = "$version" ] || die "bun reports $(bun --version), package.json names $version"
}

install_node() {
  local archive dir="$tools/node-$NODE_PIN_VERSION"
  archive="$(fetch "$NODE_URL" "$NODE_SHA256" node.tar.xz)"
  rm -rf "$dir" && mkdir -p "$dir"
  tar -xJf "$archive" -C "$dir" --strip-components=1
  discard "$archive"
  pinned "$NODE_BIN_SHA256" "$dir/bin/node"
  on_path "$dir/bin"
  [ "$(node --version)" = "v$NODE_PIN_VERSION" ] || die "node reports $(node --version)"
}

install_gitleaks() {
  local archive dir="$tools/gitleaks-$GITLEAKS_PIN_VERSION"
  archive="$(fetch "$GITLEAKS_URL" "$GITLEAKS_SHA256" gitleaks.tar.gz)"
  rm -rf "$dir" && mkdir -p "$dir"
  tar -xzf "$archive" -C "$dir" gitleaks
  discard "$archive"
  pinned "$GITLEAKS_BIN_SHA256" "$dir/gitleaks"
  on_path "$dir"
  [ "$(gitleaks version)" = "$GITLEAKS_PIN_VERSION" ] || die "gitleaks reports $(gitleaks version)"
}

install_solana_verify() {
  local file dir="$tools/solana-verify-$SOLANA_VERIFY_PIN_VERSION"
  file="$(fetch "$SOLANA_VERIFY_URL" "$SOLANA_VERIFY_SHA256" solana-verify)"
  rm -rf "$dir" && mkdir -p "$dir"
  install -m 0755 "$file" "$dir/solana-verify"
  discard "$file"
  on_path "$dir"
  [ "$(solana-verify --version)" = "solana-verify $SOLANA_VERIFY_PIN_VERSION" ] ||
    die "solana-verify reports $(solana-verify --version)"
}

case "${1:-}" in
  solana) install_solana ;;
  shank) install_shank ;;
  bun) install_bun ;;
  node) install_node ;;
  gitleaks) install_gitleaks ;;
  solana-verify) install_solana_verify ;;
  *) die "usage: install-pinned.sh <solana|shank|bun|node|gitleaks|solana-verify>" ;;
esac
