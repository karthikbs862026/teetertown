import { describe, expect, it } from "vitest";
import { orthographicFrustumForAspect } from "../../src/rendering/cameraFrustum";

describe("orthographic camera frustum", () => {
  it("preserves the minimum horizontal gameplay extent on a narrow phone", () => {
    const frustum = orthographicFrustumForAspect(0.46);
    expect(frustum.left).toBe(-5.3);
    expect(frustum.right).toBe(5.3);
    expect(frustum.top).toBeGreaterThan(11.5);
  });

  it("preserves the vertical extent on a wide viewport", () => {
    const frustum = orthographicFrustumForAspect(16 / 9);
    expect(frustum.top).toBe(5.3);
    expect(frustum.bottom).toBe(-5.3);
    expect(frustum.right).toBeGreaterThan(9.4);
  });
});
