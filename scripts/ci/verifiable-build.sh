#!/usr/bin/env bash
# Purpose: the verifiable build of brot-markets (Sprint 16): `solana-verify build` in the image pinned by digest
#          (scripts/ci/pins.sh), once its Solana CLI and platform-tools are shown to be the pinned release's,
#          each variant from an empty target/, the binaries copied out with SHA256SUMS. CI runs it on two
#          runners and compares the hashes; anyone with Docker reproduces the published binaries with it.
# Version: 0.1.0
# Sprint:  16 (hardening)
#
# Usage, from the root of a clean checkout of the published commit:
#   MAINNET_FEATURES=mainnet bash scripts/ci/verifiable-build.sh <empty output folder>
# Writes brot_markets.so (default features: the devnet artifact), brot_markets.mainnet.so (--features
# $MAINNET_FEATURES: the mainnet artifact), cpi_proxy.so (test-only, never published) and SHA256SUMS. Needs
# Docker and solana-verify 0.5.2 (bash scripts/ci/install-pinned.sh solana-verify).
# shellcheck source-path=SCRIPTDIR
set -euo pipefail
shopt -s inherit_errexit

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=pins.sh
source "$here/pins.sh"

die() {
  printf '::error::%s\n' "$*" >&2
  exit 1
}

out="${1:-}"
[ -n "$out" ] || die "usage: MAINNET_FEATURES=<features> verifiable-build.sh <empty output folder>"
features="${MAINNET_FEATURES:-}"
[ -n "$features" ] || die "set MAINNET_FEATURES, the feature list of the mainnet build (ci.yml's env)"
[ -f Cargo.lock ] && [ -f programs/brot-markets/Cargo.toml ] || die "run it from the repository root"
mkdir -p "$out"
[ -z "$(ls -A "$out")" ] || die "$out is not empty"
out="$(cd "$out" && pwd)"
[ "$(solana-verify --version)" = "solana-verify $SOLANA_VERIFY_PIN_VERSION" ] ||
  die "solana-verify $SOLANA_VERIFY_PIN_VERSION is required: bash scripts/ci/install-pinned.sh solana-verify"

# 1. The image by digest, and inside it, offline, the same pins the runners' toolchain is checked against.
export SOLANA_BIN_SHA256 CARGO_BUILD_SBF_SHA256 PLATFORM_TOOLS_FILES PLATFORM_TOOLS_VERSION SOLANA_PIN_VERSION
docker pull --quiet "$VERIFY_IMAGE" >/dev/null
docker run --rm -i --network none \
  -e SOLANA_BIN_SHA256 -e CARGO_BUILD_SBF_SHA256 -e PLATFORM_TOOLS_FILES -e PLATFORM_TOOLS_VERSION \
  -e SOLANA_PIN_VERSION "$VERIFY_IMAGE" bash -s <<'IN_IMAGE'
set -euo pipefail
bin="$(dirname "$(readlink -f "$(command -v cargo-build-sbf)")")"
cd "$bin"
printf '%s  solana\n%s  cargo-build-sbf\n' "$SOLANA_BIN_SHA256" "$CARGO_BUILD_SBF_SHA256" | sha256sum --check --strict -
cd "$HOME/.cache/solana/$PLATFORM_TOOLS_VERSION/platform-tools"
printf '%s\n' "$PLATFORM_TOOLS_FILES" | sha256sum --check --strict -
grep -q "^solana-cli $SOLANA_PIN_VERSION " <<<"$(solana --version)"
grep -qx "platform-tools $PLATFORM_TOOLS_VERSION" <<<"$(cargo-build-sbf --version)"
echo "the image's Solana CLI $SOLANA_PIN_VERSION and platform-tools $PLATFORM_TOOLS_VERSION match the pins"
IN_IMAGE

# The container writes target/ as root: it is emptied the same way, without sudo.
clean_target() { docker run --rm --network none -v "$PWD:/build" "$VERIFY_IMAGE" rm -rf /build/target; }

# <library> <output name> [-- <cargo arguments>]: one build from an empty target/.
build() {
  local library="$1" name="$2"
  shift 2
  clean_target
  solana-verify build --library-name "$library" --base-image "$VERIFY_IMAGE" "$@"
  cp "target/deploy/$library.so" "$out/$name"
}

# 2. The three builds. The mainnet one passes the feature list and nothing else.
build brot_markets brot_markets.so
build brot_markets brot_markets.mainnet.so -- --features "$features"
build cpi_proxy cpi_proxy.so
clean_target
dirty="$(git status --porcelain --untracked-files=no)"
[ -z "$dirty" ] || die "the build changed tracked files: $dirty"

# 3. The hashes: sha256sum's, and solana-verify's (the same bytes without trailing zeros, which is what it
#    compares with a deployed program).
(cd "$out" && sha256sum -- brot_markets.so brot_markets.mainnet.so cpi_proxy.so >SHA256SUMS && cat SHA256SUMS)
for name in brot_markets.so brot_markets.mainnet.so; do
  printf 'solana-verify get-executable-hash %s: %s\n' "$name" "$(solana-verify get-executable-hash "$out/$name")"
done
