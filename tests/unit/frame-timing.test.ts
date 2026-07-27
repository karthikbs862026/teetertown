import { describe, expect, it } from "vitest";
import { animationFrameDeltaSeconds } from "../../src/app/frameTiming";

describe("animation frame timing", () => {
  it("neutralizes the first frame and invalid timestamp samples", () => {
    expect(animationFrameDeltaSeconds(null, 10)).toBe(0);
    expect(animationFrameDeltaSeconds(20, 10)).toBe(0);
    expect(animationFrameDeltaSeconds(Number.NaN, 10)).toBe(0);
    expect(animationFrameDeltaSeconds(10, Number.POSITIVE_INFINITY)).toBe(0);
  });

  it("converts a valid monotonic timestamp delta to seconds", () => {
    expect(animationFrameDeltaSeconds(10, 26.667)).toBeCloseTo(0.016667, 6);
  });
});
