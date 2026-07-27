import { FIXED_TIMESTEP_SECONDS, clamp } from "./math";

export interface ClockAdvance {
  readonly steps: number;
  readonly alpha: number;
  readonly clampedSeconds: number;
}

export class FixedStepClock {
  readonly #stepSeconds: number;
  readonly #maxCatchUpSteps: number;
  #accumulatorSeconds = 0;
  #paused = false;

  public constructor(stepSeconds = FIXED_TIMESTEP_SECONDS, maxCatchUpSteps = 5) {
    if (!(stepSeconds > 0) || !Number.isFinite(stepSeconds)) {
      throw new Error("Fixed step must be a finite positive number.");
    }
    if (!Number.isInteger(maxCatchUpSteps) || maxCatchUpSteps < 1) {
      throw new Error("Maximum catch-up steps must be a positive integer.");
    }

    this.#stepSeconds = stepSeconds;
    this.#maxCatchUpSteps = maxCatchUpSteps;
  }

  public get stepSeconds(): number {
    return this.#stepSeconds;
  }

  public get paused(): boolean {
    return this.#paused;
  }

  public pause(): void {
    this.#paused = true;
    this.#accumulatorSeconds = 0;
  }

  public resume(): void {
    this.#paused = false;
    this.#accumulatorSeconds = 0;
  }

  public reset(): void {
    this.#accumulatorSeconds = 0;
  }

  public advance(deltaSeconds: number, fixedStep: () => void): ClockAdvance {
    if (this.#paused) {
      return { steps: 0, alpha: 0, clampedSeconds: 0 };
    }
    if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0) {
      throw new Error("Render delta must be a finite non-negative number.");
    }

    const maximumAcceptedDelta = this.#stepSeconds * this.#maxCatchUpSteps;
    const acceptedDelta = clamp(deltaSeconds, 0, maximumAcceptedDelta);
    const clampedSeconds = deltaSeconds - acceptedDelta;
    this.#accumulatorSeconds += acceptedDelta;

    let steps = 0;
    while (
      this.#accumulatorSeconds + Number.EPSILON >= this.#stepSeconds &&
      steps < this.#maxCatchUpSteps
    ) {
      fixedStep();
      this.#accumulatorSeconds -= this.#stepSeconds;
      steps += 1;
    }

    if (steps === this.#maxCatchUpSteps && this.#accumulatorSeconds >= this.#stepSeconds) {
      this.#accumulatorSeconds %= this.#stepSeconds;
    }

    return {
      steps,
      alpha: clamp(this.#accumulatorSeconds / this.#stepSeconds, 0, 1),
      clampedSeconds
    };
  }
}
