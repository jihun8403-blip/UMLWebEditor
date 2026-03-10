import type { Point } from './types';

export function orthogonalRoute(source: Point, target: Point): Point[] {
  // MVP: L-shape using mid X then Y. No obstacle avoidance.
  const mid: Point = { x: target.x, y: source.y };
  return [source, mid, target];
}
