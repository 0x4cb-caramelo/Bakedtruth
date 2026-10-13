# Verifiable build, provenance and pinned tools

Status: **written in Sprint 16** (2026-10-13), with the CI jobs it describes (`.github/workflows/ci.yml`). Nothing
here has run in GitHub Actions yet: the first run on this branch is the proof, and "What only CI can prove" below
says what to look for. The provenance attestation is **blocked**: it needs a public repository or a paid plan (the
founders' decision, below).

Sources are listed at the end; every hash in this file was computed on 2026-10-13 from the official download and
compared with what its publisher states, as the table says.

## What CI builds and publishes

| Job | When | What it does |
|---|---|---|
| Program | every run | Builds the program with `cargo build-sbf` (tested binaries), and the mainnet variant with `--features $MAINNET_FEATURES`; runs every test; reports both SHA-256 values |
| Verifiable build (1 and 2 of 2) | push to `main`, manual runs (any branch) | Two runners each run `scripts/ci/verifiable-build.sh`: `solana-verify build` in the image pinned by digest, from a fresh checkout and an empty `target/`, no cache of any kind |
| Verifiable build is reproducible and tested | after the two builds | `scripts/ci/compare-builds.sh`: the two builds are byte for byte equal, and equal to the binaries the Program job tested. Anything else stops the publication |
| Publish program artifacts | push to `main`, manual runs | Builds nothing, restores no cache: lays out the verified bytes (`scripts/ci/assemble-artifacts.sh`). Uploads only on `main` |
| Provenance attestation | `main`, public repository only | `actions/attest-build-provenance` over the four published files. Skipped while the repository is private |

The two artifacts of a run on `main`:

- `programs-<sha>`: `brot_markets.so` (default features: the devnet build), `brot_markets.json` (the committed IDL)
  and `SHA256SUMS`. Exactly the shape `scripts/deploy/artifact.ts` downloads and `scripts/deploy/checks.ts`
  verifies; the Program job runs that check on the same layout (`scripts/ci/artifact-layout.ts`).
- `programs-mainnet-<sha>`: `brot_markets.mainnet.so` (built with `--features mainnet`),
  `brot_markets.mainnet.json` and their `SHA256SUMS`. The IDL is a byte copy of the devnet one: Shank reads the
  source, which has one interface for both clusters. **The mainnet build still declares the devnet program id**
  (`5Rx8…n8o`, `declare_id!` in `programs/brot-markets/src/lib.rs`); mainnet gets its own id (deploy README,
  decision 3), and that needs a program change before any mainnet deploy, at which point the two IDLs differ.

A separate artifact, not extra files in `programs-<sha>`, because the deploy check refuses a folder that holds
anything but its two files. The devnet path is unchanged: same name, same files, same check.

Since this sprint the devnet binary CI publishes comes from the verifiable build. It is byte for byte the binary
the tests ran on (the comparison job refuses anything else), so a devnet deploy can be checked with
`solana-verify` as a mainnet one will be.

## T12: the mainnet artifact carries the real values

The Definition of Done asks for proof on the artifact, not only on the source. The chain:

1. One feature list, `MAINNET_FEATURES` in the workflow's `env`, is read by the Program job's mainnet build, its
   mainnet tests and the verifiable mainnet build. `drill` cannot be added to it: `constants.rs` refuses
   `mainnet` with `drill` at compile time.
2. The Program job runs `cargo test --features no-entrypoint,mainnet` with `SBF_OUT_DIR` pointing at its mainnet
   binary: the T12 test (`mainnet_build_carries_the_real_values`) checks the constants, and the Mollusk tests run
   that binary. Run locally on 2026-10-13: all pass.
3. Then LiteSVM runs the mainnet binary where the tests load `target/deploy/brot_markets.so`: "row 5" of
   `tests/brot/open-campaign-refuses.test.ts` (a 3 days − 1 s campaign refused with `DurationTooShort`) and
   "a mint's supply at or below the target" of `tests/brot/resolve-campaign.test.ts` (`review_ends_at` six hours
   after resolution). Run locally: both pass on the default and the mainnet builds, **both fail on a drill
   build**, so the check can fail.
4. The comparison job requires the published `brot_markets.mainnet.so` to be byte for byte the binary of steps 2
   and 3, and the publish job checks that hash again before naming the file.

If a test named in step 3 is renamed, `bun test -t` matches nothing and fails, so the step cannot pass empty. A
dedicated test ("mainnet artifact carries the real constants", Sprint 16's test list) would be sturdier.

## Reproduce the published hash

Needs Docker, Git and `solana-verify` 0.5.2. The repository is private today, so only someone with read access
can do this; a public repository is a mainnet criterion anyway (TP §7, "Verifiable build").

```bash
git clone https://github.com/0x4cb-caramelo/Bakedtruth.git && cd Bakedtruth
git checkout <the commit of the CI run>
bash scripts/ci/install-pinned.sh solana-verify   # Linux x64; or: cargo install --locked --version 0.5.2 solana-verify
export PATH="${TMPDIR:-/tmp}/pinned-tools/solana-verify-0.5.2:$PATH"
MAINNET_FEATURES=mainnet bash scripts/ci/verifiable-build.sh "$HOME/brot-verify"
cat "$HOME/brot-verify/SHA256SUMS"                 # compare with the artifact's SHA256SUMS
```

The same builds by hand, each from an empty `target/` (the container writes it as root, so it is emptied through
the container too):

```bash
IMAGE=solanafoundation/solana-verifiable-build@sha256:f71be5ca7620b7e40933b7f1294fa44e01d08c1fc5ba1f375a2478f5a01580d3
docker run --rm -v "$PWD:/build" "$IMAGE" rm -rf /build/target
solana-verify build --library-name brot_markets --base-image "$IMAGE"                       # devnet
cp target/deploy/brot_markets.so "$HOME/brot_markets.so"
docker run --rm -v "$PWD:/build" "$IMAGE" rm -rf /build/target
solana-verify build --library-name brot_markets --base-image "$IMAGE" -- --features mainnet  # mainnet
```

`--base-image` is required: with no `[workspace.metadata.cli]` table in the root `Cargo.toml`, solana-verify picks
its image from the first of `solana-program`, `solana-program-error` and `solana-account-info` it finds in
`Cargo.lock`, which here is `solana-program-error` 3.0.1, so it would build with the Solana 3.0.1 image instead of
3.1.10. The digest above is the one Docker Hub gives tag `3.1.10` and the one solana-verify 0.5.2's own table maps
to Solana 3.1.10. Before building, the script checks inside the image, offline, that its `solana`,
`cargo-build-sbf` and five platform-tools files hash to the same pins as the runners' toolchain.

Against a deployed program: `solana-verify get-program-hash -u <rpc> <program id>` must print the same hash as
`solana-verify get-executable-hash <file>`. Both drop the trailing zero bytes, so this hash differs from
`sha256sum`'s whenever the file ends in zeros; the build script prints both.

Why the runner build and the container build should match: on 2026-10-13 a local `cargo build-sbf` of `395efa5`
(another path, another machine, a fresh `target/`) gave `63610a32…` byte for byte, the hash of CI's artifact of the
same commit (run 38352871035). The path does not enter the binary.

## Check the provenance attestation

Once the job runs (public repository), for each downloaded file:

```bash
gh attestation verify brot_markets.so --repo 0x4cb-caramelo/Bakedtruth \
  --signer-workflow 0x4cb-caramelo/Bakedtruth/.github/workflows/ci.yml \
  --source-ref refs/heads/main --source-digest <the run's commit> --deny-self-hosted-runners
```

It proves the file was produced by this workflow, on `main`, at that commit, on a GitHub-hosted runner; it does not
prove what the workflow did, which is what the reproducible build is for.

**Blocked.** GitHub's documentation: "If you are on a GitHub Free, GitHub Pro, or GitHub Team plan, artifact
attestations are only available for public repositories. To use artifact attestations in private or internal
repositories, you must be on a GitHub Enterprise Cloud plan." The repository is private and owned by a user
account (checked with `gh api` on 2026-10-13), so no plan of that account adds them. The job is skipped, never
faked green, and the publish job's summary says the files are not attested.

## Pinned tools

Every tool CI downloads, where its pin lives and where the hash came from. "GitHub digest" is the `digest` the
GitHub releases API gives the asset; every row's hash was also computed here from the download.

| Tool | Version | Pinned in | Hash checked | Publisher's own check it agrees with |
|---|---|---|---|---|
| Solana CLI (Agave) | 3.1.10 | `scripts/ci/pins.sh` | release tarball `a7205ff2…`; `solana` and `cargo-build-sbf` binaries | GitHub digest (the release has no checksum file); the binaries equal the ones the official installer put on the development machine |
| platform-tools | v1.52 (cargo-build-sbf 3.1.10's default) | `scripts/ci/pins.sh` | tarball `8b3861e9…`; `version.md`, `rustc`, `cargo`, `librustc_driver`, `lld` | GitHub digest (no checksum file); the five files equal the development machine's copy |
| shank-cli | 0.4.9 | `scripts/ci/pins.sh` | crate checksum `13fd8b17…` in the crates.io index, then `cargo install --locked` checks the download against it | crates.io API; dependencies pinned by the crate's `Cargo.lock` |
| Bun | 1.4.2 (`package.json`) | `deploy/vps/bun-1.4.2.sha256` | `bun-linux-x64.zip` `36368fae…` | Bun's `SHASUMS256.txt` and GitHub digest; the same pin the server's deploy checks |
| Node.js (Mobile bundle) | 24.21.0 | `scripts/ci/pins.sh` | `node-v24.21.0-linux-x64.tar.xz` `fd8e59d5…`; the `node` binary | nodejs.org `SHASUMS256.txt` (its GPG signature not checked) |
| gitleaks | 8.30.1 | `scripts/ci/pins.sh` | `gitleaks_8.30.1_linux_x64.tar.gz` `551f6fc8…`; the binary | the release's `checksums.txt` and GitHub digest |
| solana-verify | 0.5.2 | `scripts/ci/pins.sh` | `solana-verify-0.5.2-linux` `b9d5ccce…` | the release's `.sha256` file and GitHub digest. Needs glibc 2.39 (Ubuntu 24.04) |
| Build image | `solana-verifiable-build:3.1.10` | `scripts/ci/pins.sh` | by digest `sha256:f71be5ca…` | Docker Hub tag `3.1.10` and solana-verify 0.5.2's image table |
| Surfpool | 1.6.0 | `ci.yml` (Sprint 03) | archive and binary | GitHub digest |
| Hermes VM | v0.13.0 | `tests/react-native/hermes.mjs` (Sprint 05) | archive and binary | GitHub digest |
| npm packages (Metro, hermesc, Babel, the workspace) | lockfiles | `bun.lock`, `tests/react-native/package-lock.json` | sha512 per tarball, checked by `bun install --frozen-lockfile` and `npm ci` | `scripts/ci/lockfile-registry.js` keeps both on registry.npmjs.org |
| GitHub Actions | — | `ci.yml` | full commit SHA per action | Dependabot proposes updates weekly |

`scripts/ci/install-pinned.sh` downloads into a new empty folder, checks the hash before anything reads the file,
checks the binary and its version after extraction, and only then puts it on the PATH; nothing is piped into a
shell. A tool restored from the Program job's cache is checked against the same hashes. The Program job keeps its
caches (Rust, Solana, shank): its binaries are tested, never published, and the published ones must equal them.

Not pinned by this repository:

- **The Rust toolchain** of the runners (1.89.0, `rust-toolchain.toml`): rustup checks each component against the
  SHA-256 in the channel manifest it downloads over HTTPS. The published binaries do not use it: they come from
  the image, whose toolchain is checked by hash.
- **The image's other files** (its base Rust, apt packages): frozen by the digest, not compared with any upstream.
- **shank-cli's compiled binary**, when restored from cache: checked by version only, since a compiled binary is
  not reproducible across compilers.
- **The runner image** itself (GitHub's `ubuntu-24.04`, with its Docker, curl, jq, git).

To bump a tool: change its version and hashes in `scripts/ci/pins.sh` (Bun: `package.json` and a new
`deploy/vps/bun-<version>.sha256`) in one commit, computing each hash from the official download and comparing it
with the publisher's checksum, as above. Another Solana version also needs a new image digest.

## Secret scan

`node scripts/ci-secret-scan.js <base> [--require-gitleaks]`, over every commit the branch adds and its net diff:

1. the commit hook's patterns (`.claude/hooks/block-secret-commit.js`);
2. `scripts/ci/solana-keys.js`: every 64-byte value in an added line (base58, hex, base64, a JSON byte array, also
   spread over lines) whose second half is the ed25519 public key of its first half. Transaction signatures, which
   the session logs record, never pass;
3. `scripts/ci/file-rules.js`: key stores (`*.keystore`, `*.jks` and others), compiled binaries, archives, and any
   binary file that is not an image, a font or a `tests/fixtures/*.bin` capture;
4. gitleaks 8.30.1 with `.gitleaks.toml`: its default rules plus the 64-value array, base58 and hex secrets next to
   a word naming a secret, credentials in URLs (`?api-key=`, `user:password@`), key stores and binaries.
   `--redact`, and `gitleaks:allow` comments ignored. In commit mode gitleaks skips files git calls binary, which
   is why the file rules exist.

CI installs the pinned gitleaks and passes `--require-gitleaks`. Locally, without gitleaks the scan says it did not
run it; with it: `bash scripts/ci/install-pinned.sh gitleaks` and
`GITLEAKS_BIN="${TMPDIR:-/tmp}/pinned-tools/gitleaks-8.30.1/gitleaks"`. The only exempt file is the hook's own test
(`scripts/test/hooks.test.js`), in both the script and `.gitleaks.toml`. On 2026-10-13, with this configuration,
gitleaks found nothing in a clean checkout of this branch nor in the history of a fresh clone (510 commits on its
63 refs, 467 of them on `main`). A planted commit in a throwaway clone (keypairs in every shape, an RPC URL with a
key, a password in a URL, a keystore, a jks, a `.so`, binary blobs) was caught, each item by at least one check.

## What binds, and what does not

`.github/CODEOWNERS` names `@0x4cb-caramelo` and `@0xcf07` (both with write access) for `.github/`, the scan and its
rules, `scripts/ci/`, `.claude/hooks/` and the Bun pin. GitHub enforces code owners only through branch protection
or a ruleset requiring their review, and both are available to private repositories only from GitHub Pro (user)
or Team (organization) up. Until the founders decide, the file names reviewers and blocks nothing, and a direct push
to `main` skips every check here.

Also on this plan: private repositories get 2,000 Actions minutes a month; public ones use standard runners free.
The two verifiable builds add roughly 10 to 15 runner-minutes to each push to `main` (estimate; the first run gives
the real figure).

## What only CI can prove

- The two verifiable builds agree, and equal the Program job's binaries (the comparison job's summary table). If
  they differ from the tested ones, the container and the runner do not produce the same bytes: then the publish
  job must test the container's bytes instead, and this file changes.
- The image check passes inside the pinned image (`the image's Solana CLI 3.1.10 and platform-tools v1.52 match the
  pins` in each verifiable job's log).
- The Program job's cache-miss path (download, check, extract) and the cache-hit path on the next run.
- `node scripts/ci-secret-scan.js` with `--require-gitleaks` on a runner, and the gitleaks case of
  `scripts/ci/secret-scan.test.js` (skipped where gitleaks is missing).

## Sources

- solana-verify 0.5.2: README and source (`src/main.rs`, `src/image_config.rs`) of the crate,
  `https://static.crates.io/crates/solana-verify/solana-verify-0.5.2.crate` (checksum `100996e2…`, crates.io index);
  release assets, `https://github.com/solana-foundation/solana-verifiable-build/releases/tag/v0.5.2`.
- Image: `https://hub.docker.com/v2/repositories/solanafoundation/solana-verifiable-build/tags/3.1.10`.
- cargo-build-sbf 3.1.10 (default platform-tools v1.52, the download it makes unchecked):
  `https://github.com/anza-xyz/agave/blob/v3.1.10/platform-tools-sdk/cargo-build-sbf/src/toolchain.rs`.
- Release assets and digests: `https://github.com/anza-xyz/agave/releases/tag/v3.1.10`,
  `https://github.com/anza-xyz/platform-tools/releases/tag/v1.52`, `https://github.com/oven-sh/bun/releases/tag/bun-v1.4.2`,
  `https://github.com/gitleaks/gitleaks/releases/tag/v8.30.1`, `https://nodejs.org/dist/v24.21.0/SHASUMS256.txt`,
  `https://index.crates.io/sh/an/shank-cli`.
- gitleaks configuration and exit codes: `https://github.com/gitleaks/gitleaks/blob/v8.30.1/README.md`; default rules
  and allowlist: `https://github.com/gitleaks/gitleaks/blob/v8.30.1/config/gitleaks.toml`.
- Attestations: `https://docs.github.com/en/actions/how-tos/secure-your-work/use-artifact-attestations/use-artifact-attestations`
  and the note in `https://github.com/actions/attest-build-provenance` (v4 wraps `actions/attest`).
- Code owners, protected branches, rulesets, Actions minutes:
  `https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners`,
  `https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches`,
  `https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets`,
  `https://docs.github.com/en/billing/concepts/product-billing/github-actions`.
