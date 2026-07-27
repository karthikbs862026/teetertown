import { DiagnosticRingBuffer } from "../analytics/diagnostics";
import { PointerInputOwner } from "../input/pointerInputOwner";
import { GameRenderer } from "../rendering/gameRenderer";
import { FixedStepClock } from "../simulation/fixedStepClock";
import { createTiltCommand } from "../simulation/inputCommand";
import { assertRapierBootstrap } from "../simulation/rapierBootstrap";
import {
  DEFAULT_EXPERIMENT_OPTIONS,
  TeetertownSimulation
} from "../simulation/teetertownSimulation";
import type { RuntimeExperimentOptions, SceneId, SimulationSnapshot } from "../simulation/types";
import { LAB_ENABLED } from "../simulation/version";

interface UiElements {
  readonly stage: HTMLElement;
  readonly status: HTMLElement;
  readonly metrics: HTMLElement;
  readonly restart: HTMLButtonElement;
  readonly pause: HTMLButtonElement;
  readonly debug: HTMLButtonElement;
  readonly labPanel: HTMLElement;
}

export class TeetertownApp {
  readonly #ui: UiElements;
  readonly #diagnostics = new DiagnosticRingBuffer();
  readonly #clock = new FixedStepClock();
  #options: RuntimeExperimentOptions = DEFAULT_EXPERIMENT_OPTIONS;
  #sceneId: SceneId = "tutorial-graybox";
  #renderer: GameRenderer | null = null;
  #simulation: TeetertownSimulation | null = null;
  #input: PointerInputOwner | null = null;
  #previous: SimulationSnapshot | null = null;
  #current: SimulationSnapshot | null = null;
  #animationFrame = 0;
  #lastFrameTime = performance.now();
  #paused = false;
  #debugVisible = LAB_ENABLED;
  #disposeLabControls: (() => void) | null = null;
  readonly #inputLatencySamples: number[] = [];
  #disposed = false;

  public constructor(root: HTMLElement) {
    this.#ui = this.#buildUi(root);
  }

