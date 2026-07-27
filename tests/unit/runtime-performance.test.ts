import { describe, expect, it } from "vitest";
import { RuntimePerformanceSampler, summarizeSamples } from "../../src/app/runtimePerformance";

describe("runtime performance summaries", () => {
  it("reports nearest-rank p50, p95, p99, and maximum", () => {
    const values = Array.from({ length: 100 }, (_, index) => index + 1);
    expect(summarizeSamples(values)).toEqual({
      count: 100,
      p50: 50,
      p95: 95,
      p99: 99,
      maximum: 100
    });
  });

  it("returns zeroed finite values for an empty sample", () => {
    expect(summarizeSamples([])).toEqual({
      count: 0,
      p50: 0,
      p95: 0,
      p99: 0,
      maximum: 0
    });
  });

  it("caps runtime frame and physics samples instead of growing with session length", () => {
    const sampler = new RuntimePerformanceSampler();
    for (let sample = 1; sample <= 3_000; sample += 1) {
      sampler.recordFrame(sample);
      sampler.recordPhysicsStep(sample / 10);
    }
    sampler.markFirstMeaningfulInteraction(321);
    const summary = sampler.summary();
    expect(summary.frame.count).toBe(2_048);
    expect(summary.physics.count).toBe(2_048);
    expect(summary.firstMeaningfulInteractionMilliseconds).toBe(321);
    sampler.dispose();
  });
});
