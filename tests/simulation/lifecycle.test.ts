import { describe, expect, it } from "vitest";
import { TeetertownSimulation } from "../../src/simulation/teetertownSimulation";

describe("simulation lifecycle", () => {
  it("holds exact world topology across 50 create/play/dispose cycles", async () => {
    const signatures = new Set<string>();
    for (let cycle = 0; cycle < 50; cycle += 1) {
      const simulation = await TeetertownSimulation.create("tutorial-graybox");
      for (let step = 0; step < 5; step += 1) {
        simulation.step();
      }
      const counts = simulation.resourceCounts();
      signatures.add(`${counts.bodies}/${counts.colliders}/${counts.joints}`);
      simulation.dispose();
    }
    expect([...signatures]).toEqual(["11/11/2"]);
  });
});
