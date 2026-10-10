/**
 * Purpose: X2.1. The chain the wallet registers for (from the site's cluster setting) equals the chain for the cluster
 *          the read API reports in /api/v1/health. Registration runs at most once; an unknown cluster is refused.
 * Version: 0.1.0
 * Sprint:  09 (site shell, theme and wallet)
 */
import { describe, expect, test } from "bun:test";
import type { RegisterFn } from "./register-mwa";
import { chainOf, createMwaRegistrar } from "./register-mwa";

const fakeRegister = () => {
  const calls: Parameters<RegisterFn>[0][] = [];
  const register = ((config: Parameters<RegisterFn>[0]) => calls.push(config)) as RegisterFn;
  return { register, calls };
};

describe("X2.1: the wallet's chain equals the API's cluster", () => {
  for (const cluster of ["devnet", "local"]) {
    test(`registers the chain of health.cluster "${cluster}"`, () => {
      const health = { status: "ok", cluster };
      const { register, calls } = fakeRegister();
      const chain = createMwaRegistrar(register)({ cluster: health.cluster, origin: "https://site.example.test" });
      expect(chain).toBe(chainOf(health.cluster));
      expect(calls[0]?.chains).toEqual([chainOf(health.cluster)]);
    });
  }

  test("the icon is a relative path and the app identity carries the origin", () => {
    const { register, calls } = fakeRegister();
    createMwaRegistrar(register)({ cluster: "devnet", origin: "https://site.example.test" });
    expect(calls[0]?.appIdentity).toEqual({
      name: "Brot Markets",
      uri: "https://site.example.test",
      icon: "favicon.ico",
    });
  });

  test("registers at most once", () => {
    const { register, calls } = fakeRegister();
    const registerOnce = createMwaRegistrar(register);
    registerOnce({ cluster: "devnet", origin: "https://site.example.test" });
    registerOnce({ cluster: "devnet", origin: "https://site.example.test" });
    expect(calls).toHaveLength(1);
  });

  test("an unknown cluster is refused, and nothing is registered", () => {
    const { register, calls } = fakeRegister();
    expect(() =>
      createMwaRegistrar(register)({ cluster: "mainnet-beta", origin: "https://site.example.test" }),
    ).toThrow('no MWA chain for cluster "mainnet-beta"');
    expect(calls).toHaveLength(0);
  });
});