  public async start(): Promise<void> {
    this.#setStatus("Booting deterministic physics…", "loading");
    const bootstrapHash = await assertRapierBootstrap();
    this.#diagnostics.record({
      category: "boot",
      code: "rapier_self_test_pass",
      severity: "info",
      fixedStep: null,
      fields: { hash: bootstrapHash }
    });
    this.#renderer = new GameRenderer(this.#ui.stage, this.#options.cameraModel);
    this.#renderer.setDebugVisible(this.#debugVisible);
    this.#input = new PointerInputOwner(this.#renderer.canvas, this.#options.inputModel);
    this.#wireLifecycle();
    await this.#loadScene();
    this.#lastFrameTime = performance.now();
    this.#animationFrame = requestAnimationFrame(this.#frame);
  }

  public dispose(): void {
    if (this.#disposed) {
      return;
    }
    cancelAnimationFrame(this.#animationFrame);
    window.removeEventListener("resize", this.#onResize);
    document.removeEventListener("visibilitychange", this.#onVisibilityChange);
    this.#input?.dispose();
    this.#disposeLabControls?.();
    this.#simulation?.dispose();
    this.#renderer?.dispose();
    this.#disposed = true;
  }

  async #loadScene(): Promise<void> {
    this.#setStatus("Loading risk fixture…", "loading");
    const prior = this.#simulation;
    this.#simulation = await TeetertownSimulation.create(this.#sceneId, this.#options);
    prior?.dispose();
    this.#renderer?.loadLevel(this.#simulation.level, this.#options.cameraModel);
    this.#renderer?.setDebugVisible(this.#debugVisible);
    this.#input?.setModel(this.#options.inputModel);
    this.#previous = this.#simulation.snapshot();
    this.#current = this.#previous;
    this.#clock.reset();
    this.#inputLatencySamples.length = 0;
    this.#paused = false;
    this.#ui.pause.textContent = "Pause";
    this.#setStatus(
      this.#sceneId === "tutorial-graybox"
        ? "Drag left to tilt right. Land the red apple in the mint basket."
        : "Internal risk fixtures active. Inspect the overlays and diagnostics.",
      "playing"
    );
    this.#updateMetrics();
  }

  readonly #frame = (timestamp: number): void => {
    if (this.#disposed) {
      return;
    }
    const deltaSeconds = (timestamp - this.#lastFrameTime) / 1000;
    this.#lastFrameTime = timestamp;
    const advance = this.#clock.advance(deltaSeconds, () => {
      if (this.#simulation === null) {
        return;
      }
      const sample = this.#input?.sample() ?? {
        x: 0,
        z: 0,
        active: false,
        sequence: 0,
        ageMilliseconds: 0
      };
      if (sample.active) {
        this.#inputLatencySamples.push(sample.ageMilliseconds);
        if (this.#inputLatencySamples.length > 256) {
          this.#inputLatencySamples.shift();
        }
      }
      this.#previous = this.#current ?? this.#simulation.snapshot();
      this.#current = this.#simulation.step(
        createTiltCommand(this.#simulation.snapshot().step + 1, sample.x, sample.z)
      );
      if (this.#current.result !== null) {
        this.#setStatus(
          this.#current.result.kind === "success"
            ? "Captured. The required object held below the speed threshold."
            : `Failure: ${this.#current.result.classification.replaceAll("_", " ")}.`,
          this.#current.result.kind
        );
      }
    });
    if (advance.clampedSeconds > 0) {
      this.#diagnostics.record({
        category: "runtime",
        code: "render_gap_clamped",
        severity: "warning",
        fixedStep: this.#current?.step ?? null,
        fields: { seconds: advance.clampedSeconds }
      });
    }
    if (this.#renderer !== null && this.#previous !== null && this.#current !== null) {
      this.#renderer.render(this.#previous, this.#current, advance.alpha);
    }
    this.#updateMetrics();
    this.#animationFrame = requestAnimationFrame(this.#frame);
  };

  #buildUi(root: HTMLElement): UiElements {
    root.innerHTML = `
      <main class="app-shell">
        <header class="topbar">
          <div>
            <p class="eyebrow">Phase 1 · Physics Trust Laboratory</p>
            <h1>Teetertown</h1>
          </div>
          <div class="status-pill" data-status="loading" aria-live="polite">Preparing…</div>
        </header>
        <section class="stage-wrap">
          <div class="stage"></div>
          <div class="gesture-hint" aria-hidden="true"><span>← drag to guide →</span></div>
          <div class="authority-legend" aria-label="Debug overlay legend">
            <span><i data-color="dynamic"></i>dynamic / collider</span>
            <span><i data-color="assist"></i>assist</span>
            <span><i data-color="constrained"></i>constrained / joint</span>
            <span><i data-color="contact"></i>contact normal</span>
            <span><i data-color="com"></i>center of mass</span>
          </div>
          <aside class="metrics" aria-label="Live simulation metrics"></aside>
        </section>
        <section class="controls" aria-label="Session controls">
          <button type="button" data-action="restart">Restart fixture</button>
          <button type="button" data-action="pause">Pause</button>
          <button type="button" data-action="debug">Collider overlay</button>
        </section>
        <section class="lab-panel" aria-label="Internal experiment controls"></section>
        <footer>
          Graybox evidence build · no monetization · no production deployment
        </footer>
      </main>
    `;
    const stage = root.querySelector<HTMLElement>(".stage");
    const status = root.querySelector<HTMLElement>(".status-pill");
    const metrics = root.querySelector<HTMLElement>(".metrics");
    const restart = root.querySelector<HTMLButtonElement>('[data-action="restart"]');
    const pause = root.querySelector<HTMLButtonElement>('[data-action="pause"]');
    const debug = root.querySelector<HTMLButtonElement>('[data-action="debug"]');
    const labPanel = root.querySelector<HTMLElement>(".lab-panel");
    if (
      stage === null ||
      status === null ||
      metrics === null ||
      restart === null ||
      pause === null ||
      debug === null ||
      labPanel === null
    ) {
      throw new Error("Teetertown UI failed to initialize.");
    }
    restart.addEventListener("click", () => {
      void this.#loadScene();
    });
    pause.addEventListener("click", () => {
      this.#togglePause();
    });
    debug.addEventListener("click", () => {
      this.#debugVisible = !this.#debugVisible;
      this.#renderer?.setDebugVisible(this.#debugVisible);
      debug.setAttribute("aria-pressed", String(this.#debugVisible));
    });
    if (__TEETERTOWN_LAB_ENABLED__) {
      void import("../devtools/labControls").then(({ mountLabControls }) => {
        this.#disposeLabControls = mountLabControls(
          labPanel,
          { sceneId: this.#sceneId, options: this.#options },
          (selection) => {
            this.#sceneId = selection.sceneId;
            this.#options = selection.options;
            void this.#loadScene();
          },
          () => {
            this.#exportDiagnostics();
          }
        );
      });
    } else {
      labPanel.hidden = true;
      debug.hidden = true;
      root.querySelector<HTMLElement>(".authority-legend")?.setAttribute("hidden", "");
    }
    return { stage, status, metrics, restart, pause, debug, labPanel };
  }

  #togglePause(): void {
    this.#paused = !this.#paused;
    if (this.#paused) {
      this.#clock.pause();
      this.#simulation?.pause();
      this.#input?.release();
      this.#ui.pause.textContent = "Resume";
      this.#setStatus("Paused. Simulation time is stopped.", "paused");
    } else {
      this.#simulation?.resume();
      this.#clock.resume();
      this.#ui.pause.textContent = "Pause";
      this.#setStatus("Playing.", "playing");
    }
  }

  #wireLifecycle(): void {
    window.addEventListener("resize", this.#onResize);
    document.addEventListener("visibilitychange", this.#onVisibilityChange);
    this.#renderer?.canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      this.#clock.pause();
      this.#simulation?.pause();
      this.#input?.release();
      this.#setStatus("WebGL context lost. Physics paused.", "failure");
    });
    this.#renderer?.canvas.addEventListener("webglcontextrestored", () => {
      void this.#loadScene();
    });
  }

  readonly #onResize = (): void => {
    this.#renderer?.resize();
  };

  readonly #onVisibilityChange = (): void => {
    if (document.hidden && !this.#paused) {
      this.#togglePause();
    }
  };

  #setStatus(message: string, state: string): void {
    this.#ui.status.textContent = message;
    this.#ui.status.dataset.status = state;
  }

  #updateMetrics(): void {
    if (this.#simulation === null || this.#renderer === null || this.#current === null) {
      return;
    }
    const counts = this.#renderer.resourceCounts(this.#simulation.resourceCounts());
    const hash = `${this.#current.step}:${this.#current.phase}`;
    const sortedLatency = [...this.#inputLatencySamples].sort((left, right) => left - right);
    const latencyIndex = Math.max(0, Math.ceil(sortedLatency.length * 0.95) - 1);
    const latencyP95 =
      sortedLatency.length === 0 ? "—" : `${Math.round(sortedLatency[latencyIndex] ?? 0)} ms`;
    this.#ui.metrics.innerHTML = `
      <span><b>${this.#current.step}</b> fixed steps</span>
      <span><b>${counts.awakeBodies}/${counts.bodies}</b> awake / bodies</span>
      <span><b>${counts.joints}</b> joints</span>
      <span><b>${counts.geometries}/${counts.materials}</b> geo / mat</span>
      <span><b>${latencyP95}</b> input sample age p95</span>
      <span><b>${this.#current.debugContacts.length}</b> contact normals</span>
      <span><b>${hash}</b> state marker</span>
    `;
  }

  #exportDiagnostics(): void {
    const payload = {
      exportedAt: new Date().toISOString(),
      sceneId: this.#sceneId,
      options: this.#options,
      snapshot: this.#current,
      resources:
        this.#simulation === null || this.#renderer === null
          ? null
          : this.#renderer.resourceCounts(this.#simulation.resourceCounts()),
      diagnostics: this.#diagnostics.entries()
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `teetertown-diagnostics-${this.#sceneId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
