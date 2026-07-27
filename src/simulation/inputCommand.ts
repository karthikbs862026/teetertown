import { clamp } from "./math";
import type { QuantizedTiltCommand, Vec3 } from "./types";

export const TILT_QUANTIZATION_LEVELS = 1024;

export function quantizeAxis(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.round(clamp(value, -1, 1) * TILT_QUANTIZATION_LEVELS);
}

export function dequantizeAxis(value: number): number {
  if (!Number.isInteger(value)) {
    throw new Error("Quantized tilt must be an integer.");
  }
  return clamp(value / TILT_QUANTIZATION_LEVELS, -1, 1);
}

export function createTiltCommand(step: number, x: number, z: number): QuantizedTiltCommand {
  if (!Number.isInteger(step) || step < 0) {
    throw new Error("Command step must be a non-negative integer.");
  }

  return {
    kind: "tilt",
    step,
    x: quantizeAxis(x),
    z: quantizeAxis(z)
  };
}

export function commandTarget(command: QuantizedTiltCommand): Vec3 {
  return {
    x: dequantizeAxis(command.x),
    y: 0,
    z: dequantizeAxis(command.z)
  };
}
