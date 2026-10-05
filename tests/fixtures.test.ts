// Purpose: the captured accounts in tests/fixtures are exactly the ones index.json describes. Git shows a changed
//          .bin only as "binary files differ", so a swapped fixture would otherwise pass review unseen.
// Version: 0.1.0
// Sprint:  01 (price reader proof)

import { expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

type Entry = { length: number; sha256: string };

// fileURLToPath, not URL.pathname: on Windows the pathname is "/F:/...", which is not a usable path.
const DIR = fileURLToPath(new URL("./fixtures/", import.meta.url));
const index: Record<string, Entry> = JSON.parse(readFileSync(`${DIR}index.json`, "utf8"));
const names = Object.keys(index).sort();

test("every .bin in the folder has an index entry, and every entry has its .bin", () => {
  const files = readdirSync(DIR)
    .filter((file) => file.endsWith(".bin"))
    .map((file) => file.slice(0, -".bin".length))
    .sort();
  expect(files).toEqual(names);
});

test("every captured account has the size and the SHA-256 the index records", () => {
  const recorded = names.map((name) => ({ name, length: index[name]!.length, sha256: index[name]!.sha256 }));
  const onDisk = names.map((name) => {
    const bytes = readFileSync(`${DIR}${name}.bin`);
    return { name, length: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") };
  });
  expect(onDisk).toEqual(recorded);
});
