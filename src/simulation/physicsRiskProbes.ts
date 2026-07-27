import RAPIER, { type RigidBody } from "@dimforge/rapier3d-compat";
import { compareContacts } from "./contactOrdering";
import { createTiltCommand } from "./inputCommand";
import { FIXED_TIMESTEP_SECONDS, isFiniteQuaternion, isFiniteVector } from "./math";
import { initializeRapier } from "./rapierBootstrap";
import { hashSimulationSnapshot, hashText } from "./stableHash";
import { TeetertownSimulation } from "./teetertownSimulation";
import type { DebugContact } from "./types";

const PROBE_VERSION = "phase1-risk-probes-2";
const JOINT_LIMIT_RADIANS = 0.36;
const JOINT_REVERSAL_STEPS = 480;

export interface CcdProbeResult {
  readonly discretePositionAfterOneStep: number;
  readonly ccdPositionAfterOneStep: number;
  readonly ccdPositionAfterTwoSteps: number;
  readonly ccdVelocityAfterTwoSteps: number;
  readonly summaryHash: string;
}

export interface JointReversalProbeResult {
  readonly minimumAngle: number;
  readonly maximumAngle: number;
  readonly maximumAngularSpeed: number;
  readonly finalAngle: number;
  readonly finalAngularSpeed: number;
  readonly finite: boolean;
  readonly summaryHash: string;
}

export interface ContactOrderingProbeResult {
  readonly contactCount: number;
  readonly stepsWithContacts: number;
  readonly pileAtoBObserved: boolean;
  readonly pileBtoCObserved: boolean;
  readonly summaryHash: string;
}

export interface SleepingWakeProbeResult {
  readonly sleepingBeforeCommand: boolean;
  readonly sleepingAfterCommand: boolean;
  readonly finalStateHash: string;
  readonly summaryHash: string;
}

export interface PhysicsRiskProbeResult {
  readonly probeVersion: typeof PROBE_VERSION;
  readonly contactOrdering: ContactOrderingProbeResult;
  readonly sleepingWake: SleepingWakeProbeResult;
  readonly ccd: CcdProbeResult;
  readonly jointReversal: JointReversalProbeResult;
}

function rounded(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function revoluteAngle(body: RigidBody): number {
  const rotation = body.rotation();
  let angle = 2 * Math.atan2(rotation.z, rotation.w);
  if (angle > Math.PI) {
    angle -= Math.PI * 2;
  } else if (angle < -Math.PI) {
    angle += Math.PI * 2;
  }
  return angle;
}

function contactKey(contact: DebugContact): string {
  return [
    contact.entityA,
    contact.entityB,
    rounded(contact.impulse),
    rounded(contact.direction.x),
    rounded(contact.direction.y),
    rounded(contact.direction.z)
  ].join(":");
}

export async function runContactOrderingProbe(): Promise<ContactOrderingProbeResult> {
  const simulation = await TeetertownSimulation.create("adversarial-lab", {
    inputModel: "two_axis_raw",
    tiltImplementation: "gravity_vector",
    captureAuthority: "raw",
    cameraModel: "perspective_fixed"
  });
  try {
    const trace: string[] = [];
    let contactCount = 0;
    let stepsWithContacts = 0;
    let pileAtoBObserved = false;
    let pileBtoCObserved = false;
    for (let step = 1; step <= 46; step += 1) {
      const snapshot = simulation.step();
      const sorted = [...snapshot.debugContacts].sort(compareContacts);
      const contacts = snapshot.debugContacts.map(contactKey);
      const sortedContacts = sorted.map(contactKey);
      if (
        contacts.length !== sortedContacts.length ||
        contacts.some((contact, index) => contact !== sortedContacts[index])
      ) {
        throw new Error("Adversarial contacts were not emitted in canonical order.");
      }
      contactCount += contacts.length;
      stepsWithContacts += contacts.length > 0 ? 1 : 0;
      pileAtoBObserved ||= contacts.some((contact) => contact.startsWith("pile-a:pile-b:"));
      pileBtoCObserved ||= contacts.some((contact) => contact.startsWith("pile-b:pile-c:"));
      trace.push(`${step}|${contacts.join(",")}`);
    }
    const values = {
      contactCount,
      stepsWithContacts,
      pileAtoBObserved,
      pileBtoCObserved
    };
    return {
      ...values,
      summaryHash: hashText(`${JSON.stringify(values)}\n${trace.join("\n")}`)
    };
  } finally {
    simulation.dispose();
  }
}

export async function runSleepingWakeProbe(): Promise<SleepingWakeProbeResult> {
  const simulation = await TeetertownSimulation.create("tutorial-graybox");
  try {
    for (let step = 1; step <= 121; step += 1) {
      simulation.step(createTiltCommand(step, 0, 0));
    }
    const sleepingBeforeCommand =
      simulation.snapshot().bodies.find(({ id }) => id === "bottle")?.sleeping === true;
    let snapshot = simulation.step(createTiltCommand(122, 0.55, 0));
    const sleepingAfterCommand =
      snapshot.bodies.find(({ id }) => id === "bottle")?.sleeping === true;
    for (let step = 123; step <= 150; step += 1) {
      snapshot = simulation.step(createTiltCommand(step, 0.55, 0));
    }
    const values = {
      sleepingBeforeCommand,
      sleepingAfterCommand,
      finalStateHash: hashSimulationSnapshot(snapshot)
    };
    return {
      ...values,
      summaryHash: hashText(JSON.stringify(values))
    };
  } finally {
    simulation.dispose();
  }
}

function runCcdVariant(ccdEnabled: boolean): readonly [number, number, number] {
  const world = new RAPIER.World({ x: 0, y: 0, z: 0 });
  world.timestep = FIXED_TIMESTEP_SECONDS;
  world.numSolverIterations = 8;
  try {
    const wall = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
    world.createCollider(RAPIER.ColliderDesc.cuboid(0.01, 1, 1), wall);
    const projectile = world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(-0.6, 0, 0)
        .setLinvel(60, 0, 0)
        .setCanSleep(false)
        .setCcdEnabled(ccdEnabled)
    );
    world.createCollider(
      RAPIER.ColliderDesc.ball(0.05).setDensity(1).setFriction(0).setRestitution(0),
      projectile
    );
    world.step();
    const positionAfterOneStep = projectile.translation().x;
    world.step();
    return [positionAfterOneStep, projectile.translation().x, projectile.linvel().x];
  } finally {
    world.free();
  }
}

