#!/usr/bin/env bash
# Purpose: lays out the two program artifacts CI publishes from main (Sprint 16): `programs/` is exactly what
#          scripts/deploy/artifact.ts expects (brot_markets.so, brot_markets.json, SHA256SUMS listing both), and
#          `programs-mainnet/` holds the mainnet build under its own name with its own IDL copy and SHA256SUMS.
#          Each binary must hash to the value the caller expects; nothing else enters either folder.
# Version: 0.1.0
# Sprint:  16 (hardening)
#
# Usage: bash scripts/ci/assemble-artifacts.sh <build folder> <empty output folder> <devnet sha256> <mainnet sha256>
# The build folder holds brot_markets.so and brot_markets.mainnet.so (scripts/ci/verifiable-build.sh writes it).
# Both IDLs are the committed one: Shank reads the source, which has one interface for both clusters today.
set -euo pipefail
shopt -s inherit_errexit

die() {
  printf '::error::%s\n' "$*" >&2
  exit 1
}

[ "$#" -eq 4 ] || die "usage: assemble-artifacts.sh <build folder> <output folder> <devnet sha256> <mainnet sha256>"
build="$1" out="$2" devnet="$3" mainnet="$4"
idl="packages/sdk/src/idl/brot_markets.json"
[ -f "$idl" ] || die "run it from the repository root ($idl is missing)"
mkdir -p "$out"
[ -z "$(ls -A "$out")" ] || die "$out is not empty"

pinned() { printf '%s  %s\n' "$1" "$2" | sha256sum --check --strict - >&2 || die "$2 is not the expected binary"; }

# <folder> <expected listing>: the folder holds exactly these names, and its SHA256SUMS lists all but itself.
exactly() {
  local listed
  listed="$(find "$1" -mindepth 1 -maxdepth 1 -printf '%P\n' | LC_ALL=C sort | tr '\n' ' ')"
  [ "$listed" = "$2" ] || die "$1 holds: $listed(expected: $2)"
  (cd "$1" && sha256sum --check --strict SHA256SUMS >&2) || die "$1 does not match its SHA256SUMS"
}

mkdir "$out/programs" "$out/programs-mainnet"
cp "$build/brot_markets.so" "$out/programs/brot_markets.so"
cp "$idl" "$out/programs/brot_markets.json"
cp "$build/brot_markets.mainnet.so" "$out/programs-mainnet/brot_markets.mainnet.so"
cp "$idl" "$out/programs-mainnet/brot_markets.mainnet.json"
pinned "$devnet" "$out/programs/brot_markets.so"
pinned "$mainnet" "$out/programs-mainnet/brot_markets.mainnet.so"

(cd "$out/programs" && sha256sum -- brot_markets.json brot_markets.so >SHA256SUMS)
(cd "$out/programs-mainnet" && sha256sum -- brot_markets.mainnet.json brot_markets.mainnet.so >SHA256SUMS)
exactly "$out/programs" "SHA256SUMS brot_markets.json brot_markets.so "
exactly "$out/programs-mainnet" "SHA256SUMS brot_markets.mainnet.json brot_markets.mainnet.so "
for dir in programs programs-mainnet; do
  echo "$dir/SHA256SUMS:"
  cat "$out/$dir/SHA256SUMS"
done
