import { createTiltCommand } from "../simulation/inputCommand";
import { assertRapierBootstrap } from "../simulation/rapierBootstrap";
import { hashSimulationSnapshot } from "../simulation/stableHash";
import {
  DEFAULT_EXPERIMENT_OPTIONS,
  TeetertownSimulation
} from "../simulation/teetertownSimulation";
import type { SessionResult } from "../simulation/types";
import { RAPIER_RUNTIME_VARIANT } from "../simulation/version";

export interface BrowserParityResult {
  readonly bootstrapHash: string;
  readonly runtimeVariant: string;
  readonly finalStep: number;
  readonly finalStateHash: string;
  readonly result: SessionResult | null;
}

export async function runBrowserGoldenParity(): Promise<BrowserParityResult> {
  const bootstrapHash = await assertRapierBootstrap();
  const simulation = await TeetertownSimulation.create(
    "tutorial-graybox",
    DEFAULT_EXPERIMENT_OPTIONS
  );
  let snapshot = simulation.snapshot();
  for (let step = 1; step <= 500 && snapshot.result === null; step += 1) {
    snapshot = simulation.step(createTiltCommand(step, -0.55, 0));
  }
  const result = {
    bootstrapHash,
    runtimeVariant: RAPIER_RUNTIME_VARIANT,
    finalStep: snapshot.step,
    finalStateHash: hashSimulationSnapshot(snapshot),
    result: snapshot.result
  };
  simulation.dispose();
  return result;
}

declare global {
  interface Window {
    __TEETERTOWN_LAB_API__?: {
      readonly runGoldenParity: typeof runBrowserGoldenParity;
    };
  }
}

export function mountBrowserParityApi(): () => void {
  window.__TEETERTOWN_LAB_API__ = {
    runGoldenParity: runBrowserGoldenParity
  };
  return () => {
    delete window.__TEETERTOWN_LAB_API__;
  };
}
