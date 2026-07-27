export type SceneId = "tutorial-graybox" | "adversarial-lab";

export type AuthorityType = "dynamic" | "constrained" | "kinematic" | "assist" | "decorative";

export type InputModel = "one_axis_raw" | "two_axis_raw" | "one_axis_track" | "two_axis_track";

export type TiltImplementation = "gravity_vector" | "kinematic_support";

export type CaptureAuthority = "raw" | "constrained" | "felt_assist";

export type CameraModel = "orthographic_fixed" | "perspective_fixed" | "bounded_event";

export type FailureClassification =
  | "object_out_of_bounds"
  | "fragile_threshold_exceeded"
  | "wrong_goal_object"
  | "irrecoverably_trapped"
  | "constraint_expired"
  | "physics_invalid_state"
  | "content_or_script_error"
  | "ambiguous";

export type SessionPhase =
  | "boot"
  | "capability_check"
  | "loading"
  | "ready"
  | "tutorial"
  | "playing"
  | "paused"
  | "rewinding"
  | "success"
  | "failure"
  | "transition"
  | "context_lost"
  | "recovering"
  | "fatal_error";

export interface Vec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface Quat {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly w: number;
}

export interface BodySnapshot {
  readonly id: string;
  readonly authority: AuthorityType;
  readonly translation: Vec3;
  readonly rotation: Quat;
  readonly linearVelocity: Vec3;
  readonly angularVelocity: Vec3;
  readonly sleeping: boolean;
}

export interface DebugContact {
  readonly entityA: string;
  readonly entityB: string;
  readonly direction: Vec3;
  readonly impulse: number;
}

export interface TiltState {
  readonly x: number;
  readonly z: number;
  readonly velocityX: number;
  readonly velocityZ: number;
  readonly accelerationX: number;
  readonly accelerationZ: number;
}

export interface SessionSuccess {
  readonly kind: "success";
  readonly step: number;
}

export interface SessionFailure {
  readonly kind: "failure";
  readonly step: number;
  readonly classification: FailureClassification;
  readonly playerAttributable: boolean;
  readonly entityId?: string;
}

export type SessionResult = SessionSuccess | SessionFailure;

export interface SimulationSnapshot {
  readonly step: number;
  readonly phase: SessionPhase;
  readonly tilt: TiltState;
  readonly bodies: readonly BodySnapshot[];
  readonly result: SessionResult | null;
  readonly goalHoldSteps: number;
  readonly fragileImpulseWindow: number;
  readonly debugContacts: readonly DebugContact[];
}

export interface RuntimeExperimentOptions {
  readonly inputModel: InputModel;
  readonly tiltImplementation: TiltImplementation;
  readonly captureAuthority: CaptureAuthority;
  readonly cameraModel: CameraModel;
}

export interface QuantizedTiltCommand {
  readonly kind: "tilt";
  readonly step: number;
  readonly x: number;
  readonly z: number;
}

export interface PauseCommand {
  readonly kind: "pause";
  readonly step: number;
}

export interface ResumeCommand {
  readonly kind: "resume";
  readonly step: number;
}

export type SimulationCommand = QuantizedTiltCommand | PauseCommand | ResumeCommand;

export interface ResourceCounts {
  readonly bodies: number;
  readonly colliders: number;
  readonly joints: number;
  readonly awakeBodies: number;
  readonly geometries: number;
  readonly materials: number;
  readonly textures: number;
  readonly renderTargets: number;
  readonly listeners: number;
  readonly timers: number;
  readonly workers: number;
  readonly audioNodes: number;
  readonly drawCalls: number;
  readonly triangles: number;
}
