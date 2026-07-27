import type { SessionPhase } from "../simulation/types";

const TRANSITIONS: Readonly<Record<SessionPhase, readonly SessionPhase[]>> = {
  boot: ["capability_check", "fatal_error"],
  capability_check: ["loading", "fatal_error"],
  loading: ["ready", "fatal_error"],
  ready: ["tutorial", "playing", "transition", "fatal_error"],
  tutorial: ["paused", "success", "failure", "transition", "context_lost", "fatal_error"],
  playing: ["paused", "success", "failure", "transition", "context_lost", "fatal_error"],
  paused: ["tutorial", "playing", "rewinding", "transition", "context_lost", "fatal_error"],
  rewinding: ["paused", "tutorial", "playing", "failure", "fatal_error"],
  success: ["transition", "ready", "fatal_error"],
  failure: ["rewinding", "transition", "ready", "fatal_error"],
  transition: ["loading", "ready", "fatal_error"],
  context_lost: ["recovering", "fatal_error"],
  recovering: ["ready", "paused", "fatal_error"],
  fatal_error: []
};

export class SessionStateMachine {
  #phase: SessionPhase = "boot";

  public get phase(): SessionPhase {
    return this.#phase;
  }

  public canTransition(next: SessionPhase): boolean {
    return TRANSITIONS[this.#phase].includes(next);
  }

  public transition(next: SessionPhase): void {
    if (!this.canTransition(next)) {
      throw new Error(`Illegal session transition: ${this.#phase} -> ${next}`);
    }
    this.#phase = next;
  }
}
