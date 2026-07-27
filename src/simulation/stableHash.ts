import type { SimulationSnapshot } from "./types";

const HASH_QUANTIZATION = 10_000;
const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

function quantize(value: number): number {
  return Math.round(value * HASH_QUANTIZATION);
}

function append(hash: number, value: string): number {
  let result = hash;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, FNV_PRIME);
  }
  return result >>> 0;
}

export function hashText(value: string): string {
  return append(FNV_OFFSET, value).toString(16).padStart(8, "0");
}

export function hashSimulationSnapshot(snapshot: SimulationSnapshot): string {
  let hash = FNV_OFFSET;
  hash = append(hash, `${snapshot.step}|${snapshot.phase}|`);
  hash = append(
    hash,
    `${quantize(snapshot.tilt.x)},${quantize(snapshot.tilt.z)},${quantize(
      snapshot.tilt.velocityX
    )},${quantize(snapshot.tilt.velocityZ)}|`
  );
  hash = append(hash, `${snapshot.goalHoldSteps}|${quantize(snapshot.fragileImpulseWindow)}|`);

  for (const body of [...snapshot.bodies].sort((left, right) => left.id.localeCompare(right.id))) {
    hash = append(
      hash,
      [
        body.id,
        body.authority,
        quantize(body.translation.x),
        quantize(body.translation.y),
        quantize(body.translation.z),
        quantize(body.rotation.x),
        quantize(body.rotation.y),
        quantize(body.rotation.z),
        quantize(body.rotation.w),
        quantize(body.linearVelocity.x),
        quantize(body.linearVelocity.y),
        quantize(body.linearVelocity.z),
        quantize(body.angularVelocity.x),
        quantize(body.angularVelocity.y),
        quantize(body.angularVelocity.z),
        body.sleeping ? 1 : 0
      ].join(",")
    );
    hash = append(hash, "|");
  }

  if (snapshot.result !== null) {
    hash = append(hash, snapshot.result.kind);
    if (snapshot.result.kind === "failure") {
      hash = append(
        hash,
        `:${snapshot.result.classification}:${snapshot.result.playerAttributable ? 1 : 0}:${
          snapshot.result.entityId ?? ""
        }`
      );
    }
  }

  return hash.toString(16).padStart(8, "0");
}
