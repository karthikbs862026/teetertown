import { describe, expect, it } from "vitest";
import { createTiltCommand } from "../../src/simulation/inputCommand";
import { MAX_TILT_RADIANS } from "../../src/simulation/math";
import { TiltController } from "../../src/simulation/tiltController";

describe("tilt controller", () => {
  it("converges to a constant target without the prior clamp reversal", () => {
    const controller = new TiltController();
    const observed: number[] = [];
    for (let step = 1; step <= 120; step += 1) {
      observed.push(controller.step(createTiltCommand(step, -0.55, 0)).z);
    }
    const target = (563 / 1024) * MAX_TILT_RADIANS;
    expect(observed.at(-1)).toBeCloseTo(target, 5);
    expect(Math.max(...observed)).toBeLessThanOrEqual(MAX_TILT_RADIANS);
    expect(observed.slice(30).every((value) => value > 0)).toBe(true);
  });
});
