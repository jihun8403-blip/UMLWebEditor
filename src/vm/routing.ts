import type { Point, Project, Relationship, UmlElement } from './types';

export function orthogonalRoute(source: Point, target: Point): Point[] {
  // MVP: L-shape using mid X then Y. No obstacle avoidance.
  const mid: Point = { x: target.x, y: source.y };
  return [source, mid, target];
}

function center(el: UmlElement): Point {
  return { x: el.position.x + el.size.width / 2, y: el.position.y + el.size.height / 2 };
}

function anchorToward(el: UmlElement, toward: Point): Point {
  const c = center(el);
  const dx = toward.x - c.x;
  const dy = toward.y - c.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    // left/right
    if (dx >= 0) return { x: el.position.x + el.size.width, y: c.y };
    return { x: el.position.x, y: c.y };
  }
  // top/bottom
  if (dy >= 0) return { x: c.x, y: el.position.y + el.size.height };
  return { x: c.x, y: el.position.y };
}

export function recomputeRelationshipRouting(project: Project, rel: Relationship): Relationship {
  const src = project.elements.find((e) => e.id === rel.sourceId);
  const tgt = project.elements.find((e) => e.id === rel.targetId);
  if (!src || !tgt) return rel;

  const srcCenter = center(src);
  const tgtCenter = center(tgt);
  const srcAnchor = anchorToward(src, tgtCenter);
  const tgtAnchor = anchorToward(tgt, srcCenter);

  const points = orthogonalRoute(srcAnchor, tgtAnchor);
  return { ...rel, routing: { points } };
}

export function recomputeRoutingForElementIds(project: Project, elementIds: Set<string>): Project {
  if (elementIds.size === 0) return project;
  const relationships = project.relationships.map((r) => {
    if (elementIds.has(r.sourceId) || elementIds.has(r.targetId)) {
      return recomputeRelationshipRouting(project, r);
    }
    return r;
  });
  return { ...project, relationships };
}

export function recomputeAllRouting(project: Project): Project {
  if (project.relationships.length === 0) return project;
  const relationships = project.relationships.map((r) => recomputeRelationshipRouting(project, r));
  return { ...project, relationships };
}
