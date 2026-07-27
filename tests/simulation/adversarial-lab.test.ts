import { describe, expect, it } from "vitest";
import { loadLevelDefinition } from "../../src/simulation/contentCatalog";
import { TeetertownSimulation } from "../../src/simulation/teetertownSimulation";

describe("adversarial laboratory", () => {
  it("contains the declared mismatch and trips the fragility fixture", async () => {
    const level = await loadLevelDefinition("adversarial-lab");
    expect(
      level.entities.filter((entity) => entity.intentionallyMismatched).map(({ id }) => id)
    ).toEqual(["mismatch-box"]);

    const simulation = await TeetertownSimulation.create("adversarial-lab", {
      inputModel: "two_axis_raw",
      tiltImplementation: "gravity_vector",
      captureAuthority: "raw",
      cameraModel: "perspective_fixed"
    });
    for (let step = 1; step <= 120 && simulation.snapshot().result === null; step += 1) {
      simulation.step();
    }
    expect(simulation.snapshot().result).toEqual({
      kind: "failure",
      step: 46,
      classification: "fragile_threshold_exceeded",
      playerAttributable: true,
      entityId: "fragile-ball"
    });
    expect(simulation.resourceCounts()).toMatchObject({
      bodies: 11,
      colliders: 11,
      joints: 1
    });
    simulation.dispose();
  });
});
