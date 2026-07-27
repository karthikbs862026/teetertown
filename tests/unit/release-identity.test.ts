import { describe, expect, it } from "vitest";
import {
  ReleaseIdentityMismatchError,
  assertReleaseIdentity,
  parseReleaseManifest
} from "../../src/platform/releaseIdentity";

const HASH = "1".repeat(64);

function manifest(releaseId: string, includeWasm = true): unknown {
  return {
    schemaVersion: 2,
    releaseId,
    assetSetHash: HASH,
    assets: [
      { path: "/assets/app.js", sha256: HASH, bytes: 10, kind: "script" },
      ...(includeWasm
        ? [{ path: "/assets/rapier.wasm", sha256: HASH, bytes: 20, kind: "wasm" }]
        : [])
    ]
  };
}

describe("atomic release identity", () => {
  it("accepts one manifest that binds JavaScript and WASM", () => {
    const parsed = parseReleaseManifest(manifest("release-a"));
    expect(() => assertReleaseIdentity("release-a", parsed)).not.toThrow();
  });

  it("rejects a mixed JavaScript and cached-asset release before world creation", () => {
    const parsed = parseReleaseManifest(manifest("release-b"));
    expect(() => assertReleaseIdentity("release-a", parsed)).toThrow(ReleaseIdentityMismatchError);
  });

  it("rejects a release without both executable asset types", () => {
    const parsed = parseReleaseManifest(manifest("release-a", false));
    expect(() => assertReleaseIdentity("release-a", parsed)).toThrow(
      "does not bind both JavaScript and Rapier WASM"
    );
  });
});
