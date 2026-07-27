import { describe, expect, it } from "vitest";
import { SessionStateMachine } from "../../src/app/sessionStateMachine";

describe("session state machine", () => {
  it("accepts the boot path and rejects an illegal shortcut", () => {
    const machine = new SessionStateMachine();
    expect(() => machine.transition("playing")).toThrow("Illegal session transition");
    machine.transition("capability_check");
    machine.transition("loading");
    machine.transition("ready");
    machine.transition("tutorial");
    machine.transition("paused");
    expect(machine.phase).toBe("paused");
  });
});
