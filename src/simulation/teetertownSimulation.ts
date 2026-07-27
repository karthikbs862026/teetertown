import RAPIER, {
  ActiveEvents,
  type ColliderDesc,
  type RevoluteImpulseJoint,
  type RigidBody,
  type RigidBodyDesc
} from "@dimforge/rapier3d-compat";
import {
  materialById,
  type BodyDefinition,
  type ColliderDefinition,
  type EntityDefinition,
  type LevelDefinition,
  type MaterialLibrary
} from "./content";
import { canonicalContact, compareContacts } from "./contactOrdering";
import { loadLevelDefinition, MATERIAL_LIBRARY } from "./contentCatalog";
import { commandTarget, createTiltCommand } from "./inputCommand";
import {
  FIXED_TIMESTEP_SECONDS,
  gravityFromTilt,
  isFiniteQuaternion,
  isFiniteVector,
  magnitude,
  quaternionFromTilt
} from "./math";
import { initializeRapier } from "./rapierBootstrap";
import { hashText } from "./stableHash";
import { TiltController } from "./tiltController";
import type {
  BodySnapshot,
  DebugContact,
  QuantizedTiltCommand,
  ResourceCounts,
  RuntimeExperimentOptions,
  SceneId,
  SessionFailure,
  SessionPhase,
  SessionResult,
  SimulationSnapshot,
  TiltState,
  Vec3
} from "./types";

const SPEED_RUNAWAY_LIMIT = 80;
const SOFT_LOCK_STEPS = 600;
const FELT_ASSIST_MAX_SPEED = 0.85;
const ZERO_TILT: TiltState = {
  x: 0,
  z: 0,
  velocityX: 0,
  velocityZ: 0,
  accelerationX: 0,
  accelerationZ: 0
};

export const DEFAULT_EXPERIMENT_OPTIONS: RuntimeExperimentOptions = {
  inputModel: "one_axis_raw",
  tiltImplementation: "gravity_vector",
  captureAuthority: "constrained",
  cameraModel: "orthographic_fixed"
};

export const PHYSICS_CONFIGURATION_HASH = hashText(
  JSON.stringify({
    fixedTimestep: FIXED_TIMESTEP_SECONDS,
    maximumCatchupSteps: 5,
    solverIterations: 8,
    speedRunawayLimit: SPEED_RUNAWAY_LIMIT,
    softLockSteps: SOFT_LOCK_STEPS,
    commandQuantization: 1024,
    sleepingWakePolicy: "quantized_command_change"
  })
);

function bodyDescriptor(definition: BodyDefinition, useKinematicPlatform: boolean): RigidBodyDesc {
  let descriptor: RigidBodyDesc;
  if (useKinematicPlatform || definition.kind === "kinematic") {
    descriptor = RAPIER.RigidBodyDesc.kinematicPositionBased();
  } else if (definition.kind === "dynamic") {
    descriptor = RAPIER.RigidBodyDesc.dynamic();
  } else {
    descriptor = RAPIER.RigidBodyDesc.fixed();
  }

  return descriptor
    .setTranslation(definition.translation.x, definition.translation.y, definition.translation.z)
    .setRotation(definition.rotation)
    .setLinvel(
      definition.linearVelocity.x,
      definition.linearVelocity.y,
      definition.linearVelocity.z
    )
    .setAngvel(definition.angularVelocity)
    .setLinearDamping(definition.linearDamping)
    .setAngularDamping(definition.angularDamping)
    .setCanSleep(definition.canSleep)
    .setCcdEnabled(definition.ccd);
}

function colliderDescriptor(
  definition: ColliderDefinition,
  materials: MaterialLibrary,
  forceSensor: boolean
): ColliderDesc {
  let descriptor: ColliderDesc;
  if (definition.shape === "ball") {
    descriptor = RAPIER.ColliderDesc.ball(definition.radius ?? 0);
  } else if (definition.shape === "cylinder") {
    descriptor = RAPIER.ColliderDesc.cylinder(definition.halfHeight ?? 0, definition.radius ?? 0);
  } else {
    const halfExtents = definition.halfExtents ?? { x: 0, y: 0, z: 0 };
    descriptor = RAPIER.ColliderDesc.cuboid(halfExtents.x, halfExtents.y, halfExtents.z);
  }
  const material = materialById(materials, definition.material);
  return descriptor
    .setDensity(material.density)
    .setFriction(material.friction)
    .setRestitution(material.restitution)
    .setSensor(definition.sensor || forceSensor)
    .setActiveEvents(ActiveEvents.CONTACT_FORCE_EVENTS)
    .setContactForceEventThreshold(0);
}

