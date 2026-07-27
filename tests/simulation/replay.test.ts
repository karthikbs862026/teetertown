import { describe, expect, it } from "vitest";
import { createTiltCommand } from "../../src/simulation/inputCommand";
import {
  ReplayRecorder,
  compareReplayHashes,
  createReplayMetadata,
  type Replay
} from "../../src/simulation/replay";
import {
  PHYSICS_CONFIGURATION_HASH,
  TeetertownSimulation
} from "../../src/simulation/teetertownSimulation";
import type { CaptureAuthority, RuntimeExperimentOptions } from "../../src/simulation/types";
import {
  PHYSICS_VERSION,
  RAPIER_RUNTIME_VARIANT,
  REPLAY_SCHEMA_VERSION
} from "../../src/simulation/version";

const BASE_OPTIONS: RuntimeExperimentOptions = {
  inputModel: "one_axis_raw",
  tiltImplementation: "gravity_vector",
  captureAuthority: "constrained",
  cameraModel: "orthographic_fixed"
};

async function recordGolden(
  captureAuthority: CaptureAuthority = "constrained",
  perturbStep: number | null = null
): Promise<Replay> {
  const options = { ...BASE_OPTIONS, captureAuthority };
  const simulation = await TeetertownSimulation.create("tutorial-graybox", options);
  const recorder = new ReplayRecorder(
    createReplayMetadata(
      simulation.level.id,
      simulation.level.contentHash,
      PHYSICS_CONFIGURATION_HASH,
      1337,
      options,
      { userAgent: "vitest", platform: "node", viewport: "headless" }
    )
  );
  for (let step = 1; step <= 500 && simulation.snapshot().result === null; step += 1) {
    const x = step === perturbStep ? -0.2 : -0.55;
    const command = createTiltCommand(step, x, 0);
    const snapshot = simulation.step(command);
    recorder.record(command, snapshot);
  }
  const replay = recorder.finish();
  simulation.dispose();
  return replay;
}

describe("replay contract", () => {
  it("records the physics runtime variant in replay identity", async () => {
    const replay = await recordGolden();
    expect(replay.metadata.rapierRuntimeVariant).toBe(RAPIER_RUNTIME_VARIANT);
    expect(replay.metadata.replaySchemaVersion).toBe(REPLAY_SCHEMA_VERSION);
    expect(replay.metadata.physicsVersion).toBe("phase1-physics-2");
    expect(PHYSICS_VERSION).toBe("phase1-physics-2");
    expect(replay.metadata.physicsConfigurationHash).toBe("53cfb827");
  });

  it("repeats every periodic and final hash", async () => {
    const first = await recordGolden();
    const second = await recordGolden();
    expect(first.result).toEqual({ kind: "success", step: 278 });
    expect(first.hashes.at(-1)).toEqual({ step: 278, hash: "c965c01f" });
    expect(compareReplayHashes(first.hashes, second.hashes)).toEqual({
      matches: true,
      firstDivergentStep: null,
      expectedHash: null,
      actualHash: null
    });
  });

  it("detects a one-command perturbation", async () => {
    const baseline = await recordGolden();
    const perturbed = await recordGolden("constrained", 80);
    const comparison = compareReplayHashes(baseline.hashes, perturbed.hashes);
    expect(comparison.matches).toBe(false);
    expect(comparison.firstDivergentStep).not.toBeNull();
  });

  it("records raw capture as a visible overshoot failure", async () => {
    const raw = await recordGolden("raw");
    expect(raw.result).toEqual({
      kind: "failure",
      step: 264,
      classification: "object_out_of_bounds",
      playerAttributable: true,
      entityId: "apple"
    });
    expect(raw.hashes.at(-1)).toEqual({ step: 264, hash: "e18433eb" });
  });
});
