# shellcheck shell=bash
# shellcheck disable=SC2034  # every name here is read by the scripts that source this file
#
# Purpose: every tool CI downloads, pinned by version, URL and SHA-256, in one place. Sourced by
#          scripts/ci/install-pinned.sh and scripts/ci/verifiable-build.sh. docs/technical/verifiable-build.md
#          says where each hash came from. A version bump changes its hashes here, in the same commit.
# Version: 0.1.0
# Sprint:  16 (hardening), carried from Sprint 00's review (TP section 7.1)
#
# Not here: Bun's zip, pinned in deploy/vps/bun-<version>.sha256 (the same file the server's deploy checks), the
# Surfpool step of .github/workflows/ci.yml, the Hermes VM of tests/react-native/hermes.mjs, and the npm
# packages, which bun.lock and tests/react-native/package-lock.json pin by sha512.

# Solana CLI (Agave) 3.1.10, the release tarball, then two of the binaries in it.
SOLANA_PIN_VERSION="3.1.10"
SOLANA_URL="https://github.com/anza-xyz/agave/releases/download/v3.1.10/solana-release-x86_64-unknown-linux-gnu.tar.bz2"
SOLANA_SHA256="a7205ff29bcf0f7199740225ecae2b85a28ea9668892d5ec21bd9749882984a1"
SOLANA_BIN_SHA256="aacc6871e8ff199608987f0364f2ed9e239a32e1e0548f1ae4477e0e533e1dea"
CARGO_BUILD_SBF_SHA256="4f62f903ff5f97262b000111dfc776bf63d5658733fd4f11bb0a545f87f85560"

# platform-tools v1.52, the default of cargo-build-sbf 3.1.10, which downloads it unchecked when it is missing.
# The files below are checked after extraction, after a cache restore and inside the verifiable-build image.
PLATFORM_TOOLS_VERSION="v1.52"
PLATFORM_TOOLS_URL="https://github.com/anza-xyz/platform-tools/releases/download/v1.52"
PLATFORM_TOOLS_URL+="/platform-tools-linux-x86_64.tar.bz2"
PLATFORM_TOOLS_SHA256="8b3861e93daf085ec12b65c4fac374d9bec4587a3de16871da6b08ab0c1d907e"
PLATFORM_TOOLS_FILES="851c4d2be2cc6a20594232180aaefabf5b694d15ad67505b75d725fb5721327c  version.md
d95c95b68e321ad76634e1fd26b0a7c20ccdbae9ad9ca733f3ae2f2b4a0b6002  rust/bin/rustc
b4171a5b807c0d54cd02fe2ca2ae9505d6bd1c9c8d1d8b23e5189de9abdd4f98  rust/bin/cargo
3b1ea655c8f47c30490b07740a872974e34747ab7ba39c56ae20fba044bd0dae  rust/lib/librustc_driver-26fee09958747c28.so
384b5aebae8bc709bc61ed558ea68eaa29731a54d0682180f9f26b26b769edbf  llvm/bin/lld"

# shank-cli 0.4.9, built by `cargo install --locked` from crates.io: the crate's checksum in the index, which
# cargo then checks the download against. Its dependencies are pinned by the crate's own Cargo.lock.
SHANK_PIN_VERSION="0.4.9"
SHANK_CRATE_SHA256="13fd8b17a9315197eda218a37d3f1c6ca627b0c5111beda8e26cd343d462cff1"

# Node.js 24.21.0 for the Mobile bundle job (Metro 0.87 needs ^22.13, ^24.3 or 26+).
NODE_PIN_VERSION="24.21.0"
NODE_URL="https://nodejs.org/dist/v24.21.0/node-v24.21.0-linux-x64.tar.xz"
NODE_SHA256="fd8e59d5a511510f6a298afb548f18c7d2b1be404d8b4a27d94fbe49f56cb2d6"
NODE_BIN_SHA256="7fde7b8afa198da66257f42ee2001d874c7355631e6d1579a5fb5ef1f246df4c"

# gitleaks 8.30.1, the archive and the binary in it.
GITLEAKS_PIN_VERSION="8.30.1"
GITLEAKS_URL="https://github.com/gitleaks/gitleaks/releases/download/v8.30.1/gitleaks_8.30.1_linux_x64.tar.gz"
GITLEAKS_SHA256="551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb"
GITLEAKS_BIN_SHA256="88f91962aa2f93ac6ab281d553b9e125f5197bbbce38f9f2437f7299c32e5509"

# solana-verify 0.5.2, the release's Linux binary (it needs glibc 2.39: Ubuntu 24.04).
SOLANA_VERIFY_PIN_VERSION="0.5.2"
SOLANA_VERIFY_URL="https://github.com/solana-foundation/solana-verifiable-build/releases/download/v0.5.2"
SOLANA_VERIFY_URL+="/solana-verify-0.5.2-linux"
SOLANA_VERIFY_SHA256="b9d5ccce9634dc14269cab3e7a58649bc141b3306e7735a94478c936341f211f"

# The image `solana-verify build` runs in: tag 3.1.10 of solanafoundation/solana-verifiable-build, by digest. Docker
# Hub's tag and solana-verify 0.5.2's own table name the same digest for Solana 3.1.10.
VERIFY_IMAGE="solanafoundation/solana-verifiable-build"
VERIFY_IMAGE+="@sha256:f71be5ca7620b7e40933b7f1294fa44e01d08c1fc5ba1f375a2478f5a01580d3"
