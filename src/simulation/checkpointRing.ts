export interface TimedCheckpoint<T> {
  readonly step: number;
  readonly value: T;
}

export class CheckpointRing<T> {
  readonly #capacity: number;
  readonly #items: TimedCheckpoint<T>[] = [];

  public constructor(capacity: number) {
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw new Error("Checkpoint ring capacity must be a positive integer.");
    }
    this.#capacity = capacity;
  }

  public get size(): number {
    return this.#items.length;
  }

  public push(checkpoint: TimedCheckpoint<T>): void {
    this.#items.push(checkpoint);
    if (this.#items.length > this.#capacity) {
      this.#items.shift();
    }
  }

  public latestAtOrBefore(step: number): TimedCheckpoint<T> | null {
    for (let index = this.#items.length - 1; index >= 0; index -= 1) {
      const item = this.#items[index];
      if (item !== undefined && item.step <= step) {
        return item;
      }
    }
    return null;
  }

  public clear(): void {
    this.#items.length = 0;
  }
}
