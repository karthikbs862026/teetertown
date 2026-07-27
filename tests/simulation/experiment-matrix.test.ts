import { describe, expect, it } from "vitest";
import { createTiltCommand } from "../../src/simulation/inputCommand";
import { hashSimulationSnapshot } from "../../src/simulation/stableHash";
import { TeetertownSimulation } from "../../src/simulation/teetertownSimulation";
import type { RuntimeExperimentOptions, TiltImplementation } from "../../src/simulation/types";

async function runImplementation(tiltImplementation: TiltImplementation): Promise<{
  hash: string;
  result: ReturnType<TeetertownSimulation["snapshot"]>["result"];
  joints: number;
}> {
  const options: RuntimeExperimentOptions = {
    inputModel: "one_axis_raw",
    tiltImplementation,
    captureAuthority: "constrained",
    cameraModel: "orthographic_fixed"
  };
  const simulation = await TeetertownSimulation.create("tutorial-graybox", options);
  for (let step = 1; step <= 300 && simulation.snapshot().result === null; step += 1) {
    simulation.step(createTiltCommand(step, -0.55, 0));
  }
  const snapshot = simulation.snapshot();
  const result = {
    hash: hashSimulationSnapshot(snapshot),
    result: snapshot.result,
    joints: simulation.resourceCounts().joints
  };
  simulation.dispose();
  return result;
}

describe("tilt implementation experiment", () => {
  it("keeps gravity and kinematic implementations observably separate", async () => {
    const gravity = await runImplementation("gravity_vector");
    const kinematic = await runImplementation("kinematic_support");
    expect(gravity).toEqual({
      hash: "c965c01f",
      result: { kind: "success", step: 278 },
      joints: 2
    });
    expect(kinematic).toEqual({
      hash: "35a12c8c",
      result: {
        kind: "failure",
        step: 229,
        classification: "object_out_of_bounds",
        playerAttributable: true,
        entityId: "apple"
      },
      joints: 0
    });
  });
});
