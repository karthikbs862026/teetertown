import { describe, expect, it } from "vitest";
import { MemoryStorageAdapter } from "../../src/platform/storage";

describe("versioned local storage boundary", () => {
  it("round-trips envelopes without sharing mutable identity", async () => {
    const storage = new MemoryStorageAdapter();
    const value = {
      schemaVersion: 1,
      updatedAt: "2026-07-26T00:00:00.000Z",
      value: { completed: ["tutorial-graybox"] }
    };
    await storage.set("profile", value);
    const restored = await storage.get("profile");
    expect(restored).toEqual(value);
    expect(restored).not.toBe(value);
    await storage.delete("profile");
    expect(await storage.get("profile")).toBeNull();
    storage.close();
  });
});
