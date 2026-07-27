export interface ReleaseAsset {
  readonly path: string;
  readonly sha256: string;
  readonly bytes: number;
  readonly kind: "html" | "script" | "style" | "wasm" | "manifest" | "asset";
}

export interface ReleaseManifest {
  readonly schemaVersion: 2;
  readonly releaseId: string;
  readonly assetSetHash: string;
  readonly assets: readonly ReleaseAsset[];
}

export class ReleaseIdentityMismatchError extends Error {
  public readonly expectedReleaseId: string;
  public readonly actualReleaseId: string;

  public constructor(expectedReleaseId: string, actualReleaseId: string) {
    super(
      `Cached release mismatch: application ${expectedReleaseId}, asset set ${actualReleaseId}.`
    );
    this.name = "ReleaseIdentityMismatchError";
    this.expectedReleaseId = expectedReleaseId;
    this.actualReleaseId = actualReleaseId;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isReleaseAsset(value: unknown): value is ReleaseAsset {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.path === "string" &&
    value.path.startsWith("/") &&
    typeof value.sha256 === "string" &&
    /^[0-9a-f]{64}$/.test(value.sha256) &&
    typeof value.bytes === "number" &&
    Number.isInteger(value.bytes) &&
    value.bytes >= 0 &&
    (value.kind === "html" ||
      value.kind === "script" ||
      value.kind === "style" ||
      value.kind === "wasm" ||
      value.kind === "manifest" ||
      value.kind === "asset")
  );
}

export function parseReleaseManifest(value: unknown): ReleaseManifest {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 2 ||
    typeof value.releaseId !== "string" ||
    value.releaseId.length === 0 ||
    typeof value.assetSetHash !== "string" ||
    !/^[0-9a-f]{64}$/.test(value.assetSetHash) ||
    !Array.isArray(value.assets) ||
    !value.assets.every(isReleaseAsset)
  ) {
    throw new Error("Release manifest is missing required versioned asset identity.");
  }
  return {
    schemaVersion: 2,
    releaseId: value.releaseId,
    assetSetHash: value.assetSetHash,
    assets: value.assets
  };
}

export function assertReleaseIdentity(expectedReleaseId: string, manifest: ReleaseManifest): void {
  if (manifest.releaseId !== expectedReleaseId) {
    throw new ReleaseIdentityMismatchError(expectedReleaseId, manifest.releaseId);
  }
  const hasScript = manifest.assets.some(({ kind }) => kind === "script");
  const hasWasm = manifest.assets.some(({ kind }) => kind === "wasm");
  if (!hasScript || !hasWasm) {
    throw new Error("Release manifest does not bind both JavaScript and Rapier WASM.");
  }
}
