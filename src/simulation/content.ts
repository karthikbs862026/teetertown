import { hashText } from "./stableHash";
import type { AuthorityType, SceneId, Vec3 } from "./types";

export type BodyKind = "fixed" | "dynamic" | "kinematic";
export type ColliderShape = "ball" | "cuboid" | "cylinder";
export type VisualShape = "sphere" | "box" | "cylinder" | "ring";

export interface BodyDefinition {
  readonly kind: BodyKind;
  readonly translation: Vec3;
  readonly rotation: {
    readonly x: number;
    readonly y: number;
    readonly z: number;
    readonly w: number;
  };
  readonly linearVelocity: Vec3;
  readonly angularVelocity: Vec3;
  readonly linearDamping: number;
  readonly angularDamping: number;
  readonly canSleep: boolean;
  readonly ccd: boolean;
}

export interface ColliderDefinition {
  readonly shape: ColliderShape;
  readonly halfExtents?: Vec3;
  readonly radius?: number;
  readonly halfHeight?: number;
  readonly material: string;
  readonly sensor: boolean;
}

export interface VisualDefinition {
  readonly shape: VisualShape;
  readonly size: Vec3;
  readonly color: string;
  readonly opacity: number;
  readonly wireframe: boolean;
}

export interface EntityDefinition {
  readonly id: string;
  readonly role: string;
  readonly authority: AuthorityType;
  readonly body: BodyDefinition;
  readonly collider?: ColliderDefinition;
  readonly visual?: VisualDefinition;
  readonly intentionallyMismatched: boolean;
}

export interface RevoluteJointDefinition {
  readonly id: string;
  readonly kind: "revolute";
  readonly bodyA: string;
  readonly bodyB: string;
  readonly anchorA: Vec3;
  readonly anchorB: Vec3;
  readonly axis: Vec3;
  readonly limits: readonly [number, number];
}

export interface GoalDefinition {
  readonly requiredEntity: string;
  readonly center: Vec3;
  readonly halfExtents: Vec3;
  readonly maximumSpeed: number;
  readonly holdSteps: number;
}

export interface FragilityDefinition {
  readonly entity: string;
  readonly warningImpulse: number;
  readonly breakImpulse: number;
  readonly windowSteps: number;
}

export interface LevelBudget {
  readonly maximumBodies: number;
  readonly maximumColliders: number;
  readonly maximumJoints: number;
  readonly maximumAwakeBodies: number;
}

export interface LevelDefinition {
  readonly schemaVersion: 1;
  readonly id: SceneId;
  readonly kind: "tutorial" | "laboratory";
  readonly contentVersion: string;
  readonly titleKey: string;
  readonly worldUnits: "meters";
  readonly bounds: { readonly minimum: Vec3; readonly maximum: Vec3 };
  readonly entities: readonly EntityDefinition[];
  readonly joints: readonly RevoluteJointDefinition[];
  readonly goal: GoalDefinition | null;
  readonly fragility: FragilityDefinition | null;
  readonly budget: LevelBudget;
  readonly contentHash: string;
}

export interface MaterialProfile {
  readonly id: string;
  readonly density: number;
  readonly friction: number;
  readonly restitution: number;
}

export interface MaterialLibrary {
  readonly schemaVersion: 1;
  readonly version: string;
  readonly materials: readonly MaterialProfile[];
  readonly hash: string;
}

export interface ValidationIssue {
  readonly path: string;
  readonly message: string;
}

export type ValidationResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly issues: readonly ValidationIssue[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function issue(path: string, message: string): ValidationIssue {
  return { path, message };
}

function parseString(value: unknown, path: string, issues: ValidationIssue[]): string {
  if (typeof value !== "string" || value.length === 0) {
    issues.push(issue(path, "Expected a non-empty string."));
    return "";
  }
  return value;
}

function parseNumber(value: unknown, path: string, issues: ValidationIssue[]): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    issues.push(issue(path, "Expected a finite number."));
    return 0;
  }
  return value;
}

function parseBoolean(value: unknown, path: string, issues: ValidationIssue[]): boolean {
  if (typeof value !== "boolean") {
    issues.push(issue(path, "Expected a boolean."));
    return false;
  }
  return value;
}

