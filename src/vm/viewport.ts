import type { Point, Viewport } from './types';

export function worldToScreen(viewport: Viewport, world: Point): Point {
  return {
    x: world.x * viewport.scale + viewport.offsetX,
    y: world.y * viewport.scale + viewport.offsetY,
  };
}

export function screenToWorld(viewport: Viewport, screen: Point): Point {
  return {
    x: (screen.x - viewport.offsetX) / viewport.scale,
    y: (screen.y - viewport.offsetY) / viewport.scale,
  };
}
