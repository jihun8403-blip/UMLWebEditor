import React, { useEffect, useMemo, useRef } from 'react';
import { useEditorStore } from '../vm/store';
import { worldToScreen, screenToWorld } from '../vm/viewport';
import type { Point } from '../vm/types';

export function CanvasView() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const project = useEditorStore((s) => s.project);
  const ui = useEditorStore((s) => s.ui);
  const setViewport = useEditorStore((s) => s.setViewport);
  const setSelection = useEditorStore((s) => s.setSelection);
  const moveSelected = useEditorStore((s) => s.moveSelectedBy);
  const commitMoveSelected = useEditorStore((s) => s.commitMoveSelected);

  const visibleElements = useMemo(
    () => project.elements.filter((e) => e.diagramType === project.diagramType),
    [project.elements, project.diagramType],
  );

  const visibleRelationships = useMemo(
    () => project.relationships.filter((r) => r.diagramType === project.diagramType),
    [project.relationships, project.diagramType],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * window.devicePixelRatio));
      canvas.height = Math.max(1, Math.floor(rect.height * window.devicePixelRatio));
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      draw();
    };

    const drawGrid = (ctx: CanvasRenderingContext2D) => {
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

      drawGrid(ctx);

      const dpr = window.devicePixelRatio || 1;
      ctx.save();
      ctx.scale(dpr, dpr);

      // relationships
      for (const rel of visibleRelationships) {
        const routing = rel.routing;
        if (!routing || routing.points.length < 2) continue;
        ctx.strokeStyle = '#334155';
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
        ctx.strokeStyle = ui.selection.elementIds.has(el.id) ? '#2563eb' : '#64748b';
        ctx.lineWidth = ui.selection.elementIds.has(el.id) ? 3 : 2;

        ctx.beginPath();
        ctx.roundRect(p.x, p.y, size.w, size.h, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.font = `${14 * project.viewport.scale}px system-ui`;
        ctx.fillText(el.name ?? el.type, p.x + 10 * project.viewport.scale, p.y + 22 * project.viewport.scale);

        if (el.stereotype) {
          ctx.fillStyle = '#475569';
          ctx.font = `${12 * project.viewport.scale}px system-ui`;
          ctx.fillText(`<<${el.stereotype}>>`, p.x + 10 * project.viewport.scale, p.y + 40 * project.viewport.scale);
        }
      }

      ctx.restore();
    };

    const rafDraw = () => requestAnimationFrame(draw);

    resize();
    window.addEventListener('resize', resize);

    // pointer interaction
    let dragging = false;
    let last: Point | null = null;
    let dragPrevPositions: Record<string, Point> | null = null;

    const hitTest = (world: Point) => {
      for (let i = visibleElements.length - 1; i >= 0; i--) {
        const el = visibleElements[i];
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

    const onPointerDown = (ev: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const screen = { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
      const world = screenToWorld(project.viewport, screen);
      last = screen;

      if (ui.tool === 'pan') {
        dragging = true;
        canvas.setPointerCapture(ev.pointerId);
        return;
      }

      const hit = hitTest(world);
      if (hit) {
        setSelection(new Set([hit]));
        dragPrevPositions = {};
        const el = project.elements.find((e) => e.id === hit);
        if (el) dragPrevPositions[hit] = { x: el.position.x, y: el.position.y };
        dragging = true;
        canvas.setPointerCapture(ev.pointerId);
      } else {
        setSelection(new Set());
      }
      rafDraw();
    };

    const onPointerMove = (ev: PointerEvent) => {
      if (!dragging || !last) return;
      const rect = canvas.getBoundingClientRect();
      const screen = { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
      const dx = screen.x - last.x;
      const dy = screen.y - last.y;
      last = screen;

      if (ui.tool === 'pan') {
        setViewport({
          ...project.viewport,
          offsetX: project.viewport.offsetX + dx,
          offsetY: project.viewport.offsetY + dy,
        });
      } else {
        moveSelected({ dx: dx / project.viewport.scale, dy: dy / project.viewport.scale });
      }
      rafDraw();
    };

    const onPointerUp = (ev: PointerEvent) => {
      dragging = false;
      last = null;
      if (dragPrevPositions) {
        commitMoveSelected(dragPrevPositions);
      }
      dragPrevPositions = null;
      try {
        canvas.releasePointerCapture(ev.pointerId);
      } catch {
        // ignore
      }
      rafDraw();
    };

    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
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
  }, [project.viewport, project.elements, project.relationships, project.diagramType, ui.tool, ui.selection.elementIds, setViewport, setSelection, moveSelected, commitMoveSelected, visibleElements, visibleRelationships]);

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