function parseVec3(value: unknown, path: string, issues: ValidationIssue[]): Vec3 {
  if (!isRecord(value)) {
    issues.push(issue(path, "Expected a vector object."));
    return { x: 0, y: 0, z: 0 };
  }
  return {
    x: parseNumber(value.x, `${path}.x`, issues),
    y: parseNumber(value.y, `${path}.y`, issues),
    z: parseNumber(value.z, `${path}.z`, issues)
  };
}

function parseBody(value: unknown, path: string, issues: ValidationIssue[]): BodyDefinition {
  if (!isRecord(value)) {
    issues.push(issue(path, "Expected a body object."));
    return {
      kind: "fixed",
      translation: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      linearVelocity: { x: 0, y: 0, z: 0 },
      angularVelocity: { x: 0, y: 0, z: 0 },
      linearDamping: 0,
      angularDamping: 0,
      canSleep: true,
      ccd: false
    };
  }

  const kind = parseString(value.kind, `${path}.kind`, issues);
  if (kind !== "fixed" && kind !== "dynamic" && kind !== "kinematic") {
    issues.push(issue(`${path}.kind`, "Expected fixed, dynamic, or kinematic."));
  }
  const rotationRecord = isRecord(value.rotation) ? value.rotation : {};
  if (!isRecord(value.rotation)) {
    issues.push(issue(`${path}.rotation`, "Expected a quaternion object."));
  }

  return {
    kind: kind === "dynamic" || kind === "kinematic" ? kind : "fixed",
    translation: parseVec3(value.translation, `${path}.translation`, issues),
    rotation: {
      x: parseNumber(rotationRecord.x, `${path}.rotation.x`, issues),
      y: parseNumber(rotationRecord.y, `${path}.rotation.y`, issues),
      z: parseNumber(rotationRecord.z, `${path}.rotation.z`, issues),
      w: parseNumber(rotationRecord.w, `${path}.rotation.w`, issues)
    },
    linearVelocity: parseVec3(value.linearVelocity, `${path}.linearVelocity`, issues),
    angularVelocity: parseVec3(value.angularVelocity, `${path}.angularVelocity`, issues),
    linearDamping: parseNumber(value.linearDamping, `${path}.linearDamping`, issues),
    angularDamping: parseNumber(value.angularDamping, `${path}.angularDamping`, issues),
    canSleep: parseBoolean(value.canSleep, `${path}.canSleep`, issues),
    ccd: parseBoolean(value.ccd, `${path}.ccd`, issues)
  };
}

function parseCollider(
  value: unknown,
  path: string,
  issues: ValidationIssue[]
): ColliderDefinition | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!isRecord(value)) {
    issues.push(issue(path, "Expected a collider object."));
    return undefined;
  }

  const shape = parseString(value.shape, `${path}.shape`, issues);
  if (shape !== "ball" && shape !== "cuboid" && shape !== "cylinder") {
    issues.push(issue(`${path}.shape`, "Expected ball, cuboid, or cylinder."));
  }

  const parsed: ColliderDefinition = {
    shape: shape === "ball" || shape === "cylinder" ? shape : "cuboid",
    material: parseString(value.material, `${path}.material`, issues),
    sensor: parseBoolean(value.sensor, `${path}.sensor`, issues)
  };
  if (shape === "cuboid") {
    return {
      ...parsed,
      halfExtents: parseVec3(value.halfExtents, `${path}.halfExtents`, issues)
    };
  }
  if (shape === "ball") {
    return {
      ...parsed,
      radius: parseNumber(value.radius, `${path}.radius`, issues)
    };
  }
  return {
    ...parsed,
    radius: parseNumber(value.radius, `${path}.radius`, issues),
    halfHeight: parseNumber(value.halfHeight, `${path}.halfHeight`, issues)
  };
}

