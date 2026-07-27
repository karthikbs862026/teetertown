import type { DebugContact, Vec3 } from "./types";

function compareText(left: string, right: string): number {
  if (left < right) {
    return -1;
  }
  if (left > right) {
    return 1;
  }
  return 0;
}

function negate(vector: Vec3): Vec3 {
  return { x: -vector.x, y: -vector.y, z: -vector.z };
}

export function canonicalContact(
  entityA: string,
  entityB: string,
  direction: Vec3,
  impulse: number
): DebugContact {
  if (compareText(entityA, entityB) <= 0) {
    return { entityA, entityB, direction, impulse };
  }
  return {
    entityA: entityB,
    entityB: entityA,
    direction: negate(direction),
    impulse
  };
}

export function compareContacts(left: DebugContact, right: DebugContact): number {
  const firstEntity = compareText(left.entityA, right.entityA);
  if (firstEntity !== 0) {
    return firstEntity;
  }
  const secondEntity = compareText(left.entityB, right.entityB);
  if (secondEntity !== 0) {
    return secondEntity;
  }
  if (left.impulse !== right.impulse) {
    return left.impulse - right.impulse;
  }
  if (left.direction.x !== right.direction.x) {
    return left.direction.x - right.direction.x;
  }
  if (left.direction.y !== right.direction.y) {
    return left.direction.y - right.direction.y;
  }
  return left.direction.z - right.direction.z;
}
