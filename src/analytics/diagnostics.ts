export type DiagnosticSeverity = "debug" | "info" | "warning" | "error" | "critical";

export interface DiagnosticEntry {
  readonly sequence: number;
  readonly category: string;
  readonly code: string;
  readonly severity: DiagnosticSeverity;
  readonly fixedStep: number | null;
  readonly fields: Readonly<Record<string, string | number | boolean | null>>;
}

export interface DiagnosticSink {
  record(entry: Omit<DiagnosticEntry, "sequence">): void;
  entries(): readonly DiagnosticEntry[];
  clear(): void;
}

export class DiagnosticRingBuffer implements DiagnosticSink {
  readonly #capacity: number;
  readonly #entries: DiagnosticEntry[] = [];
  #sequence = 0;

  public constructor(capacity = 256) {
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw new Error("Diagnostic capacity must be a positive integer.");
    }
    this.#capacity = capacity;
  }

  public record(entry: Omit<DiagnosticEntry, "sequence">): void {
    this.#entries.push({ ...entry, sequence: this.#sequence });
    this.#sequence += 1;
    if (this.#entries.length > this.#capacity) {
      this.#entries.shift();
    }
  }

  public entries(): readonly DiagnosticEntry[] {
    return this.#entries;
  }

  public clear(): void {
    this.#entries.length = 0;
  }
}
