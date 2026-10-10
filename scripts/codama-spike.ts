/**
 * Purpose: the Codama spike (T9): renders a Kit client from the Shank IDL of brot-markets into
 *          packages/sdk/src/idl/generated. Sprint 05 decides whether the SDK adopts it; until then
 *          only tests/brot/codama-spike.test.ts and tests/brot/idl.test.ts import it.
 * Version: 0.0.2 (the event authority of the new program id)
 * Sprint:  02 (pot core on Pinocchio), lane F
 *
 * Run by `bun run idl` after shank-cli. Two defaults are added with Codama's own visitor, as an
 * SDK would: the event authority (a constant PDA, checked by tests/brot/kit.test.ts) and the
 * program slot, the two accounts every instruction ends with (T4).
 */
import { readFileSync } from "node:fs";

import { rootNodeFromAnchor, type AnchorIdl } from "@codama/nodes-from-anchor";
import { renderVisitor } from "@codama/renderers-js";
import {
  createFromRoot,
  programIdValueNode,
  publicKeyValueNode,
  setInstructionAccountDefaultValuesVisitor,
} from "codama";

export const IDL_PATH = "packages/sdk/src/idl/brot_markets.json";
/** The renderer's package folder holds no package.json, so it neither writes nor checks one. */
export const PACKAGE_FOLDER = "packages/sdk/src/idl";
export const GENERATED_FOLDER = "generated";
/** PDA `["__event_authority"]` of the program, bump 254 (constants.rs). */
const EVENT_AUTHORITY = "CmNehEdy55jRh7waxt2u5vbwLwe3jmRuZXv3AHi1qGwx";

/** Renders the Kit client of the IDL at `idlPath` into `packageFolder/generated`. */
export async function renderCodamaClient(idlPath = IDL_PATH, packageFolder = PACKAGE_FOLDER) {
  const idl = JSON.parse(readFileSync(idlPath, "utf8")) as AnchorIdl;
  const codama = createFromRoot(rootNodeFromAnchor(idl));
  codama.update(
    setInstructionAccountDefaultValuesVisitor([
      { account: "eventAuthority", defaultValue: publicKeyValueNode(EVENT_AUTHORITY, "eventAuthority") },
      { account: "program", defaultValue: programIdValueNode() },
    ]),
  );
  await codama.accept(
    renderVisitor(packageFolder, {
      generatedFolder: GENERATED_FOLDER,
      kitImportStrategy: "rootOnly",
      syncPackageJson: false,
    }),
  );
  return codama.getRoot();
}

/** One line on what was rendered, for the build log. */
export function describeRender(root: Awaited<ReturnType<typeof renderCodamaClient>>): string {
  const { accounts, instructions, definedTypes, errors } = root.program;
  const count = (nodes?: readonly unknown[]) => nodes?.length ?? 0;
  return (
    `codama: ${count(accounts)} accounts, ${count(instructions)} instructions, ${count(definedTypes)} types, ` +
    `${count(errors)} errors -> ${PACKAGE_FOLDER}/${GENERATED_FOLDER}`
  );
}

if (import.meta.main) console.log(describeRender(await renderCodamaClient()));
