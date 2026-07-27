import { describe, expect, it } from "vitest";
import { FixedStepClock } from "../../src/simulation/fixedStepClock";

function stepsForCadence(framesPerSecond: number, seconds: number): number {
  const clock = new FixedStepClock();
  let steps = 0;
  for (let frame = 0; frame < framesPerSecond * seconds; frame += 1) {
    clock.advance(1 / framesPerSecond, () => {
      steps += 1;
    });
  }
  return steps;
}

describe("fixed-step clock", () => {
  it("produces the same simulation count at 30, 60, and 120 Hz", () => {
    expect(stepsForCadence(30, 2)).toBe(120);
    expect(stepsForCadence(60, 2)).toBe(120);
    expect(stepsForCadence(120, 2)).toBe(120);
  });

  it("clamps a long render gap to five catch-up steps", () => {
    const clock = new FixedStepClock();
    let steps = 0;
    const result = clock.advance(1, () => {
      steps += 1;
    });
    expect(steps).toBe(5);
    expect(result.clampedSeconds).toBeGreaterThan(0.9);
  });

  it("does not advance while paused", () => {
    const clock = new FixedStepClock();
    clock.pause();
    expect(clock.advance(1, () => undefined).steps).toBe(0);
  });
});
