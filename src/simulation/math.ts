import type { Quat, Vec3 } from "./types";

export const FIXED_TIMESTEP_SECONDS = 1 / 60;
export const MAX_TILT_RADIANS = 0.28;
export const GRAVITY_METERS_PER_SECOND = 9.81;

export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export function magnitude(vector: Vec3): number {
  return Math.hypot(vector.x, vector.y, vector.z);
}

export function isFiniteVector(vector: Vec3): boolean {
  return Number.isFinite(vector.x) && Number.isFinite(vector.y) && Number.isFinite(vector.z);
}

export function isFiniteQuaternion(quaternion: Quat): boolean {
  return (
    Number.isFinite(quaternion.x) &&
    Number.isFinite(quaternion.y) &&
    Number.isFinite(quaternion.z) &&
    Number.isFinite(quaternion.w)
  );
}

export function quaternionFromTilt(x: number, z: number): Quat {
  const halfX = x * 0.5;
  const halfZ = z * 0.5;
  const sinX = Math.sin(halfX);
  const cosX = Math.cos(halfX);
  const sinZ = Math.sin(halfZ);
  const cosZ = Math.cos(halfZ);

  return {
    x: sinX * cosZ,
    y: -sinX * sinZ,
    z: cosX * sinZ,
    w: cosX * cosZ
  };
}

export function gravityFromTilt(x: number, z: number): Vec3 {
  const cosX = Math.cos(x);
  const sinX = Math.sin(x);
  const cosZ = Math.cos(z);
  const sinZ = Math.sin(z);

  return {
    x: GRAVITY_METERS_PER_SECOND * sinZ,
    y: -GRAVITY_METERS_PER_SECOND * cosX * cosZ,
    z: -GRAVITY_METERS_PER_SECOND * sinX
  };
}
