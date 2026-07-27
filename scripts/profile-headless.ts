import { performance } from "node:perf_hooks";
import { createTiltCommand } from "../src/simulation/inputCommand";
import { TeetertownSimulation } from "../src/simulation/teetertownSimulation";

const options = {
  inputModel: "one_axis_raw",
  tiltImplementation: "gravity_vector",
  captureAuthority: "constrained",
  cameraModel: "orthographic_fixed"
} as const;

const warmup = await TeetertownSimulation.create("tutorial-graybox", options);
for (let step = 1; step <= 30; step += 1) {
  warmup.step(createTiltCommand(step, -0.55, 0));
}
warmup.dispose();

const timings: number[] = [];
const topology = new Set<string>();
for (let run = 0; run < 20; run += 1) {
  const simulation = await TeetertownSimulation.create("tutorial-graybox", options);
  const counts = simulation.resourceCounts();
  topology.add(`${counts.bodies}/${counts.colliders}/${counts.joints}`);
  for (let step = 1; step <= 200; step += 1) {
    const start = performance.now();
    simulation.step(createTiltCommand(step, -0.55, 0));
    timings.push(performance.now() - start);
  }
  simulation.dispose();
}

timings.sort((left, right) => left - right);
function percentile(value: number): number {
  const index = Math.max(0, Math.ceil(timings.length * value) - 1);
  return timings[index] ?? 0;
}

console.log(
  JSON.stringify(
    {
      environment: `Node ${process.version}; headless, not a browser or phone`,
      fixedSteps: timings.length,
      milliseconds: {
        p50: Number(percentile(0.5).toFixed(4)),
        p95: Number(percentile(0.95).toFixed(4)),
        p99: Number(percentile(0.99).toFixed(4)),
        maximum: Number((timings.at(-1) ?? 0).toFixed(4))
      },
      topology: [...topology]
    },
    null,
    2
  )
);
