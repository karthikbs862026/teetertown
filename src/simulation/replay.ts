import {
  ASSET_MANIFEST_VERSION,
  BUILD_COMMIT,
  GAME_VERSION,
  PHYSICS_VERSION,
  RAPIER_VERSION,
  REPLAY_SCHEMA_VERSION
} from "./version";
import type {
  QuantizedTiltCommand,
  RuntimeExperimentOptions,
  SceneId,
  SessionResult,
  SimulationSnapshot
} from "./types";
import { hashSimulationSnapshot } from "./stableHash";

export interface ReplayEnvironment {
  readonly userAgent: string;
  readonly platform: string;
  readonly viewport: string;
}

export interface ReplayHashCheckpoint {
  readonly step: number;
  readonly hash: string;
}

export interface ReplayMetadata {
  readonly buildCommit: string;
  readonly gameVersion: string;
  readonly rapierVersion: string;
  readonly physicsVersion: string;
  readonly replaySchemaVersion: number;
  readonly levelId: SceneId;
  readonly contentHash: string;
  readonly physicsConfigurationHash: string;
  readonly assetManifestVersion: string;
  readonly seed: number;
  readonly options: RuntimeExperimentOptions;
  readonly environment: ReplayEnvironment;
}

export interface Replay {
  readonly metadata: ReplayMetadata;
  readonly commands: readonly QuantizedTiltCommand[];
  readonly hashes: readonly ReplayHashCheckpoint[];
  readonly result: SessionResult | null;
}

export function createReplayMetadata(
  levelId: SceneId,
  contentHash: string,
  physicsConfigurationHash: string,
  seed: number,
  options: RuntimeExperimentOptions,
  environment: ReplayEnvironment
): ReplayMetadata {
  return {
    buildCommit: BUILD_COMMIT,
    gameVersion: GAME_VERSION,
    rapierVersion: RAPIER_VERSION,
    physicsVersion: PHYSICS_VERSION,
    replaySchemaVersion: REPLAY_SCHEMA_VERSION,
    levelId,
    contentHash,
    physicsConfigurationHash,
    assetManifestVersion: ASSET_MANIFEST_VERSION,
    seed,
    options,
    environment
  };
}

export class ReplayRecorder {
  readonly #commands: QuantizedTiltCommand[] = [];
  readonly #hashes: ReplayHashCheckpoint[] = [];
  readonly #metadata: ReplayMetadata;
  readonly #hashInterval: number;
  #result: SessionResult | null = null;

  public constructor(metadata: ReplayMetadata, hashInterval = 30) {
    this.#metadata = metadata;
    this.#hashInterval = hashInterval;
  }

  public record(command: QuantizedTiltCommand, snapshot: SimulationSnapshot): void {
    this.#commands.push(command);
    if (snapshot.step % this.#hashInterval === 0 || snapshot.result !== null) {
      this.#hashes.push({
        step: snapshot.step,
        hash: hashSimulationSnapshot(snapshot)
      });
    }
    if (snapshot.result !== null) {
      this.#result = snapshot.result;
    }
  }

  public finish(): Replay {
    return {
      metadata: this.#metadata,
      commands: this.#commands,
      hashes: this.#hashes,
      result: this.#result
    };
  }
}

export interface ReplayComparison {
  readonly matches: boolean;
  readonly firstDivergentStep: number | null;
  readonly expectedHash: string | null;
  readonly actualHash: string | null;
}

export function compareReplayHashes(
  expected: readonly ReplayHashCheckpoint[],
  actual: readonly ReplayHashCheckpoint[]
): ReplayComparison {
  const count = Math.max(expected.length, actual.length);
  for (let index = 0; index < count; index += 1) {
    const expectedCheckpoint = expected[index];
    const actualCheckpoint = actual[index];
    if (
      expectedCheckpoint?.step !== actualCheckpoint?.step ||
      expectedCheckpoint?.hash !== actualCheckpoint?.hash
    ) {
      return {
        matches: false,
        firstDivergentStep: expectedCheckpoint?.step ?? actualCheckpoint?.step ?? null,
        expectedHash: expectedCheckpoint?.hash ?? null,
        actualHash: actualCheckpoint?.hash ?? null
      };
    }
  }

  return {
    matches: true,
    firstDivergentStep: null,
    expectedHash: null,
    actualHash: null
  };
}