function parseVisual(
  value: unknown,
  path: string,
  issues: ValidationIssue[]
): VisualDefinition | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!isRecord(value)) {
    issues.push(issue(path, "Expected a visual object."));
    return undefined;
  }
  const shape = parseString(value.shape, `${path}.shape`, issues);
  if (shape !== "sphere" && shape !== "box" && shape !== "cylinder" && shape !== "ring") {
    issues.push(issue(`${path}.shape`, "Expected sphere, box, cylinder, or ring."));
  }
  return {
    shape: shape === "sphere" || shape === "cylinder" || shape === "ring" ? shape : "box",
    size: parseVec3(value.size, `${path}.size`, issues),
    color: parseString(value.color, `${path}.color`, issues),
    opacity: parseNumber(value.opacity, `${path}.opacity`, issues),
    wireframe: parseBoolean(value.wireframe, `${path}.wireframe`, issues)
  };
}

function parseEntity(value: unknown, path: string, issues: ValidationIssue[]): EntityDefinition {
  const record = isRecord(value) ? value : {};
  if (!isRecord(value)) {
    issues.push(issue(path, "Expected an entity object."));
  }
  const authority = parseString(record.authority, `${path}.authority`, issues);
  const isAuthority = (candidate: string): candidate is AuthorityType =>
    candidate === "dynamic" ||
    candidate === "constrained" ||
    candidate === "kinematic" ||
    candidate === "assist" ||
    candidate === "decorative";
  if (!isAuthority(authority)) {
    issues.push(issue(`${path}.authority`, "Unknown authority type."));
  }
  const collider = parseCollider(record.collider, `${path}.collider`, issues);
  const body = parseBody(record.body, `${path}.body`, issues);
  const visual = parseVisual(record.visual, `${path}.visual`, issues);
  const normalizedAuthority: AuthorityType = isAuthority(authority) ? authority : "decorative";

  if (normalizedAuthority === "decorative" && collider !== undefined) {
    issues.push(issue(`${path}.collider`, "Decorative entities may not have colliders."));
  }
  if (normalizedAuthority === "dynamic" && body.kind !== "dynamic") {
    issues.push(issue(`${path}.body.kind`, "Dynamic authority requires a dynamic body."));
  }
  if (normalizedAuthority === "kinematic" && body.kind !== "kinematic") {
    issues.push(issue(`${path}.body.kind`, "Kinematic authority requires a kinematic body."));
  }

  return {
    id: parseString(record.id, `${path}.id`, issues),
    role: parseString(record.role, `${path}.role`, issues),
    authority: normalizedAuthority,
    body,
    ...(collider === undefined ? {} : { collider }),
    ...(visual === undefined ? {} : { visual }),
    intentionallyMismatched: parseBoolean(
      record.intentionallyMismatched,
      `${path}.intentionallyMismatched`,
      issues
    )
  };
}

function parseJoint(
  value: unknown,
  path: string,
  issues: ValidationIssue[]
): RevoluteJointDefinition {
  const record = isRecord(value) ? value : {};
  if (!isRecord(value)) {
    issues.push(issue(path, "Expected a joint object."));
  }
  const limits = Array.isArray(record.limits) ? record.limits : [];
  if (!Array.isArray(record.limits) || limits.length !== 2) {
    issues.push(issue(`${path}.limits`, "Expected two joint limits."));
  }
  return {
    id: parseString(record.id, `${path}.id`, issues),
    kind: "revolute",
    bodyA: parseString(record.bodyA, `${path}.bodyA`, issues),
    bodyB: parseString(record.bodyB, `${path}.bodyB`, issues),
    anchorA: parseVec3(record.anchorA, `${path}.anchorA`, issues),
    anchorB: parseVec3(record.anchorB, `${path}.anchorB`, issues),
    axis: parseVec3(record.axis, `${path}.axis`, issues),
    limits: [
      parseNumber(limits[0], `${path}.limits.0`, issues),
      parseNumber(limits[1], `${path}.limits.1`, issues)
    ]
  };
}

function parseGoal(value: unknown, path: string, issues: ValidationIssue[]): GoalDefinition | null {
  if (value === null) {
    return null;
  }
  const record = isRecord(value) ? value : {};
  if (!isRecord(value)) {
    issues.push(issue(path, "Expected a goal object or null."));
  }
  return {
    requiredEntity: parseString(record.requiredEntity, `${path}.requiredEntity`, issues),
    center: parseVec3(record.center, `${path}.center`, issues),
    halfExtents: parseVec3(record.halfExtents, `${path}.halfExtents`, issues),
    maximumSpeed: parseNumber(record.maximumSpeed, `${path}.maximumSpeed`, issues),
    holdSteps: parseNumber(record.holdSteps, `${path}.holdSteps`, issues)
  };
}

