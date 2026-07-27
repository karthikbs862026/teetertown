export interface OrthographicFrustum {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

export function orthographicFrustumForAspect(
  aspect: number,
  minimumHalfExtent = 5.3
): OrthographicFrustum {
  if (!(aspect > 0) || !Number.isFinite(aspect)) {
    throw new Error("Camera aspect must be a finite positive number.");
  }
  if (!(minimumHalfExtent > 0) || !Number.isFinite(minimumHalfExtent)) {
    throw new Error("Minimum camera half-extent must be a finite positive number.");
  }

  const halfWidth = aspect < 1 ? minimumHalfExtent : minimumHalfExtent * aspect;
  const halfHeight = aspect < 1 ? minimumHalfExtent / aspect : minimumHalfExtent;
  return {
    left: -halfWidth,
    right: halfWidth,
    top: halfHeight,
    bottom: -halfHeight
  };
}
