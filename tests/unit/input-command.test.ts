import { describe, expect, it } from "vitest";
import {
  TILT_QUANTIZATION_LEVELS,
  commandTarget,
  createTiltCommand,
  dequantizeAxis,
  quantizeAxis
} from "../../src/simulation/inputCommand";

describe("quantized tilt commands", () => {
  it("clamps and quantizes finite input deterministically", () => {
    expect(quantizeAxis(2)).toBe(TILT_QUANTIZATION_LEVELS);
    expect(quantizeAxis(-2)).toBe(-TILT_QUANTIZATION_LEVELS);
    expect(quantizeAxis(Number.NaN)).toBe(0);
    expect(dequantizeAxis(512)).toBe(0.5);
    expect(commandTarget(createTiltCommand(7, 0.3333, -0.5))).toEqual({
      x: 341 / 1024,
      y: 0,
      z: -0.5
    });
  });

  it("rejects non-integral command steps and quantized axes", () => {
    expect(() => createTiltCommand(0.5, 0, 0)).toThrow();
    expect(() => dequantizeAxis(1.5)).toThrow();
  });
});
