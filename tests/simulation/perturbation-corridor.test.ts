import { describe, expect, it } from "vitest";
import { createTiltCommand } from "../../src/simulation/inputCommand";
import { TeetertownSimulation } from "../../src/simulation/teetertownSimulation";

describe("tutorial robustness corridor", () => {
  it("succeeds across ±5% magnitude and a one-step activation delay", async () => {
    let successes = 0;
    let attempts = 0;
    for (const magnitudeScale of [0.95, 0.975, 1, 1.025, 1.05]) {
      for (const activationDelay of [0, 1]) {
        const simulation = await TeetertownSimulation.create("tutorial-graybox");
        for (let step = 1; step <= 500 && simulation.snapshot().result === null; step += 1) {
          simulation.step(
            createTiltCommand(step, step <= activationDelay ? 0 : -0.55 * magnitudeScale, 0)
          );
        }
        attempts += 1;
        if (simulation.snapshot().result?.kind === "success") {
          successes += 1;
        }
        simulation.dispose();
      }
    }
    expect(successes / attempts).toBeGreaterThanOrEqual(0.9);
    expect({ successes, attempts }).toEqual({ successes: 10, attempts: 10 });
  });
});
