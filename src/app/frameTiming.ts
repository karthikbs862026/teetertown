export function animationFrameDeltaSeconds(
  previousTimestamp: number | null,
  timestamp: number
): number {
  if (
    previousTimestamp === null ||
    !Number.isFinite(previousTimestamp) ||
    !Number.isFinite(timestamp) ||
    timestamp < previousTimestamp
  ) {
    return 0;
  }
  return (timestamp - previousTimestamp) / 1000;
}
