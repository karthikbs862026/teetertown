const SAMPLE_CAPACITY = 2_048;

export interface SampleSummary {
  readonly count: number;
  readonly p50: number;
  readonly p95: number;
  readonly p99: number;
  readonly maximum: number;
}

export interface RuntimePerformanceSummary {
  readonly frame: SampleSummary;
  readonly physics: SampleSummary;
  readonly firstMeaningfulInteractionMilliseconds: number | null;
  readonly longTaskCount: number;
  readonly longTaskMilliseconds: number;
}

class NumericRingBuffer {
  readonly #values: Float64Array;
  #length = 0;
  #next = 0;

  public constructor(capacity: number) {
    this.#values = new Float64Array(capacity);
  }

  public push(value: number): void {
    if (!Number.isFinite(value) || value < 0) {
      return;
    }
    this.#values[this.#next] = value;
    this.#next = (this.#next + 1) % this.#values.length;
    this.#length = Math.min(this.#length + 1, this.#values.length);
  }

  public sortedValues(): number[] {
    const values = new Array<number>(this.#length);
    const oldest = this.#length === this.#values.length ? this.#next : 0;
    for (let index = 0; index < this.#length; index += 1) {
      values[index] = this.#values[(oldest + index) % this.#values.length] ?? 0;
    }
    return values.sort((left, right) => left - right);
  }
}

function percentile(sorted: readonly number[], fraction: number): number {
  if (sorted.length === 0) {
    return 0;
  }
  const index = Math.max(0, Math.ceil(sorted.length * fraction) - 1);
  return sorted[index] ?? 0;
}

export function summarizeSamples(values: readonly number[]): SampleSummary {
  const sorted = [...values].sort((left, right) => left - right);
  return {
    count: sorted.length,
    p50: percentile(sorted, 0.5),
    p95: percentile(sorted, 0.95),
    p99: percentile(sorted, 0.99),
    maximum: sorted.at(-1) ?? 0
  };
}

export class RuntimePerformanceSampler {
  readonly #frameSamples = new NumericRingBuffer(SAMPLE_CAPACITY);
  readonly #physicsSamples = new NumericRingBuffer(SAMPLE_CAPACITY);
  readonly #longTaskObserver: PerformanceObserver | null;
  #firstMeaningfulInteractionMilliseconds: number | null = null;
  #longTaskCount = 0;
  #longTaskMilliseconds = 0;

  public constructor() {
    if (
      typeof PerformanceObserver !== "undefined" &&
      PerformanceObserver.supportedEntryTypes.includes("longtask")
    ) {
      this.#longTaskObserver = new PerformanceObserver((entries) => {
        for (const entry of entries.getEntries()) {
          this.#longTaskCount += 1;
          this.#longTaskMilliseconds += entry.duration;
        }
      });
      this.#longTaskObserver.observe({ type: "longtask", buffered: true });
    } else {
      this.#longTaskObserver = null;
    }
  }

  public recordFrame(milliseconds: number): void {
    if (milliseconds > 0) {
      this.#frameSamples.push(milliseconds);
    }
  }

  public recordPhysicsStep(milliseconds: number): void {
    this.#physicsSamples.push(milliseconds);
  }

  public markFirstMeaningfulInteraction(millisecondsSinceNavigation: number): void {
    if (
      this.#firstMeaningfulInteractionMilliseconds === null &&
      Number.isFinite(millisecondsSinceNavigation) &&
      millisecondsSinceNavigation >= 0
    ) {
      this.#firstMeaningfulInteractionMilliseconds = millisecondsSinceNavigation;
    }
  }

  public summary(): RuntimePerformanceSummary {
    return {
      frame: summarizeSamples(this.#frameSamples.sortedValues()),
      physics: summarizeSamples(this.#physicsSamples.sortedValues()),
      firstMeaningfulInteractionMilliseconds: this.#firstMeaningfulInteractionMilliseconds,
      longTaskCount: this.#longTaskCount,
      longTaskMilliseconds: this.#longTaskMilliseconds
    };
  }

  public dispose(): void {
    this.#longTaskObserver?.disconnect();
  }
}