function parseFragility(
  value: unknown,
  path: string,
  issues: ValidationIssue[]
): FragilityDefinition | null {
  if (value === null) {
    return null;
  }
  const record = isRecord(value) ? value : {};
  if (!isRecord(value)) {
    issues.push(issue(path, "Expected a fragility object or null."));
  }
  return {
    entity: parseString(record.entity, `${path}.entity`, issues),
    warningImpulse: parseNumber(record.warningImpulse, `${path}.warningImpulse`, issues),
    breakImpulse: parseNumber(record.breakImpulse, `${path}.breakImpulse`, issues),
    windowSteps: parseNumber(record.windowSteps, `${path}.windowSteps`, issues)
  };
}

function parseBudget(value: unknown, path: string, issues: ValidationIssue[]): LevelBudget {
  const record = isRecord(value) ? value : {};
  if (!isRecord(value)) {
    issues.push(issue(path, "Expected a budget object."));
  }
  return {
    maximumBodies: parseNumber(record.maximumBodies, `${path}.maximumBodies`, issues),
    maximumColliders: parseNumber(record.maximumColliders, `${path}.maximumColliders`, issues),
    maximumJoints: parseNumber(record.maximumJoints, `${path}.maximumJoints`, issues),
    maximumAwakeBodies: parseNumber(record.maximumAwakeBodies, `${path}.maximumAwakeBodies`, issues)
  };
}

function canonicalWithoutHash(record: Record<string, unknown>): string {
  const copy: Record<string, unknown> = {};
  for (const key of Object.keys(record).sort()) {
    if (key !== "contentHash" && key !== "hash") {
      copy[key] = record[key];
    }
  }
  return JSON.stringify(copy);
}

function validateStableIds(
  entities: readonly EntityDefinition[],
  joints: readonly RevoluteJointDefinition[],
  issues: ValidationIssue[]
): void {
  const entityIds = entities.map((entity) => entity.id);
  if (new Set(entityIds).size !== entityIds.length) {
    issues.push(issue("entities", "Entity IDs must be unique."));
  }
  const sortedEntityIds = [...entityIds].sort();
  if (entityIds.some((id, index) => id !== sortedEntityIds[index])) {
    issues.push(issue("entities", "Entities must be canonically sorted by stable ID."));
  }

  const jointIds = joints.map((joint) => joint.id);
  if (new Set(jointIds).size !== jointIds.length) {
    issues.push(issue("joints", "Joint IDs must be unique."));
  }
  for (const joint of joints) {
    if (!entityIds.includes(joint.bodyA) || !entityIds.includes(joint.bodyB)) {
      issues.push(issue(`joints.${joint.id}`, "Joint references an unknown body."));
    }
  }
}

