import { describe, expect, it } from "vitest";
import {
  RAPIER_BOOTSTRAP_EXPECTED_HASH,
  assertRapierBootstrap,
  runRapierBootstrapSelfTest
} from "../../src/simulation/rapierBootstrap";

describe("Rapier bootstrap", () => {
  it("matches the frozen tiny-world hash twice", async () => {
    await expect(assertRapierBootstrap()).resolves.toBe(RAPIER_BOOTSTRAP_EXPECTED_HASH);
    await expect(runRapierBootstrapSelfTest()).resolves.toBe(RAPIER_BOOTSTRAP_EXPECTED_HASH);
  });
});
