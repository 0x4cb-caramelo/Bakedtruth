#!/usr/bin/env bash
# Purpose: the reproducibility gate of the verifiable build (Sprint 16): two clean builds of the commit, made on
#          two runners by scripts/ci/verifiable-build.sh, must be byte for byte the same, and the same as the
#          binaries the Program job's tests ran on. Anything else stops the publication.
# Version: 0.1.0
# Sprint:  16 (hardening)
#
# Usage: bash scripts/ci/compare-builds.sh <first build folder> <second build folder> <tested devnet sha256>
#        <tested mainnet sha256>
# Writes devnet_sha256 and mainnet_sha256 to $GITHUB_OUTPUT and a table to $GITHUB_STEP_SUMMARY when they are set.
set -euo pipefail
shopt -s inherit_errexit

die() {
  printf '::error::%s\n' "$*" >&2
  exit 1
}

[ "$#" -eq 4 ] || die "usage: compare-builds.sh <first> <second> <tested devnet sha256> <tested mainnet sha256>"
first="$1" second="$2" tested_devnet="$3" tested_mainnet="$4"
files=(brot_markets.so brot_markets.mainnet.so cpi_proxy.so)

for dir in "$first" "$second"; do
  [ -f "$dir/SHA256SUMS" ] || die "$dir has no SHA256SUMS"
  (cd "$dir" && sha256sum --check --strict SHA256SUMS >&2) || die "$dir does not match its own SHA256SUMS"
done
for name in "${files[@]}"; do
  cmp -s "$first/$name" "$second/$name" ||
    die "two clean builds of this commit differ in $name: the build is not reproducible"
done

hash_of() { sha256sum "$1" | cut -d' ' -f1; }
devnet="$(hash_of "$first/brot_markets.so")"
mainnet="$(hash_of "$first/brot_markets.mainnet.so")"
[ "$devnet" = "$tested_devnet" ] ||
  die "the verifiable devnet build is $devnet, but the tests ran on $tested_devnet"
[ "$mainnet" = "$tested_mainnet" ] ||
  die "the verifiable mainnet build is $mainnet, but the tests ran on $tested_mainnet"

echo "reproduced twice and equal to the tested binaries: devnet $devnet, mainnet $mainnet"
if [ -n "${GITHUB_OUTPUT:-}" ]; then
  printf 'devnet_sha256=%s\nmainnet_sha256=%s\n' "$devnet" "$mainnet" >>"$GITHUB_OUTPUT"
fi
if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  {
    echo "### Verifiable build"
    echo
    echo "| Binary | SHA-256 | Two clean builds | Tested binary |"
    echo "| --- | --- | --- | --- |"
    echo "| brot_markets.so (devnet) | \`$devnet\` | equal | equal |"
    echo "| brot_markets.mainnet.so | \`$mainnet\` | equal | equal |"
    echo "| cpi_proxy.so (test-only) | \`$(hash_of "$first/cpi_proxy.so")\` | equal | not published |"
  } >>"$GITHUB_STEP_SUMMARY"
fi