function inside(point: Vec3, center: Vec3, halfExtents: Vec3): boolean {
  return (
    Math.abs(point.x - center.x) <= halfExtents.x &&
    Math.abs(point.y - center.y) <= halfExtents.y &&
    Math.abs(point.z - center.z) <= halfExtents.z
  );
}

export class TeetertownSimulation {
  readonly #level: LevelDefinition;
  readonly #options: RuntimeExperimentOptions;
  readonly #world: RAPIER.World;
  readonly #eventQueue: RAPIER.EventQueue;
  readonly #tiltController = new TiltController();
  readonly #bodyById = new Map<string, RigidBody>();
  readonly #entityByCollider = new Map<number, string>();
  readonly #entityById = new Map<string, EntityDefinition>();
  readonly #platformJoints: RevoluteImpulseJoint[] = [];
  readonly #fragileImpulses: number[] = [];
  readonly #debugContacts: DebugContact[] = [];
  #step = 0;
  #phase: SessionPhase = "playing";
  #result: SessionResult | null = null;
  #tilt: TiltState = ZERO_TILT;
  #goalHoldSteps = 0;
  #stillSteps = 0;
  #lastCommandX = 0;
  #lastCommandZ = 0;
  #disposed = false;

  private constructor(
    level: LevelDefinition,
    options: RuntimeExperimentOptions,
    world: RAPIER.World
  ) {
    this.#level = level;
    this.#options = options;
    this.#world = world;
    this.#world.timestep = FIXED_TIMESTEP_SECONDS;
    this.#world.numSolverIterations = 8;
    this.#eventQueue = new RAPIER.EventQueue(true);
    this.#createEntities();
    this.#createJoints();
  }

  public static async create(
    sceneId: SceneId,
    options: RuntimeExperimentOptions = DEFAULT_EXPERIMENT_OPTIONS
  ): Promise<TeetertownSimulation> {
    await initializeRapier();
    const gravity =
      options.tiltImplementation === "gravity_vector"
        ? gravityFromTilt(0, 0)
        : { x: 0, y: -9.81, z: 0 };
    const level = await loadLevelDefinition(sceneId);
    return new TeetertownSimulation(level, options, new RAPIER.World(gravity));
  }

  public get level(): LevelDefinition {
    return this.#level;
  }

  public get options(): RuntimeExperimentOptions {
    return this.#options;
  }

  public step(
    command: QuantizedTiltCommand = createTiltCommand(this.#step + 1, 0, 0)
  ): SimulationSnapshot {
    this.#assertUsable();
    if (this.#result !== null || this.#phase === "paused") {
      return this.snapshot();
    }
    this.#step += 1;
    const normalizedCommand =
      command.step === this.#step
        ? command
        : createTiltCommand(this.#step, commandTarget(command).x, commandTarget(command).z);
    this.#wakeForCommandChange(normalizedCommand);
    this.#tilt = this.#tiltController.step(normalizedCommand);
    this.#applyTilt();
    this.#world.step(this.#eventQueue);
    this.#collectContactForces();
    this.#applyFeltAssist();
    this.#evaluateState();
    return this.snapshot();
  }

  public pause(): void {
    this.#assertUsable();
    if (this.#result === null) {
      this.#phase = "paused";
    }
  }

  public resume(): void {
    this.#assertUsable();
    if (this.#result === null) {
      this.#phase = "playing";
    }
  }

  public snapshot(): SimulationSnapshot {
    this.#assertUsable();
    const bodies: BodySnapshot[] = [];
    for (const entity of this.#level.entities) {
      const body = this.#bodyById.get(entity.id);
      if (body === undefined) {
        continue;
      }
      const translation = body.translation();
      const rotation = body.rotation();
      const linearVelocity = body.linvel();
      const angularVelocity = body.angvel();
      bodies.push({
        id: entity.id,
        authority: entity.authority,
        translation: { x: translation.x, y: translation.y, z: translation.z },
        rotation: { x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w },
        linearVelocity: {
          x: linearVelocity.x,
          y: linearVelocity.y,
          z: linearVelocity.z
        },
        angularVelocity: {
          x: angularVelocity.x,
          y: angularVelocity.y,
          z: angularVelocity.z
        },
        sleeping: body.isSleeping()
      });
    }
    return {
      step: this.#step,
      phase: this.#phase,
      tilt: this.#tilt,
      bodies,
      result: this.#result,
      goalHoldSteps: this.#goalHoldSteps,
      fragileImpulseWindow: this.#fragileImpulses.reduce((sum, value) => sum + value, 0),
      debugContacts: this.#debugContacts
    };
  }

  public resourceCounts(): ResourceCounts {
    this.#assertUsable();
    let awakeBodies = 0;
    this.#world.bodies.forEach((body) => {
      if (body.isDynamic() && !body.isSleeping()) {
        awakeBodies += 1;
      }
    });
    return {
      bodies: this.#world.bodies.len(),
      colliders: this.#world.colliders.len(),
      joints: this.#world.impulseJoints.len(),
      awakeBodies,
      geometries: 0,
      materials: 0,
      textures: 0,
      renderTargets: 0,
      listeners: 0,
      timers: 0,
      workers: 0,
      audioNodes: 0,
      drawCalls: 0,
      triangles: 0
    };
  }

