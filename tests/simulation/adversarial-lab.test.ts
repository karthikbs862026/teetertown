import { describe, expect, it } from "vitest";
import { loadLevelDefinition } from "../../src/simulation/contentCatalog";
import { createTiltCommand } from "../../src/simulation/inputCommand";
import {
  runCcdBarrierProbe,
  runContactOrderingProbe,
  runSleepingWakeProbe,
  runJointReversalProbe
} from "../../src/simulation/physicsRiskProbes";
import { hashSimulationSnapshot } from "../../src/simulation/stableHash";
import { TeetertownSimulation } from "../../src/simulation/teetertownSimulation";
import type { DebugContact } from "../../src/simulation/types";

function contactKey(contact: DebugContact): string {
  return [
    contact.entityA,
    contact.entityB,
    Math.round(contact.impulse * 1_000_000),
    Math.round(contact.direction.x * 1_000_000),
    Math.round(contact.direction.y * 1_000_000),
    Math.round(contact.direction.z * 1_000_000)
  ].join(":");
}

async function contactTrace(): Promise<readonly string[]> {
  const simulation = await TeetertownSimulation.create("adversarial-lab", {
    inputModel: "two_axis_raw",
    tiltImplementation: "gravity_vector",
    captureAuthority: "raw",
    cameraModel: "perspective_fixed"
  });
  const trace: string[] = [];
  for (let step = 1; step <= 46; step += 1) {
    const snapshot = simulation.step();
    const pairs = snapshot.debugContacts.map(contactKey);
    expect(pairs).toEqual([...pairs].sort());
    for (const contact of snapshot.debugContacts) {
      expect(contact.entityA <= contact.entityB).toBe(true);
    }
    trace.push(`${step}|${pairs.join(",")}`);
  }
  simulation.dispose();
  return trace;
}

describe("adversarial laboratory", () => {
  it("contains the declared mismatch and trips the fragility fixture", async () => {
    const level = await loadLevelDefinition("adversarial-lab");
    expect(
      level.entities.filter((entity) => entity.intentionallyMismatched).map(({ id }) => id)
    ).toEqual(["mismatch-box"]);

    const simulation = await TeetertownSimulation.create("adversarial-lab", {
      inputModel: "two_axis_raw",
      tiltImplementation: "gravity_vector",
      captureAuthority: "raw",
      cameraModel: "perspective_fixed"
    });
    for (let step = 1; step <= 120 && simulation.snapshot().result === null; step += 1) {
      simulation.step();
    }
    expect(simulation.snapshot().result).toEqual({
      kind: "failure",
      step: 46,
      classification: "fragile_threshold_exceeded",
      playerAttributable: true,
      entityId: "fragile-ball"
    });
    expect(simulation.resourceCounts()).toMatchObject({
      bodies: 11,
      colliders: 11,
      joints: 1
    });
    simulation.dispose();
  });

  it("canonicalizes pileup contacts and repeats the complete contact trace", async () => {
    const first = await contactTrace();
    const second = await contactTrace();
    expect(second).toEqual(first);
    expect(first.some((step) => step.includes("pile-a:pile-b"))).toBe(true);
    expect(first.some((step) => step.includes("pile-b:pile-c"))).toBe(true);
    await expect(runContactOrderingProbe()).resolves.toEqual({
      contactCount: 132,
      stepsWithContacts: 43,
      pileAtoBObserved: true,
      pileBtoCObserved: true,
      summaryHash: "0fe7d31e"
    });
  });

  it("wakes sleeping dynamic bodies on a changed quantized tilt command", async () => {
    async function runWakeTrace(): Promise<string> {
      const simulation = await TeetertownSimulation.create("tutorial-graybox");
      for (let step = 1; step <= 121; step += 1) {
        simulation.step(createTiltCommand(step, 0, 0));
      }
      expect(simulation.snapshot().bodies.find(({ id }) => id === "bottle")?.sleeping).toBe(true);
      let snapshot = simulation.step(createTiltCommand(122, 0.55, 0));
      expect(snapshot.bodies.find(({ id }) => id === "bottle")?.sleeping).toBe(false);
      for (let step = 123; step <= 150; step += 1) {
        snapshot = simulation.step(createTiltCommand(step, 0.55, 0));
      }
      const hash = hashSimulationSnapshot(snapshot);
      simulation.dispose();
      return hash;
    }

    await expect(runWakeTrace()).resolves.toBe(await runWakeTrace());
    await expect(runSleepingWakeProbe()).resolves.toEqual({
      sleepingBeforeCommand: true,
      sleepingAfterCommand: false,
      finalStateHash: "36f4ba00",
      summaryHash: "b3c1c78a"
    });
  });

  it("uses CCD to stop a high-speed body at a thin barrier", async () => {
    const result = await runCcdBarrierProbe();
    expect(result.discretePositionAfterOneStep).toBeGreaterThan(0.2);
    expect(result.ccdPositionAfterOneStep).toBeLessThan(0);
    expect(result.ccdPositionAfterTwoSteps).toBeLessThan(0);
    expect(Math.abs(result.ccdVelocityAfterTwoSteps)).toBeLessThan(0.001);
    expect(result.summaryHash).toMatch(/^[0-9a-f]{8}$/);
  });

  it("keeps a repeatedly reversed revolute joint finite and inside its visible limits", async () => {
    const first = await runJointReversalProbe();
    const second = await runJointReversalProbe();
    expect(second).toEqual(first);
    expect(first.finite).toBe(true);
    expect(first.minimumAngle).toBeGreaterThanOrEqual(-0.36);
    expect(first.maximumAngle).toBeLessThanOrEqual(0.36);
    expect(first.maximumAngularSpeed).toBeLessThan(2);
  });
});
