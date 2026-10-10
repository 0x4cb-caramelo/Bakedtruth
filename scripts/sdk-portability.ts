/**
 * Purpose: the SDK's portability lint (proposal 3.2; Sprint 05 DoD "a lint rule fails if it does"):
 *          every identifier in packages/sdk/src (the generated Codama client aside) that resolves only to a
 *          Node, Bun or DOM declaration fails the check, so `Buffer`, `process`, `fetch`, `TextEncoder`,
 *          `setTimeout`, `window` or `document` cannot enter code that must run under React Native.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 *
 * The SDK's own tsconfig (ES2022, no types) already fails on DOM globals, but Kit's declarations pull in
 * @types/node, which declares Node's globals for every file of the program; this check asks the compiler
 * where each name used is declared instead. Imports are dependency-cruiser's (.dependency-cruiser.cjs).
 */
import ts from "typescript";

const CONFIG = "packages/sdk/tsconfig.json";
/** Declarations from these files are not available on every runtime the SDK targets. */
const NOT_PORTABLE =
  /node_modules\/(?:\.bun\/[^/]+\/node_modules\/)?(@types\/node|undici-types|bun-types|@types\/bun)\/|lib\.dom|lib\.webworker/;
const OWN = /\/packages\/sdk\/src\/(?!idl\/generated\/)/;

const parsed = ts.getParsedCommandLineOfConfigFile(
  CONFIG,
  {},
  {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: (d) => {
      throw new Error(ts.flattenDiagnosticMessageText(d.messageText, "\n"));
    },
  },
);
if (!parsed) throw new Error(`cannot read ${CONFIG}`);
const program = ts.createProgram(parsed.fileNames, parsed.options);
const checker = program.getTypeChecker();
const problems: string[] = [];

function visit(node: ts.Node, file: ts.SourceFile) {
  if (ts.isIdentifier(node)) {
    const symbol = checker.getSymbolAtLocation(node);
    const declarations = symbol?.getDeclarations() ?? [];
    if (declarations.length > 0 && declarations.every((d) => NOT_PORTABLE.test(d.getSourceFile().fileName))) {
      const { line, character } = file.getLineAndCharacterOfPosition(node.getStart(file));
      problems.push(`${file.fileName.split("/packages/")[1]}:${line + 1}:${character + 1} uses ${node.text}`);
    }
  }
  ts.forEachChild(node, (child) => visit(child, file));
}

for (const file of program.getSourceFiles()) {
  if (OWN.test(file.fileName)) visit(file, file);
}

if (problems.length > 0) {
  console.error(`sdk portability: ${problems.length} use(s) of a Node, Bun or DOM global:\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(
  `sdk portability: no Node, Bun or DOM global in ${program.getSourceFiles().filter((f) => OWN.test(f.fileName)).length} files`,
);