  public dispose(): void {
    if (this.#disposed) {
      return;
    }
    this.#eventQueue.free();
    this.#world.free();
    this.#bodyById.clear();
    this.#entityByCollider.clear();
    this.#entityById.clear();
    this.#disposed = true;
  }

  #createEntities(): void {
    for (const entity of this.#level.entities) {
      const useKinematicPlatform =
        this.#options.tiltImplementation === "kinematic_support" &&
        entity.role === "hinged_platform";
      const body = this.#world.createRigidBody(bodyDescriptor(entity.body, useKinematicPlatform));
      if (entity.role === "hinged_platform" && !useKinematicPlatform) {
        body.setGravityScale(0, false);
      }
      this.#bodyById.set(entity.id, body);
      this.#entityById.set(entity.id, entity);
      if (entity.collider !== undefined) {
        const forceSensor =
          this.#options.captureAuthority === "raw" && entity.authority === "assist";
        const collider = this.#world.createCollider(
          colliderDescriptor(entity.collider, MATERIAL_LIBRARY, forceSensor),
          body
        );
        this.#entityByCollider.set(collider.handle, entity.id);
      }
    }
  }

  #createJoints(): void {
    for (const joint of this.#level.joints) {
      if (
        this.#options.tiltImplementation === "kinematic_support" &&
        this.#entityById.get(joint.bodyB)?.role === "hinged_platform"
      ) {
        continue;
      }
      const bodyA = this.#bodyById.get(joint.bodyA);
      const bodyB = this.#bodyById.get(joint.bodyB);
      if (bodyA === undefined || bodyB === undefined) {
        this.#fail("content_or_script_error", false);
        return;
      }
      const data = RAPIER.JointData.revolute(joint.anchorA, joint.anchorB, joint.axis);
      data.limitsEnabled = true;
      data.limits = [...joint.limits];
      const createdJoint = this.#world.createImpulseJoint(data, bodyA, bodyB, true);
      if (
        this.#entityById.get(joint.bodyB)?.role === "hinged_platform" &&
        createdJoint instanceof RAPIER.RevoluteImpulseJoint
      ) {
        this.#platformJoints.push(createdJoint);
      }
    }
  }

  #applyTilt(): void {
    if (this.#options.tiltImplementation === "gravity_vector") {
      this.#world.gravity = gravityFromTilt(this.#tilt.x, this.#tilt.z);
      for (const joint of this.#platformJoints) {
        joint.configureMotorPosition(-this.#tilt.z, 18, 4);
      }
      return;
    }
    const rotation = quaternionFromTilt(this.#tilt.x, this.#tilt.z);
    for (const entity of this.#level.entities) {
      if (entity.role === "hinged_platform") {
        this.#bodyById.get(entity.id)?.setNextKinematicRotation(rotation);
      }
    }
  }

  #collectContactForces(): void {
    const fragile = this.#level.fragility;
    this.#debugContacts.length = 0;
    this.#eventQueue.drainContactForceEvents((event) => {
      const first = this.#entityByCollider.get(event.collider1());
      const second = this.#entityByCollider.get(event.collider2());
      const impulse = event.totalForceMagnitude() * FIXED_TIMESTEP_SECONDS;
      if (first !== undefined && second !== undefined) {
        const direction = event.maxForceDirection();
        this.#debugContacts.push(
          canonicalContact(
            first,
            second,
            { x: direction.x, y: direction.y, z: direction.z },
            impulse
          )
        );
      }
    });
    this.#debugContacts.sort(compareContacts);
    if (fragile === null) {
      this.#debugContacts.length = Math.min(this.#debugContacts.length, 16);
      return;
    }
    let stepImpulse = 0;
    for (const contact of this.#debugContacts) {
      if (contact.entityA === fragile.entity || contact.entityB === fragile.entity) {
        stepImpulse += contact.impulse;
      }
    }
    this.#debugContacts.length = Math.min(this.#debugContacts.length, 16);
    this.#fragileImpulses.push(stepImpulse);
    while (this.#fragileImpulses.length > fragile.windowSteps) {
      this.#fragileImpulses.shift();
    }
  }

  #wakeForCommandChange(command: QuantizedTiltCommand): void {
    if (command.x === this.#lastCommandX && command.z === this.#lastCommandZ) {
      return;
    }
    this.#lastCommandX = command.x;
    this.#lastCommandZ = command.z;
    for (const entity of this.#level.entities) {
      if (entity.body.kind !== "dynamic") {
        continue;
      }
      const body = this.#bodyById.get(entity.id);
      if (body?.isSleeping() === true) {
        body.wakeUp();
      }
    }
  }

  #applyFeltAssist(): void {
    if (this.#options.captureAuthority !== "felt_assist" || this.#level.goal === null) {
      return;
    }
    const goal = this.#level.goal;
    const body = this.#bodyById.get(goal.requiredEntity);
    if (body === undefined) {
      return;
    }
    const position = body.translation();
    const velocity = body.linvel();
    if (
      inside(position, goal.center, {
        x: goal.halfExtents.x * 1.25,
        y: goal.halfExtents.y * 1.25,
        z: goal.halfExtents.z * 1.25
      }) &&
      magnitude(velocity) <= FELT_ASSIST_MAX_SPEED
    ) {
      body.setLinvel({ x: velocity.x * 0.82, y: velocity.y * 0.82, z: velocity.z * 0.82 }, true);
    }
  }

  #evaluateState(): void {
    const bodies = this.snapshot().bodies;
    let movingBodies = 0;
    for (const body of bodies) {
      if (
        !isFiniteVector(body.translation) ||
        !isFiniteQuaternion(body.rotation) ||
        !isFiniteVector(body.linearVelocity) ||
        !isFiniteVector(body.angularVelocity) ||
        magnitude(body.linearVelocity) > SPEED_RUNAWAY_LIMIT
      ) {
        this.#fail("physics_invalid_state", false, body.id);
        return;
      }
      const entity = this.#entityById.get(body.id);
      if (
        entity?.body.kind === "dynamic" &&
        !inside(
          body.translation,
          { x: 0, y: 0, z: 0 },
          {
            x: Math.max(
              Math.abs(this.#level.bounds.minimum.x),
              Math.abs(this.#level.bounds.maximum.x)
            ),
            y: Math.max(
              Math.abs(this.#level.bounds.minimum.y),
              Math.abs(this.#level.bounds.maximum.y)
            ),
            z: Math.max(
              Math.abs(this.#level.bounds.minimum.z),
              Math.abs(this.#level.bounds.maximum.z)
            )
          }
        )
      ) {
        this.#fail("object_out_of_bounds", true, body.id);
        return;
      }
      if (entity?.body.kind === "dynamic" && magnitude(body.linearVelocity) > 0.025) {
        movingBodies += 1;
      }
    }

    const fragile = this.#level.fragility;
    const impulseWindow = this.#fragileImpulses.reduce((sum, value) => sum + value, 0);
    if (fragile !== null && impulseWindow >= fragile.breakImpulse) {
      this.#fail("fragile_threshold_exceeded", true, fragile.entity);
      return;
    }

    this.#evaluateGoal(bodies);
    if (this.#result !== null) {
      return;
    }
    this.#stillSteps = movingBodies === 0 ? this.#stillSteps + 1 : 0;
    if (this.#level.kind === "tutorial" && this.#stillSteps >= SOFT_LOCK_STEPS) {
      this.#fail("irrecoverably_trapped", true);
    }
  }

  #evaluateGoal(bodies: readonly BodySnapshot[]): void {
    const goal = this.#level.goal;
    if (goal === null) {
      return;
    }
    const required = bodies.find((body) => body.id === goal.requiredEntity);
    if (
      required !== undefined &&
      inside(required.translation, goal.center, goal.halfExtents) &&
      magnitude(required.linearVelocity) <= goal.maximumSpeed
    ) {
      this.#goalHoldSteps += 1;
      if (this.#goalHoldSteps >= goal.holdSteps) {
        this.#result = { kind: "success", step: this.#step };
        this.#phase = "success";
      }
    } else {
      this.#goalHoldSteps = 0;
    }

    for (const body of bodies) {
      if (
        body.id !== goal.requiredEntity &&
        this.#entityById.get(body.id)?.body.kind === "dynamic" &&
        inside(body.translation, goal.center, goal.halfExtents) &&
        magnitude(body.linearVelocity) <= goal.maximumSpeed
      ) {
        this.#fail("wrong_goal_object", true, body.id);
        return;
      }
    }
  }

  #fail(
    classification: SessionFailure["classification"],
    playerAttributable: boolean,
    entityId?: string
  ): void {
    this.#result = {
      kind: "failure",
      step: this.#step,
      classification,
      playerAttributable,
      ...(entityId === undefined ? {} : { entityId })
    };
    this.#phase = "failure";
  }

  #assertUsable(): void {
    if (this.#disposed) {
      throw new Error("Simulation has been disposed.");
    }
  }
}
