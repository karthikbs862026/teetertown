import RAPIER from "@dimforge/rapier3d-compat";
import { FIXED_TIMESTEP_SECONDS } from "./math";
import { hashText } from "./stableHash";

export const RAPIER_BOOTSTRAP_EXPECTED_HASH = "74e1d58f";

let initialization: Promise<void> | undefined;

function hasInitializer(value: unknown): value is { init: () => Promise<void> } {
  return (
    typeof value === "object" &&
    value !== null &&
    "init" in value &&
    typeof value.init === "function"
  );
}

export function initializeRapier(): Promise<void> {
  initialization ??= hasInitializer(RAPIER) ? RAPIER.init() : Promise.resolve();
  return initialization;
}

export async function runRapierBootstrapSelfTest(): Promise<string> {
  await initializeRapier();
  const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
  world.timestep = FIXED_TIMESTEP_SECONDS;

  const floor = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0, -0.25, 0));
  world.createCollider(RAPIER.ColliderDesc.cuboid(2, 0.25, 2).setFriction(0.6), floor);
  const ball = world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(0.125, 2.25, -0.25)
      .setLinvel(0.35, 0, 0.1)
      .setCcdEnabled(true)
  );
  world.createCollider(
    RAPIER.ColliderDesc.ball(0.25).setDensity(1).setFriction(0.5).setRestitution(0.15),
    ball
  );

  for (let step = 0; step < 180; step += 1) {
    world.step();
  }
  const position = ball.translation();
  const velocity = ball.linvel();
  const hash = hashText(
    [position.x, position.y, position.z, velocity.x, velocity.y, velocity.z]
      .map((value) => Math.round(value * 100_000))
      .join("|")
  );
  world.free();
  return hash;
}

export async function assertRapierBootstrap(): Promise<string> {
  const actual = await runRapierBootstrapSelfTest();
  if (actual !== RAPIER_BOOTSTRAP_EXPECTED_HASH) {
    throw new Error(
      `Rapier bootstrap hash mismatch: expected ${RAPIER_BOOTSTRAP_EXPECTED_HASH}, got ${actual}`
    );
  }
  return actual;
}