export async function runCcdBarrierProbe(): Promise<CcdProbeResult> {
  await initializeRapier();
  const [discretePositionAfterOneStep] = runCcdVariant(false);
  const [ccdPositionAfterOneStep, ccdPositionAfterTwoSteps, ccdVelocityAfterTwoSteps] =
    runCcdVariant(true);
  const values = {
    discretePositionAfterOneStep: rounded(discretePositionAfterOneStep),
    ccdPositionAfterOneStep: rounded(ccdPositionAfterOneStep),
    ccdPositionAfterTwoSteps: rounded(ccdPositionAfterTwoSteps),
    ccdVelocityAfterTwoSteps: rounded(ccdVelocityAfterTwoSteps)
  };
  return {
    ...values,
    summaryHash: hashText(JSON.stringify(values))
  };
}

export async function runJointReversalProbe(): Promise<JointReversalProbeResult> {
  await initializeRapier();
  const world = new RAPIER.World({ x: 0, y: 0, z: 0 });
  world.timestep = FIXED_TIMESTEP_SECONDS;
  world.numSolverIterations = 8;
  try {
    const anchor = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
    const platform = world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic().setAngularDamping(0.4).setCanSleep(false)
    );
    world.createCollider(
      RAPIER.ColliderDesc.cuboid(1.6, 0.1, 0.45).setDensity(0.7).setFriction(0.72),
      platform
    );
    const descriptor = RAPIER.JointData.revolute(
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 1 }
    );
    descriptor.limitsEnabled = true;
    descriptor.limits = [-JOINT_LIMIT_RADIANS, JOINT_LIMIT_RADIANS];
    const createdJoint = world.createImpulseJoint(descriptor, anchor, platform, true);
    if (!(createdJoint instanceof RAPIER.RevoluteImpulseJoint)) {
      throw new Error("Joint reversal probe did not create a revolute joint.");
    }

    let minimumAngle = Number.POSITIVE_INFINITY;
    let maximumAngle = Number.NEGATIVE_INFINITY;
    let maximumAngularSpeed = 0;
    for (let step = 1; step <= JOINT_REVERSAL_STEPS; step += 1) {
      const target = Math.floor((step - 1) / 30) % 2 === 0 ? 0.32 : -0.32;
      createdJoint.configureMotorPosition(target, 18, 4);
      world.step();
      const angle = revoluteAngle(platform);
      minimumAngle = Math.min(minimumAngle, angle);
      maximumAngle = Math.max(maximumAngle, angle);
      maximumAngularSpeed = Math.max(maximumAngularSpeed, Math.abs(platform.angvel().z));
    }

    const finalAngle = revoluteAngle(platform);
    const finalAngularSpeed = platform.angvel().z;
    const values = {
      minimumAngle: rounded(minimumAngle),
      maximumAngle: rounded(maximumAngle),
      maximumAngularSpeed: rounded(maximumAngularSpeed),
      finalAngle: rounded(finalAngle),
      finalAngularSpeed: rounded(finalAngularSpeed),
      finite:
        isFiniteVector(platform.translation()) &&
        isFiniteQuaternion(platform.rotation()) &&
        isFiniteVector(platform.linvel()) &&
        isFiniteVector(platform.angvel())
    };
    return {
      ...values,
      summaryHash: hashText(JSON.stringify(values))
    };
  } finally {
    world.free();
  }
}

export async function runPhysicsRiskProbes(): Promise<PhysicsRiskProbeResult> {
  const [contactOrdering, sleepingWake, ccd, jointReversal] = await Promise.all([
    runContactOrderingProbe(),
    runSleepingWakeProbe(),
    runCcdBarrierProbe(),
    runJointReversalProbe()
  ]);
  return {
    probeVersion: PROBE_VERSION,
    contactOrdering,
    sleepingWake,
    ccd,
    jointReversal
  };
}
