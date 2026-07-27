export interface StoredEnvelope {
  readonly schemaVersion: number;
  readonly updatedAt: string;
  readonly value: unknown;
}

export interface VersionedStorage {
  get(key: string): Promise<StoredEnvelope | null>;
  set(key: string, value: StoredEnvelope): Promise<void>;
  delete(key: string): Promise<void>;
  close(): void;
}

export class MemoryStorageAdapter implements VersionedStorage {
  readonly #values = new Map<string, StoredEnvelope>();

  public async get(key: string): Promise<StoredEnvelope | null> {
    const value = this.#values.get(key);
    return Promise.resolve(value === undefined ? null : structuredClone(value));
  }

  public async set(key: string, value: StoredEnvelope): Promise<void> {
    this.#values.set(key, structuredClone(value));
    await Promise.resolve();
  }

  public async delete(key: string): Promise<void> {
    this.#values.delete(key);
    await Promise.resolve();
  }

  public close(): void {
    this.#values.clear();
  }
}

export class IndexedDbStorageAdapter implements VersionedStorage {
  readonly #databasePromise: Promise<IDBDatabase>;

  public constructor(databaseName = "teetertown-local", databaseVersion = 1) {
    this.#databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(databaseName, databaseVersion);
      request.addEventListener("upgradeneeded", () => {
        if (!request.result.objectStoreNames.contains("records")) {
          request.result.createObjectStore("records");
        }
      });
      request.addEventListener("success", () => {
        resolve(request.result);
      });
      request.addEventListener("error", () => {
        reject(request.error ?? new Error("IndexedDB open failed."));
      });
    });
  }

  public async get(key: string): Promise<StoredEnvelope | null> {
    const result: unknown = await this.#request("readonly", (store) => store.get(key));
    if (typeof result !== "object" || result === null) {
      return null;
    }
    if (!("schemaVersion" in result) || !("updatedAt" in result) || !("value" in result)) {
      throw new Error(`Stored record ${key} has an invalid envelope.`);
    }
    const record = result;
    if (typeof record.schemaVersion !== "number" || typeof record.updatedAt !== "string") {
      throw new Error(`Stored record ${key} has an invalid envelope.`);
    }
    return {
      schemaVersion: record.schemaVersion,
      updatedAt: record.updatedAt,
      value: record.value
    };
  }

  public async set(key: string, value: StoredEnvelope): Promise<void> {
    await this.#request("readwrite", (store) => store.put(value, key));
  }

  public async delete(key: string): Promise<void> {
    await this.#request("readwrite", (store) => store.delete(key));
  }

  public close(): void {
    void this.#databasePromise.then((database) => {
      database.close();
    });
  }

  async #request(
    mode: IDBTransactionMode,
    create: (store: IDBObjectStore) => IDBRequest
  ): Promise<unknown> {
    const database = await this.#databasePromise;
    return new Promise((resolve, reject) => {
      const transaction = database.transaction("records", mode);
      const request = create(transaction.objectStore("records"));
      request.addEventListener("success", () => {
        resolve(request.result);
      });
      request.addEventListener("error", () => {
        reject(request.error ?? new Error("IndexedDB request failed."));
      });
    });
  }
}
