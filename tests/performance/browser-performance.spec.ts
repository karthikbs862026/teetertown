import { expect, test, type CDPSession, type Locator, type Page } from "@playwright/test";
import { gotoReadyGraybox } from "../support/appReady";

interface HeapUsage {
  readonly usedSize: number;
  readonly totalSize: number;
}

interface DomCounters {
  readonly documents: number;
  readonly nodes: number;
  readonly jsEventListeners: number;
}

interface ResourceEvidence {
  readonly bodies: number;
  readonly colliders: number;
  readonly joints: number;
  readonly geometries: number;
  readonly materials: number;
  readonly textures: number;
  readonly renderTargets: number;
  readonly listeners: number;
  readonly timers: number;
  readonly workers: number;
  readonly audioNodes: number;
}

interface FrameCadence {
  readonly samples: number;
  readonly p50Milliseconds: number;
  readonly p95Milliseconds: number;
  readonly p99Milliseconds: number;
  readonly maximumMilliseconds: number;
}

interface HeapStabilization {
  readonly baseline: HeapUsage;
  readonly samples: readonly HeapUsage[];
  readonly transitionCycles: number;
  readonly spanPercent: number;
  readonly elapsedSeconds: number;
}

interface SoakSample {
  readonly elapsedSeconds: number;
  readonly heap: HeapUsage;
  readonly resources: ResourceEvidence;
}

interface HeapNodeSummary {
  readonly count: number;
  readonly selfSize: number;
}

interface HeapNodeDelta extends HeapNodeSummary {
  readonly key: string;
}

