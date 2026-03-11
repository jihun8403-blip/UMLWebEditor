import React, { useEffect, useMemo, useRef } from 'react';
import { useEditorStore } from '../vm/store';
import { worldToScreen, screenToWorld } from '../vm/viewport';
import type { Point } from '../vm/types';

export function CanvasView() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const setViewport = useEditorStore((s) => s.setViewport);
  const setSelection = useEditorStore((s) => s.setSelection);
  const setRelationshipSelection = useEditorStore((s) => s.setRelationshipSelection);
  const moveSelected = useEditorStore((s) => s.moveSelectedBy);
  const commitMoveSelected = useEditorStore((s) => s.commitMoveSelected);
  const resizeSelected = useEditorStore((s) => s.resizeSelectedBy);
  const commitResizeSelected = useEditorStore((s) => s.commitResizeSelected);
  const startRelationshipFrom = useEditorStore((s) => s.startRelationshipFrom);
  const clearRelationshipDraft = useEditorStore((s) => s.clearRelationshipDraft);
  const createRelationship = useEditorStore((s) => s.createRelationship);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const getState = () => useEditorStore.getState();

    let selectionBox: { a: Point; b: Point } | null = null;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * window.devicePixelRatio));
      canvas.height = Math.max(1, Math.floor(rect.height * window.devicePixelRatio));
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      draw();
    };

    const drawGrid = (ctx: CanvasRenderingContext2D) => {
      const { project } = getState();
      const { scale, offsetX, offsetY } = project.viewport;
      const dpr = window.devicePixelRatio || 1;
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      const grid = 40;
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;

      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      const startX = (-offsetX / scale) % grid;
      const startY = (-offsetY / scale) % grid;

      for (let x = startX; x < w; x += grid) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = startY; y < h; y += grid) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      ctx.restore();
    };

    const draw = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { project, ui } = getState();
      const pendingSourceId = ui.relationship.pendingSourceId;
      const visibleElements = project.elements.filter((e) => e.diagramType === project.diagramType);
      const visibleRelationships = project.relationships.filter((r) => r.diagramType === project.diagramType);

      drawGrid(ctx);

      const dpr = window.devicePixelRatio || 1;
      ctx.save();
      ctx.scale(dpr, dpr);

      // relationships
      for (const rel of visibleRelationships) {
        const routing = rel.routing;
        if (!routing || routing.points.length < 2) continue;
        ctx.strokeStyle = ui.selection.relationshipId === rel.id ? '#2563eb' : '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        routing.points.forEach((p, idx) => {
          const sp = worldToScreen(project.viewport, p);
          if (idx === 0) ctx.moveTo(sp.x, sp.y);
          else ctx.lineTo(sp.x, sp.y);
        });
        ctx.stroke();

        if (rel.label) {
          const midIdx = Math.floor(routing.points.length / 2);
          const mp = worldToScreen(project.viewport, routing.points[midIdx]!);
          ctx.fillStyle = '#334155';
          ctx.font = `${12 * project.viewport.scale}px system-ui`;
          ctx.fillText(rel.label, mp.x + 6 * project.viewport.scale, mp.y - 6 * project.viewport.scale);
        }
      }

      // elements
      for (const el of visibleElements) {
        const p = worldToScreen(project.viewport, el.position);
        const size = { w: el.size.width * project.viewport.scale, h: el.size.height * project.viewport.scale };

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = ui.selection.elementIds.has(el.id) || pendingSourceId === el.id ? '#2563eb' : '#64748b';
        ctx.lineWidth = ui.selection.elementIds.has(el.id) ? 3 : 2;

        ctx.beginPath();
        ctx.roundRect(p.x, p.y, size.w, size.h, 8);
        ctx.fill();
        ctx.stroke();

        const padX = 10 * project.viewport.scale;
        const nameY = p.y + 22 * project.viewport.scale;

        ctx.fillStyle = '#0f172a';
        ctx.font = `${14 * project.viewport.scale}px system-ui`;
        ctx.fillText(el.name ?? el.type, p.x + padX, nameY);

        let cursorY = nameY + 18 * project.viewport.scale;

        if (el.stereotype) {
          ctx.fillStyle = '#475569';
          ctx.font = `${12 * project.viewport.scale}px system-ui`;
          ctx.fillText(`<<${el.stereotype}>>`, p.x + 10 * project.viewport.scale, p.y + 40 * project.viewport.scale);
          cursorY = Math.max(cursorY, p.y + 58 * project.viewport.scale);
        }

        const isClassLike = el.type === 'class' || el.type === 'interface' || el.type === 'abstractClass';
        if (isClassLike) {
          const showAttrs = el.showAttributes ?? true;
          const showMethods = el.showMethods ?? true;
          const textX = p.x + padX;
          const lineH = 16 * project.viewport.scale;
          ctx.fillStyle = '#0f172a';
          ctx.font = `${12 * project.viewport.scale}px system-ui`;

          if (showAttrs) {
            const attrs = el.attributes ?? [];
            for (const a of attrs.slice(0, 6)) {
              const vis = a.visibility === 'public' ? '+' : a.visibility === 'private' ? '-' : '#';
              const label = `${vis} ${a.name}: ${a.type}`;
              ctx.fillText(label, textX, cursorY);
              cursorY += lineH;
            }
          }

          if (showMethods) {
            const methods = el.methods ?? [];
            for (const m of methods.slice(0, 6)) {
              const vis = m.visibility === 'public' ? '+' : m.visibility === 'private' ? '-' : '#';
              const label = `${vis} ${m.name}(): ${m.returnType}`;
              ctx.fillText(label, textX, cursorY);
              cursorY += lineH;
            }
          }
        }

        if (ui.selection.elementIds.has(el.id) && ui.selection.elementIds.size === 1) {
          const hs = 10;
          const handles = [
            { x: p.x - hs / 2, y: p.y - hs / 2 },
            { x: p.x + size.w - hs / 2, y: p.y - hs / 2 },
            { x: p.x - hs / 2, y: p.y + size.h - hs / 2 },
            { x: p.x + size.w - hs / 2, y: p.y + size.h - hs / 2 },
          ];
          ctx.fillStyle = '#2563eb';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          for (const h of handles) {
            ctx.fillRect(h.x, h.y, hs, hs);
            ctx.strokeRect(h.x + 1, h.y + 1, hs - 2, hs - 2);
          }
        }
      }

      // selection box overlay
      if (selectionBox) {
        const x = Math.min(selectionBox.a.x, selectionBox.b.x);
        const y = Math.min(selectionBox.a.y, selectionBox.b.y);
        const w = Math.abs(selectionBox.a.x - selectionBox.b.x);
        const h = Math.abs(selectionBox.a.y - selectionBox.b.y);
        ctx.save();
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(x, y, w, h);
        ctx.fillStyle = 'rgba(37, 99, 235, 0.08)';
        ctx.fillRect(x, y, w, h);
        ctx.restore();
      }

      ctx.restore();
    };

    const rafDraw = () => requestAnimationFrame(draw);

    resize();
    window.addEventListener('resize', resize);

    // pointer interaction
    let dragging = false;
    let resizing = false;
    let selecting = false;
    let resizeHandle: 'nw' | 'ne' | 'sw' | 'se' | null = null;
    let last: Point | null = null;
    let dragPrevPositions: Record<string, Point> | null = null;
    let resizePrevRects: Record<string, { x: number; y: number; width: number; height: number }> | null = null;

    const dragThresholdPx = 4;

    let pendingDrag:
      | {
          start: Point;
          ids: Set<string>;
          prev: Record<string, Point>;
          moved: boolean;
        }
      | null = null;

    const getSingleSelectedElement = () => {
      const { project, ui } = getState();
      const ids = Array.from(ui.selection.elementIds);
      if (ids.length !== 1) return null;
      const id = ids[0]!;
      return project.elements.find((e) => e.id === id) ?? null;
    };

    const hitResizeHandle = (world: Point): 'nw' | 'ne' | 'sw' | 'se' | null => {
      const el = getSingleSelectedElement();
      if (!el) return null;
      const { project } = getState();
      const hs = 10 / project.viewport.scale;
      const half = hs / 2;

      const x0 = el.position.x;
      const y0 = el.position.y;
      const x1 = el.position.x + el.size.width;
      const y1 = el.position.y + el.size.height;

      const inRect = (x: number, y: number) => world.x >= x - half && world.y >= y - half && world.x <= x + half && world.y <= y + half;
      if (inRect(x0, y0)) return 'nw';
      if (inRect(x1, y0)) return 'ne';
      if (inRect(x0, y1)) return 'sw';
      if (inRect(x1, y1)) return 'se';
      return null;
    };

    const hitTest = (world: Point) => {
      const { project } = getState();
      const els = project.elements.filter((e) => e.diagramType === project.diagramType);
      for (let i = els.length - 1; i >= 0; i--) {
        const el = els[i];
        if (
          world.x >= el.position.x &&
          world.y >= el.position.y &&
          world.x <= el.position.x + el.size.width &&
          world.y <= el.position.y + el.size.height
        ) {
          return el.id;
        }
      }
      return null;
    };

    const distancePointToSegment = (p: Point, a: Point, b: Point) => {
      const vx = b.x - a.x;
      const vy = b.y - a.y;
      const wx = p.x - a.x;
      const wy = p.y - a.y;
      const c1 = vx * wx + vy * wy;
      if (c1 <= 0) return Math.hypot(p.x - a.x, p.y - a.y);
      const c2 = vx * vx + vy * vy;
      if (c2 <= c1) return Math.hypot(p.x - b.x, p.y - b.y);
      const t = c1 / c2;
      const px = a.x + t * vx;
      const py = a.y + t * vy;
      return Math.hypot(p.x - px, p.y - py);
    };

    const hitTestRelationship = (screen: Point) => {
      const threshold = 6;
      const { project } = getState();
      const rels = project.relationships.filter((r) => r.diagramType === project.diagramType);
      for (let i = rels.length - 1; i >= 0; i--) {
        const rel = rels[i];
        const routing = rel.routing;
        if (!routing || routing.points.length < 2) continue;
        for (let j = 0; j < routing.points.length - 1; j++) {
          const a = worldToScreen(project.viewport, routing.points[j]!);
          const b = worldToScreen(project.viewport, routing.points[j + 1]!);
          if (distancePointToSegment(screen, a, b) <= threshold) {
            return rel.id;
          }
        }
      }
      return null;
    };

    const onPointerDown = (ev: PointerEvent) => {
      const { project, ui } = getState();
      const rect = canvas.getBoundingClientRect();
      const screen = { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
      const world = screenToWorld(project.viewport, screen);
      last = screen;

      if (ui.tool === 'pan') {
        dragging = true;
        canvas.setPointerCapture(ev.pointerId);
        return;
      }

      if (ui.tool === 'relationship') {
        const pendingSourceId = ui.relationship.pendingSourceId;
        const hit = hitTest(world);
        if (hit) {
          if (!pendingSourceId) {
            startRelationshipFrom(hit);
          } else if (pendingSourceId === hit) {
            clearRelationshipDraft();
          } else {
            const label = window.prompt('Relationship label (optional)') ?? '';
            createRelationship(pendingSourceId, hit, label);
            clearRelationshipDraft();
          }
        } else {
          clearRelationshipDraft();
        }
        rafDraw();
        return;
      }

      // resize handle has priority
      const handleHit = hitResizeHandle(world);
      if (handleHit) {
        const el = getSingleSelectedElement();
        if (!el) return;
        resizing = true;
        resizeHandle = handleHit;
        resizePrevRects = {
          [el.id]: { x: el.position.x, y: el.position.y, width: el.size.width, height: el.size.height },
        };
        canvas.setPointerCapture(ev.pointerId);
        return;
      }

      const hit = hitTest(world);
      if (hit) {
        const prevSel = ui.selection.elementIds;
        let nextSel = prevSel;

        if (ev.shiftKey) {
          nextSel = new Set(prevSel);
          if (nextSel.has(hit)) nextSel.delete(hit);
          else nextSel.add(hit);
          setSelection(nextSel);
        } else {
          if (!prevSel.has(hit) || prevSel.size !== 1) {
            nextSel = new Set([hit]);
            setSelection(nextSel);
          }
        }

        if (nextSel.size > 0) {
          const prev: Record<string, Point> = {};
          for (const id of nextSel) {
            const el = project.elements.find((e) => e.id === id);
            if (el) prev[id] = { x: el.position.x, y: el.position.y };
          }
          pendingDrag = { start: screen, ids: new Set(nextSel), prev, moved: false };
        }
      } else {
        const relHit = hitTestRelationship(screen);
        if (relHit) {
          setRelationshipSelection(relHit);
        } else {
          if (!ev.shiftKey) setSelection(new Set());
          selecting = true;
          selectionBox = { a: screen, b: screen };
          canvas.setPointerCapture(ev.pointerId);
        }
      }
      rafDraw();
    };

    const onPointerMove = (ev: PointerEvent) => {
      const { project, ui } = getState();
      if ((!dragging && !resizing && !selecting && !pendingDrag) || !last) return;
      const rect = canvas.getBoundingClientRect();
      const screen = { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
      const dx = screen.x - last.x;
      const dy = screen.y - last.y;
      last = screen;

      if (selecting && selectionBox) {
        selectionBox = { ...selectionBox, b: screen };
        rafDraw();
        return;
      }

      if (!dragging && pendingDrag) {
        const dist = Math.hypot(screen.x - pendingDrag.start.x, screen.y - pendingDrag.start.y);
        if (dist >= dragThresholdPx) {
          dragging = true;
          dragPrevPositions = pendingDrag.prev;
          pendingDrag = { ...pendingDrag, moved: true };
          canvas.setPointerCapture(ev.pointerId);
        } else {
          return;
        }
      }

      if (ui.tool === 'pan') {
        setViewport({
          ...project.viewport,
          offsetX: project.viewport.offsetX + dx,
          offsetY: project.viewport.offsetY + dy,
        });
      } else if (resizing) {
        if (!resizeHandle) return;
        resizeSelected({ dx: dx / project.viewport.scale, dy: dy / project.viewport.scale, handle: resizeHandle });
      } else {
        moveSelected({ dx: dx / project.viewport.scale, dy: dy / project.viewport.scale });
      }
      rafDraw();
    };

    const onPointerUp = (ev: PointerEvent) => {
      const { project } = getState();
      dragging = false;
      resizing = false;
      selecting = false;
      resizeHandle = null;
      last = null;

      if (selectionBox) {
        const x0 = Math.min(selectionBox.a.x, selectionBox.b.x);
        const y0 = Math.min(selectionBox.a.y, selectionBox.b.y);
        const x1 = Math.max(selectionBox.a.x, selectionBox.b.x);
        const y1 = Math.max(selectionBox.a.y, selectionBox.b.y);
        const aWorld = screenToWorld(project.viewport, { x: x0, y: y0 });
        const bWorld = screenToWorld(project.viewport, { x: x1, y: y1 });
        const rx0 = Math.min(aWorld.x, bWorld.x);
        const ry0 = Math.min(aWorld.y, bWorld.y);
        const rx1 = Math.max(aWorld.x, bWorld.x);
        const ry1 = Math.max(aWorld.y, bWorld.y);

        const ids = new Set<string>();
        const visibleElements = project.elements.filter((e) => e.diagramType === project.diagramType);
        for (const el of visibleElements) {
          const ex0 = el.position.x;
          const ey0 = el.position.y;
          const ex1 = el.position.x + el.size.width;
          const ey1 = el.position.y + el.size.height;
          const intersects = ex0 <= rx1 && ex1 >= rx0 && ey0 <= ry1 && ey1 >= ry0;
          if (intersects) ids.add(el.id);
        }

        if (ids.size > 0) {
          setSelection(ids);
        }
        selectionBox = null;
      }

      if (pendingDrag && !pendingDrag.moved) {
        pendingDrag = null;
      }

      if (dragPrevPositions) {
        commitMoveSelected(dragPrevPositions);
      }
      dragPrevPositions = null;

      if (resizePrevRects) {
        commitResizeSelected(resizePrevRects);
      }
      resizePrevRects = null;
      try {
        canvas.releasePointerCapture(ev.pointerId);
      } catch {
        // ignore
      }
      rafDraw();
    };

    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      const { project } = getState();
      const rect = canvas.getBoundingClientRect();
      const cursor = { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
      const before = screenToWorld(project.viewport, cursor);

      const zoomFactor = Math.exp(-ev.deltaY / 500);
      const nextScale = Math.min(2.5, Math.max(0.2, project.viewport.scale * zoomFactor));

      const afterViewport = { ...project.viewport, scale: nextScale };
      const after = screenToWorld(afterViewport, cursor);

      // keep cursor world position stable
      setViewport({
        ...afterViewport,
        offsetX: project.viewport.offsetX + (after.x - before.x) * nextScale,
        offsetY: project.viewport.offsetY + (after.y - before.y) * nextScale,
      });
      rafDraw();
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    const unsub = useEditorStore.subscribe(() => rafDraw());

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      unsub();
    };
  }, [setViewport, setSelection, setRelationshipSelection, moveSelected, commitMoveSelected, resizeSelected, commitResizeSelected, startRelationshipFrom, clearRelationshipDraft, createRelationship]);

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0 }}>
      <canvas id="uml-canvas" ref={canvasRef} />
    </div>
  );
}
