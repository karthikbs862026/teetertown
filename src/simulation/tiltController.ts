import { FIXED_TIMESTEP_SECONDS, MAX_TILT_RADIANS, clamp } from "./math";
import { commandTarget } from "./inputCommand";
import type { QuantizedTiltCommand, TiltState } from "./types";

interface AxisState {
  angle: number;
  velocity: number;
  acceleration: number;
}

const RESPONSE_GAIN = 10;
const MAX_ANGULAR_SPEED = 1.4;
const MAX_ACCELERATION = 6;
const MAX_JERK = 60;

export class TiltController {
  readonly #x: AxisState = { angle: 0, velocity: 0, acceleration: 0 };
  readonly #z: AxisState = { angle: 0, velocity: 0, acceleration: 0 };

  public reset(): void {
    this.#x.angle = 0;
    this.#x.velocity = 0;
    this.#x.acceleration = 0;
    this.#z.angle = 0;
    this.#z.velocity = 0;
    this.#z.acceleration = 0;
  }

  public step(command: QuantizedTiltCommand, stepSeconds = FIXED_TIMESTEP_SECONDS): TiltState {
    const normalizedTarget = commandTarget(command);
    this.#stepAxis(this.#x, normalizedTarget.z * MAX_TILT_RADIANS, stepSeconds);
    this.#stepAxis(this.#z, -normalizedTarget.x * MAX_TILT_RADIANS, stepSeconds);
    return this.snapshot();
  }

  public snapshot(): TiltState {
    return {
      x: this.#x.angle,
      z: this.#z.angle,
      velocityX: this.#x.velocity,
      velocityZ: this.#z.velocity,
      accelerationX: this.#x.acceleration,
      accelerationZ: this.#z.acceleration
    };
  }

  #stepAxis(axis: AxisState, target: number, stepSeconds: number): void {
    const errorBeforeStep = target - axis.angle;
    const desiredVelocity = clamp(
      errorBeforeStep * RESPONSE_GAIN,
      -MAX_ANGULAR_SPEED,
      MAX_ANGULAR_SPEED
    );
    const desiredAcceleration = (desiredVelocity - axis.velocity) / stepSeconds;
    const boundedDesired = clamp(desiredAcceleration, -MAX_ACCELERATION, MAX_ACCELERATION);
    const maximumAccelerationChange = MAX_JERK * stepSeconds;

    axis.acceleration += clamp(
      boundedDesired - axis.acceleration,
      -maximumAccelerationChange,
      maximumAccelerationChange
    );
    const nextVelocity = axis.velocity + axis.acceleration * stepSeconds;
    const nextAngle = clamp(
      axis.angle + nextVelocity * stepSeconds,
      -MAX_TILT_RADIANS,
      MAX_TILT_RADIANS
    );
    const errorAfterStep = target - nextAngle;

    if (errorBeforeStep !== 0 && Math.sign(errorBeforeStep) !== Math.sign(errorAfterStep)) {
      axis.angle = target;
      axis.velocity = 0;
      axis.acceleration = 0;
      return;
    }

    axis.velocity = nextVelocity;
    axis.angle = nextAngle;

    if (
      (axis.angle === MAX_TILT_RADIANS && axis.velocity > 0) ||
      (axis.angle === -MAX_TILT_RADIANS && axis.velocity < 0)
    ) {
      axis.velocity = 0;
      axis.acceleration = 0;
    }
  }
}