const HEAP_DRIFT_REVIEW_PERCENT = 5;
const HEAP_STABILIZATION_SPAN_PERCENT = 3;
const WARMUP_CYCLES_PER_BATCH = 10;
const MINIMUM_WARMUP_BATCHES = 6;
const WARMUP_STABILIZATION_GRACE_SECONDS = 120;
const WARMUP_SAMPLE_RETENTION = 12;
const MINIMUM_SOAK_TRANSITION_CYCLES = 50;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function finiteNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${label} was not a finite number.`);
  }
  return value;
}

function parseHeapUsage(value: unknown): HeapUsage {
  if (!isRecord(value)) {
    throw new Error("Chrome heap usage response was invalid.");
  }
  return {
    usedSize: finiteNumber(value.usedSize, "usedSize"),
    totalSize: finiteNumber(value.totalSize, "totalSize")
  };
}

function parseDomCounters(value: unknown): DomCounters {
  if (!isRecord(value)) {
    throw new Error("Chrome DOM counter response was invalid.");
  }
  return {
    documents: finiteNumber(value.documents, "documents"),
    nodes: finiteNumber(value.nodes, "nodes"),
    jsEventListeners: finiteNumber(value.jsEventListeners, "jsEventListeners")
  };
}

async function heapUsage(session: CDPSession): Promise<HeapUsage> {
  await session.send("HeapProfiler.collectGarbage");
  const value: unknown = await session.send("Runtime.getHeapUsage");
  return parseHeapUsage(value);
}

async function medianHeapUsage(session: CDPSession): Promise<HeapUsage> {
  const samples: HeapUsage[] = [];
  for (let sample = 0; sample < 3; sample += 1) {
    samples.push(await heapUsage(session));
  }
  samples.sort((left, right) => left.usedSize - right.usedSize);
  return samples[1] ?? samples[0] ?? { usedSize: 0, totalSize: 0 };
}

async function domCounters(session: CDPSession): Promise<DomCounters> {
  const value: unknown = await session.send("Memory.getDOMCounters");
  return parseDomCounters(value);
}

function stringArray(value: unknown, label: string): readonly string[] {
  if (!Array.isArray(value)) {
    throw new Error(`${label} was not an array.`);
  }
  const items: unknown[] = value;
  const strings: string[] = [];
  for (const item of items) {
    if (typeof item !== "string") {
      throw new Error(`${label} contained a non-string value.`);
    }
    strings.push(item);
  }
  return strings;
}

function numberArray(value: unknown, label: string): readonly number[] {
  if (!Array.isArray(value)) {
    throw new Error(`${label} was not an array.`);
  }
  const items: unknown[] = value;
  const numbers: number[] = [];
  for (const item of items) {
    if (typeof item !== "number" || !Number.isFinite(item)) {
      throw new Error(`${label} contained a non-number value.`);
    }
    numbers.push(item);
  }
  return numbers;
}

function heapNodeSummary(value: unknown): Readonly<Record<string, HeapNodeSummary>> {
  if (!isRecord(value) || !isRecord(value.snapshot) || !isRecord(value.snapshot.meta)) {
    throw new Error("Chrome heap snapshot metadata was invalid.");
  }
  const fields = stringArray(value.snapshot.meta.node_fields, "Heap node fields");
  if (!Array.isArray(value.snapshot.meta.node_types)) {
    throw new Error("Heap node types were invalid.");
  }
  const nodeTypes: unknown[] = value.snapshot.meta.node_types;
  const types = stringArray(nodeTypes[0], "Heap node type names");
  const nodes = numberArray(value.nodes, "Heap nodes");
  const strings = stringArray(value.strings, "Heap strings");
  const typeIndex = fields.indexOf("type");
  const nameIndex = fields.indexOf("name");
  const selfSizeIndex = fields.indexOf("self_size");
  if (typeIndex < 0 || nameIndex < 0 || selfSizeIndex < 0) {
    throw new Error("Chrome heap snapshot omitted required node fields.");
  }
  const summaries = new Map<string, { count: number; selfSize: number }>();
  for (let offset = 0; offset < nodes.length; offset += fields.length) {
    const type = types[nodes[offset + typeIndex] ?? -1] ?? "unknown";
    const name = strings[nodes[offset + nameIndex] ?? -1] ?? "unknown";
    const selfSize = nodes[offset + selfSizeIndex] ?? 0;
    const key = `${type}:${name}`;
    const prior = summaries.get(key) ?? { count: 0, selfSize: 0 };
    prior.count += 1;
    prior.selfSize += selfSize;
    summaries.set(key, prior);
  }
  return Object.fromEntries(summaries);
}

async function takeHeapNodeSummary(
  session: CDPSession
): Promise<Readonly<Record<string, HeapNodeSummary>>> {
  const chunks: string[] = [];
  const handleChunk = (event: { readonly chunk: string }): void => {
    chunks.push(event.chunk);
  };
  session.on("HeapProfiler.addHeapSnapshotChunk", handleChunk);
  try {
    await session.send("HeapProfiler.enable");
    await session.send("HeapProfiler.collectGarbage");
    await session.send("HeapProfiler.takeHeapSnapshot", {
      reportProgress: false,
      captureNumericValue: true
    });
  } finally {
    session.off("HeapProfiler.addHeapSnapshotChunk", handleChunk);
  }
  const value: unknown = JSON.parse(chunks.join(""));
  return heapNodeSummary(value);
}

function positiveHeapNodeDeltas(
  baseline: Readonly<Record<string, HeapNodeSummary>>,
  final: Readonly<Record<string, HeapNodeSummary>>
): readonly HeapNodeDelta[] {
  return Object.entries(final)
    .map(([key, sample]) => ({
      key,
      count: sample.count - (baseline[key]?.count ?? 0),
      selfSize: sample.selfSize - (baseline[key]?.selfSize ?? 0)
    }))
    .filter((sample) => sample.count > 0 || sample.selfSize > 0)
    .sort((left, right) => right.selfSize - left.selfSize)
    .slice(0, 30);
}

async function resourceEvidence(metrics: Locator): Promise<ResourceEvidence> {
  return metrics.evaluate((element) => {
    const number = (name: string): number => {
      const value = element.getAttribute(`data-${name}`);
      if (value === null || !Number.isFinite(Number(value))) {
        throw new Error(`Missing numeric data-${name} metric.`);
      }
      return Number(value);
    };
    return {
      bodies: number("bodies"),
      colliders: number("colliders"),
      joints: number("joints"),
      geometries: number("geometries"),
      materials: number("materials"),
      textures: number("textures"),
      renderTargets: number("render-targets"),
      listeners: number("listeners"),
      timers: number("timers"),
      workers: number("workers"),
      audioNodes: number("audio-nodes")
    };
  });
}

function heapDriftPercent(baseline: HeapUsage, sample: HeapUsage): number {
  return baseline.usedSize === 0
    ? 0
    : ((sample.usedSize - baseline.usedSize) / baseline.usedSize) * 100;
}

function medianHeapSample(samples: readonly HeapUsage[]): HeapUsage {
  const sorted = [...samples].sort((left, right) => left.usedSize - right.usedSize);
  return sorted[Math.floor(sorted.length / 2)] ?? { usedSize: 0, totalSize: 0 };
}

async function reloadScenePair(page: Page): Promise<void> {
  await page.locator('select[data-lab="scene"]').selectOption("adversarial-lab");
  await expect(page.locator(".status-pill")).toContainText("Internal risk fixtures");
  await page.locator('select[data-lab="scene"]').selectOption("tutorial-graybox");
  await expect(page.locator(".status-pill")).toContainText("Drag left");
}

async function stabilizeHeap(
  page: Page,
  session: CDPSession,
  minimumWarmupSeconds: number
): Promise<HeapStabilization> {
  const startedAt = Date.now();
  const deadline = startedAt + (minimumWarmupSeconds + WARMUP_STABILIZATION_GRACE_SECONDS) * 1_000;
  const samples: HeapUsage[] = [];
  let batch = 0;
  while (Date.now() <= deadline) {
    batch += 1;
    for (let cycle = 0; cycle < WARMUP_CYCLES_PER_BATCH; cycle += 1) {
      await reloadScenePair(page);
      await page.waitForTimeout(50);
    }
    await waitForFreshFrames(page);
    samples.push(await medianHeapUsage(session));
    if (samples.length > WARMUP_SAMPLE_RETENTION) {
      samples.shift();
    }
    const elapsedSeconds = (Date.now() - startedAt) / 1_000;
    if (
      batch < MINIMUM_WARMUP_BATCHES ||
      samples.length < 3 ||
      elapsedSeconds < minimumWarmupSeconds
    ) {
      continue;
    }
    const recent = samples.slice(-3);
    const baseline = medianHeapSample(recent);
    const minimum = Math.min(...recent.map((sample) => sample.usedSize));
    const maximum = Math.max(...recent.map((sample) => sample.usedSize));
    const spanPercent =
      baseline.usedSize === 0 ? 0 : ((maximum - minimum) / baseline.usedSize) * 100;
    if (spanPercent <= HEAP_STABILIZATION_SPAN_PERCENT) {
      return {
        baseline,
        samples,
        transitionCycles: batch * WARMUP_CYCLES_PER_BATCH,
        spanPercent,
        elapsedSeconds
      };
    }
  }
  throw new Error(
    `Browser heap did not stabilize within ${minimumWarmupSeconds + WARMUP_STABILIZATION_GRACE_SECONDS} seconds: ${samples.map((sample) => sample.usedSize).join(", ")}`
  );
}

async function waitForFreshFrames(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve();
          });
        });
      })
  );
}

async function steadyFrameCadence(page: Page, sampleCount = 180): Promise<FrameCadence> {
  return page.evaluate(
    (expectedSamples) =>
      new Promise<FrameCadence>((resolve) => {
        const deltas: number[] = [];
        let previous: number | null = null;
        const sample = (timestamp: number): void => {
          if (previous !== null) {
            deltas.push(timestamp - previous);
          }
          previous = timestamp;
          if (deltas.length < expectedSamples) {
            requestAnimationFrame(sample);
            return;
          }
          const sorted = [...deltas].sort((left, right) => left - right);
          const percentile = (fraction: number): number => {
            const index = Math.max(0, Math.ceil(sorted.length * fraction) - 1);
            return sorted[index] ?? 0;
          };
          resolve({
            samples: sorted.length,
            p50Milliseconds: percentile(0.5),
            p95Milliseconds: percentile(0.95),
            p99Milliseconds: percentile(0.99),
            maximumMilliseconds: sorted.at(-1) ?? 0
          });
        };
        requestAnimationFrame(sample);
      }),
    sampleCount
  );
}

test("records frame, first-interaction, heap, resource, and bounded-soak evidence", async ({
  page
}, testInfo) => {
  const soakSeconds = Number(process.env.TEETERTOWN_SOAK_SECONDS ?? "30");
  if (!Number.isFinite(soakSeconds) || soakSeconds < 10) {
    throw new Error("TEETERTOWN_SOAK_SECONDS must be a finite value of at least 10 seconds.");
  }
  const defaultWarmupSeconds = soakSeconds >= 1_200 ? 300 : 0;
  const minimumWarmupSeconds = Number(
    process.env.TEETERTOWN_WARMUP_SECONDS ?? String(defaultWarmupSeconds)
  );
  if (!Number.isFinite(minimumWarmupSeconds) || minimumWarmupSeconds < 0) {
    throw new Error("TEETERTOWN_WARMUP_SECONDS must be a finite non-negative value.");
  }
  test.setTimeout(
    (soakSeconds + minimumWarmupSeconds + WARMUP_STABILIZATION_GRACE_SECONDS + 120) * 1_000
  );

  await gotoReadyGraybox(page);
  const metrics = page.locator(".metrics");
  await expect
    .poll(async () => Number(await metrics.getAttribute("data-frame-samples")), {
      timeout: 15_000
    })
    .toBeGreaterThanOrEqual(120);

  const session = await page.context().newCDPSession(page);
  const initialHeap = await medianHeapUsage(session);
  const heapStabilization = await stabilizeHeap(page, session, minimumWarmupSeconds);

  const steadyFrames = await steadyFrameCadence(page);
  const baselineResources = await resourceEvidence(metrics);
  const heapDiagnosticsEnabled = process.env.TEETERTOWN_HEAP_DIAGNOSTICS === "1";
  const baselineHeapNodes = heapDiagnosticsEnabled ? await takeHeapNodeSummary(session) : null;
  const baselineHeap = await medianHeapUsage(session);
  const baselineDom = await domCounters(session);
  const soakStartedAt = Date.now();
  const endAt = soakStartedAt + soakSeconds * 1_000;
  const sampleIntervalMilliseconds = (soakSeconds * 1_000) / 4;
  let nextSampleAt = soakStartedAt + sampleIntervalMilliseconds;
  const soakSamples: SoakSample[] = [];
  let transitions = 0;
  while (Date.now() < endAt || transitions / 2 < MINIMUM_SOAK_TRANSITION_CYCLES) {
    await reloadScenePair(page);
    transitions += 2;
    if (Date.now() >= nextSampleAt) {
      soakSamples.push({
        elapsedSeconds: (Date.now() - soakStartedAt) / 1_000,
        heap: await medianHeapUsage(session),
        resources: await resourceEvidence(metrics)
      });
      nextSampleAt += sampleIntervalMilliseconds;
    }
    await page.waitForTimeout(100);
  }
  await waitForFreshFrames(page);

  const finalResources = await resourceEvidence(metrics);
  const finalHeap = await medianHeapUsage(session);
  const finalDom = await domCounters(session);
  const finalHeapNodes = heapDiagnosticsEnabled ? await takeHeapNodeSummary(session) : null;
  const finalHeapDriftPercent = heapDriftPercent(baselineHeap, finalHeap);
  const maximumObservedHeapDriftPercent = Math.max(
    finalHeapDriftPercent,
    ...soakSamples.map((sample) => heapDriftPercent(baselineHeap, sample.heap))
  );
  const browserMetrics = await metrics.evaluate((element) => ({
    firstMeaningfulInteractionMilliseconds: Number(
      element.getAttribute("data-first-meaningful-interaction-ms")
    ),
    frameSamples: Number(element.getAttribute("data-frame-samples")),
    frameP50Milliseconds: Number(element.getAttribute("data-frame-p50-ms")),
    frameP95Milliseconds: Number(element.getAttribute("data-frame-p95-ms")),
    frameP99Milliseconds: Number(element.getAttribute("data-frame-p99-ms")),
    frameMaximumMilliseconds: Number(element.getAttribute("data-frame-maximum-ms")),
    physicsP95Milliseconds: Number(element.getAttribute("data-physics-p95-ms")),
    longTaskCount: Number(element.getAttribute("data-long-task-count")),
    longTaskMilliseconds: Number(element.getAttribute("data-long-task-milliseconds")),
    drawCalls: Number(element.getAttribute("data-draw-calls")),
    triangles: Number(element.getAttribute("data-triangles"))
  }));
  const evidence = {
    environment: "Playwright Chromium desktop; not a physical mobile device",
    soakSeconds,
    transitions,
    steadyFrames,
    transitionStressMetrics: browserMetrics,
    initialHeap,
    heapStabilization,
    baselineHeap,
    soakSamples,
    finalHeap,
    finalHeapDriftPercent,
    maximumObservedHeapDriftPercent,
    baselineDom,
    finalDom,
    baselineResources,
    finalResources,
    heapNodeDeltas:
      baselineHeapNodes === null || finalHeapNodes === null
        ? null
        : positiveHeapNodeDeltas(baselineHeapNodes, finalHeapNodes)
  };
  console.log(JSON.stringify(evidence, null, 2));
  await testInfo.attach("browser-performance-evidence", {
    body: Buffer.from(JSON.stringify(evidence, null, 2)),
    contentType: "application/json"
  });

  expect(browserMetrics.firstMeaningfulInteractionMilliseconds).toBeGreaterThan(0);
  expect(browserMetrics.firstMeaningfulInteractionMilliseconds).toBeLessThanOrEqual(5_000);
  expect(browserMetrics.frameSamples).toBeGreaterThanOrEqual(120);
  expect(steadyFrames.samples).toBe(180);
  expect(steadyFrames.p95Milliseconds).toBeLessThanOrEqual(100);
  expect(browserMetrics.physicsP95Milliseconds).toBeLessThanOrEqual(8);
  expect(browserMetrics.drawCalls).toBeLessThanOrEqual(30);
  expect(browserMetrics.triangles).toBeLessThanOrEqual(50_000);
  for (const sample of soakSamples) {
    expect(sample.resources).toEqual(baselineResources);
  }
  expect(finalResources).toEqual(baselineResources);
  expect(finalDom.documents).toBe(baselineDom.documents);
  expect(finalDom.nodes).toBeLessThanOrEqual(baselineDom.nodes);
  expect(finalDom.jsEventListeners).toBeLessThanOrEqual(baselineDom.jsEventListeners);
  expect(finalHeapDriftPercent).toBeLessThanOrEqual(HEAP_DRIFT_REVIEW_PERCENT);
  expect(maximumObservedHeapDriftPercent).toBeLessThanOrEqual(HEAP_DRIFT_REVIEW_PERCENT);
});