export function validateLevelDefinition(value: unknown): ValidationResult<LevelDefinition> {
  const issues: ValidationIssue[] = [];
  if (!isRecord(value)) {
    return { ok: false, issues: [issue("$", "Expected a level object.")] };
  }
  if (value.schemaVersion !== 1) {
    issues.push(issue("schemaVersion", "Only level schema version 1 is supported."));
  }
  const id = parseString(value.id, "id", issues);
  if (id !== "tutorial-graybox" && id !== "adversarial-lab") {
    issues.push(issue("id", "Unknown Phase-1 scene ID."));
  }
  const kind = parseString(value.kind, "kind", issues);
  if (kind !== "tutorial" && kind !== "laboratory") {
    issues.push(issue("kind", "Expected tutorial or laboratory."));
  }
  const entitiesRaw = Array.isArray(value.entities) ? value.entities : [];
  const jointsRaw = Array.isArray(value.joints) ? value.joints : [];
  if (!Array.isArray(value.entities)) {
    issues.push(issue("entities", "Expected an entity array."));
  }
  if (!Array.isArray(value.joints)) {
    issues.push(issue("joints", "Expected a joint array."));
  }
  const entities = entitiesRaw.map((entity, index) =>
    parseEntity(entity, `entities.${index}`, issues)
  );
  const joints = jointsRaw.map((joint, index) => parseJoint(joint, `joints.${index}`, issues));
  validateStableIds(entities, joints, issues);

  const bounds = isRecord(value.bounds) ? value.bounds : {};
  if (!isRecord(value.bounds)) {
    issues.push(issue("bounds", "Expected bounds."));
  }
  const expectedHash = hashText(canonicalWithoutHash(value));
  const contentHash = parseString(value.contentHash, "contentHash", issues);
  if (contentHash !== "GENERATE" && contentHash !== expectedHash) {
    issues.push(issue("contentHash", `Expected ${expectedHash}.`));
  }

  const level: LevelDefinition = {
    schemaVersion: 1,
    id: id === "adversarial-lab" ? id : "tutorial-graybox",
    kind: kind === "laboratory" ? kind : "tutorial",
    contentVersion: parseString(value.contentVersion, "contentVersion", issues),
    titleKey: parseString(value.titleKey, "titleKey", issues),
    worldUnits: "meters",
    bounds: {
      minimum: parseVec3(bounds.minimum, "bounds.minimum", issues),
      maximum: parseVec3(bounds.maximum, "bounds.maximum", issues)
    },
    entities,
    joints,
    goal: parseGoal(value.goal, "goal", issues),
    fragility: parseFragility(value.fragility, "fragility", issues),
    budget: parseBudget(value.budget, "budget", issues),
    contentHash: contentHash === "GENERATE" ? expectedHash : contentHash
  };

  return issues.length === 0 ? { ok: true, value: level } : { ok: false, issues };
}

export function validateMaterialLibrary(value: unknown): ValidationResult<MaterialLibrary> {
  const issues: ValidationIssue[] = [];
  if (!isRecord(value)) {
    return { ok: false, issues: [issue("$", "Expected a material library object.")] };
  }
  if (value.schemaVersion !== 1) {
    issues.push(issue("schemaVersion", "Only material schema version 1 is supported."));
  }
  const rawMaterials = Array.isArray(value.materials) ? value.materials : [];
  if (!Array.isArray(value.materials)) {
    issues.push(issue("materials", "Expected a material array."));
  }
  const materials: MaterialProfile[] = rawMaterials.map((material, index) => {
    const record = isRecord(material) ? material : {};
    if (!isRecord(material)) {
      issues.push(issue(`materials.${index}`, "Expected a material object."));
    }
    return {
      id: parseString(record.id, `materials.${index}.id`, issues),
      density: parseNumber(record.density, `materials.${index}.density`, issues),
      friction: parseNumber(record.friction, `materials.${index}.friction`, issues),
      restitution: parseNumber(record.restitution, `materials.${index}.restitution`, issues)
    };
  });
  const ids = materials.map((material) => material.id);
  if (new Set(ids).size !== ids.length) {
    issues.push(issue("materials", "Material IDs must be unique."));
  }
  const sortedIds = [...ids].sort();
  if (ids.some((id, index) => id !== sortedIds[index])) {
    issues.push(issue("materials", "Materials must be canonically sorted by ID."));
  }
  const expectedHash = hashText(canonicalWithoutHash(value));
  const suppliedHash = parseString(value.hash, "hash", issues);
  if (suppliedHash !== "GENERATE" && suppliedHash !== expectedHash) {
    issues.push(issue("hash", `Expected ${expectedHash}.`));
  }

  const library: MaterialLibrary = {
    schemaVersion: 1,
    version: parseString(value.version, "version", issues),
    materials,
    hash: suppliedHash === "GENERATE" ? expectedHash : suppliedHash
  };
  return issues.length === 0 ? { ok: true, value: library } : { ok: false, issues };
}

export function materialById(library: MaterialLibrary, id: string): MaterialProfile {
  const material = library.materials.find((candidate) => candidate.id === id);
  if (material === undefined) {
    throw new Error(`Unknown physics material: ${id}`);
  }
  return material;
}
