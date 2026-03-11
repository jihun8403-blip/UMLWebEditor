import { create } from 'zustand';
import type { DiagramType, Project, RelationshipType, UmlElement, Viewport } from './types';
import { nextId } from './id';
import { recomputeAllRouting, recomputeRoutingForElementIds } from './routing';
import { clearAutosave, exportProjectJson, loadAutosave, saveAutosave } from './persistence';
import {
  type Command,
  CreateElementCommand,
  CreateElementsCommand,
  CreateRelationshipCommand,
  DeleteElementsCommand,
  SetElementsPositionsCommand,
  SetElementsRectsCommand,
  UpdateRelationshipCommand,
  UpdateElementCommand,
} from './commands';

type Tool = 'select' | 'pan' | 'relationship';

type EditorState = {
  project: Project;
  ui: {
    tool: Tool;
    panels: {
      showLeft: boolean;
      showRight: boolean;
    };
    grid: {
      snap: boolean;
    };
    selection: {
      elementIds: Set<string>;
      relationshipId?: string;
    };
    relationship: {
      pendingSourceId?: string;
      type: RelationshipType;
    };
    autosave: {
      pending: boolean;
      lastSavedAt?: string;
      hasRecoveryData: boolean;
      error?: string;
    };
  };
  history: {
    undo: Command[];
    redo: Command[];
  };

  setTool(tool: Tool): void;
  setRelationshipType(t: RelationshipType): void;
  setGridSnap(enabled: boolean): void;
  setDiagramType(t: DiagramType): void;
  setViewport(v: Viewport): void;

  toggleLeftPanel(): void;
  toggleRightPanel(): void;

  setSelection(ids: Set<string>): void;
  setRelationshipSelection(id?: string): void;

  exportJson(): void;
  importProject(p: Project): void;
  tryRecoverFromAutosave(): void;
  clearRecoveryData(): void;

  scheduleAutosave(): void;

  execute(cmd: Command, record?: boolean): void;
  undo(): void;
  redo(): void;

  createDefaultElementForCurrentDiagram(): void;
  updateElement(id: string, patch: Partial<UmlElement>): void;
  updateRelationship(id: string, patch: Partial<import('./types').Relationship>): void;
  moveSelectedBy(delta: { dx: number; dy: number }): void;
  commitMoveSelected(prevPositions: Record<string, { x: number; y: number }>): void;

  duplicateSelected(): void;
  deleteSelected(): void;

  alignSelected(mode: 'left' | 'right' | 'hcenter' | 'top' | 'bottom'): void;

  resizeSelectedBy(delta: { dx: number; dy: number; handle: 'nw' | 'ne' | 'sw' | 'se' }): void;
  commitResizeSelected(prevRects: Record<string, { x: number; y: number; width: number; height: number }>): void;

  startRelationshipFrom(sourceId: string): void;
  clearRelationshipDraft(): void;
  createRelationship(sourceId: string, targetId: string, label?: string): void;

  createRelationshipDemo(): void;
};

function nowIso() {
  return new Date().toISOString();
}

const initialProject: Project = {
  metadata: { schemaVersion: '0.1', createdAt: nowIso() },
  diagramType: 'class',
  elements: [],
  relationships: [],
  viewport: { scale: 1, offsetX: 40, offsetY: 40 },
};

let autosaveTimer: number | undefined;

function resetHistory() {
  return { undo: [] as Command[], redo: [] as Command[] };
}

export const useEditorStore = create<EditorState>((set, get) => ({
  project: initialProject,
  ui: {
    tool: 'select',
    panels: { showLeft: true, showRight: true },
    grid: { snap: false },
    selection: { elementIds: new Set() },
    relationship: { type: 'association' },
    autosave: {
      pending: false,
      hasRecoveryData: loadAutosave() !== null,
    },
  },
  history: resetHistory(),

  setTool(tool) {
    set((s) => ({ ui: { ...s.ui, tool, relationship: { ...s.ui.relationship, pendingSourceId: undefined } } }));
  },

  setRelationshipType(t) {
    set((s) => ({ ui: { ...s.ui, relationship: { ...s.ui.relationship, type: t } } }));
  },

  setGridSnap(enabled) {
    set((s) => ({ ui: { ...s.ui, grid: { ...s.ui.grid, snap: enabled } } }));
  },

  setDiagramType(t) {
    // 정책: 타입 전환은 히스토리에 기록하지 않음(뷰 상태)
    set((s) => ({
      project: { ...s.project, diagramType: t },
      ui: { ...s.ui, selection: { elementIds: new Set(), relationshipId: undefined } },
    }));
  },

  setViewport(v) {
    set((s) => ({ project: { ...s.project, viewport: v } }));
  },

  toggleLeftPanel() {
    set((s) => ({ ui: { ...s.ui, panels: { ...s.ui.panels, showLeft: !s.ui.panels.showLeft } } }));
  },

  toggleRightPanel() {
    set((s) => ({ ui: { ...s.ui, panels: { ...s.ui.panels, showRight: !s.ui.panels.showRight } } }));
  },

  setSelection(ids) {
    set((s) => ({ ui: { ...s.ui, selection: { elementIds: ids, relationshipId: undefined } } }));
  },

  setRelationshipSelection(id) {
    set((s) => ({ ui: { ...s.ui, selection: { elementIds: new Set(), relationshipId: id } } }));
  },

  startRelationshipFrom(sourceId) {
    set((s) => ({ ui: { ...s.ui, relationship: { ...s.ui.relationship, pendingSourceId: sourceId } } }));
  },

  clearRelationshipDraft() {
    set((s) => ({ ui: { ...s.ui, relationship: { ...s.ui.relationship, pendingSourceId: undefined } } }));
  },

  createRelationship(sourceId, targetId, label) {
    const { project, ui } = get();
    if (sourceId === targetId) return;
    const rel = {
      id: nextId('rel'),
      diagramType: project.diagramType,
      type: ui.relationship.type,
      sourceId,
      targetId,
      label: label && label.trim().length > 0 ? label.trim() : undefined,
      routing: { points: [] },
    };
    get().execute(new CreateRelationshipCommand(rel));
  },

  exportJson() {
    exportProjectJson(get().project);
  },

  importProject(p) {
    const project = recomputeAllRouting(p);
    set((s) => ({
      project,
      history: resetHistory(),
      ui: {
        ...s.ui,
        selection: { elementIds: new Set() },
      },
    }));
    get().scheduleAutosave();
  },

  tryRecoverFromAutosave() {
    const recovered = loadAutosave();
    if (!recovered) return;
    get().importProject(recovered);
    set((s) => ({ ui: { ...s.ui, autosave: { ...s.ui.autosave, hasRecoveryData: true } } }));
  },

  clearRecoveryData() {
    clearAutosave();
    set((s) => ({ ui: { ...s.ui, autosave: { ...s.ui.autosave, hasRecoveryData: false } } }));
  },

  scheduleAutosave() {
    if (autosaveTimer) {
      window.clearTimeout(autosaveTimer);
    }
    set((s) => ({ ui: { ...s.ui, autosave: { ...s.ui.autosave, pending: true, error: undefined } } }));
    autosaveTimer = window.setTimeout(() => {
      try {
        saveAutosave(get().project);
        set((s) => ({
          ui: {
            ...s.ui,
            autosave: {
              ...s.ui.autosave,
              pending: false,
              lastSavedAt: new Date().toISOString(),
              hasRecoveryData: true,
            },
          },
        }));
      } catch (e) {
        set((s) => ({
          ui: {
            ...s.ui,
            autosave: {
              ...s.ui.autosave,
              pending: false,
              error: e instanceof Error ? e.message : 'autosave failed',
            },
          },
        }));
      }
    }, 30_000);
  },

  execute(cmd, record = true) {
    set((s) => {
      const nextProject = recomputeAllRouting(cmd.execute(s.project));
      const undo = record ? [...s.history.undo, cmd] : s.history.undo;
      return {
        project: nextProject,
        history: {
          undo,
          redo: record ? [] : s.history.redo,
        },
      };
    });
    get().scheduleAutosave();
  },

  undo() {
    const last = get().history.undo.at(-1);
    if (!last) return;
    set((s) => {
      const undo = s.history.undo.slice(0, -1);
      const project = recomputeAllRouting(last.undo(s.project));
      return {
        project,
        history: { undo, redo: [...s.history.redo, last] },
      };
    });
    get().scheduleAutosave();
  },

  redo() {
    const last = get().history.redo.at(-1);
    if (!last) return;
    set((s) => {
      const redo = s.history.redo.slice(0, -1);
      const project = recomputeAllRouting(last.execute(s.project));
      return {
        project,
        history: { undo: [...s.history.undo, last], redo },
      };
    });
    get().scheduleAutosave();
  },

  createDefaultElementForCurrentDiagram() {
    const { project } = get();
    const id = nextId('el');

    const step = 24;
    const lastSameDiagram = [...project.elements].reverse().find((e) => e.diagramType === project.diagramType);
    const spawnPosition = lastSameDiagram
      ? { x: lastSameDiagram.position.x + step, y: lastSameDiagram.position.y + step }
      : { x: 120, y: 120 };

    const base = {
      id,
      diagramType: project.diagramType,
      position: spawnPosition,
      size: { width: 180, height: 90 },
    };

    let type: UmlElement['type'] = 'class';
    if (project.diagramType === 'usecase') type = 'usecase';
    if (project.diagramType === 'sequence') type = 'lifeline';

    const element: UmlElement = {
      ...base,
      type,
      name: type,
    };

    get().execute(new CreateElementCommand(element));
    get().setSelection(new Set([element.id]));
  },

  updateElement(id, patch) {
    get().execute(new UpdateElementCommand(id, patch));
  },

  updateRelationship(id, patch) {
    get().execute(new UpdateRelationshipCommand(id, patch));
  },

  moveSelectedBy({ dx, dy }) {
    const ids = Array.from(get().ui.selection.elementIds);
    if (ids.length === 0) return;
    // MVP: 드래그 중 매 프레임 커맨드 푸시하면 히스토리가 폭증하므로, 여기서는 기록하지 않음.
    // 드래그 종료 시점에 커밋하는 방식은 다음 단계에서 추가.
    set((s) => {
      const elements = s.project.elements.map((e) =>
        ids.includes(e.id) ? { ...e, position: { x: e.position.x + dx, y: e.position.y + dy } } : e,
      );
      const project = { ...s.project, elements };
      const updated = recomputeRoutingForElementIds(project, new Set(ids));
      return { project: updated };
    });
    get().scheduleAutosave();
  },

  commitMoveSelected(prevPositions) {
    const { project, ui } = get();
    const ids = Array.from(ui.selection.elementIds);
    if (ids.length === 0) return;

    const nextPositions: Record<string, { x: number; y: number }> = {};
    for (const id of ids) {
      const el = project.elements.find((e) => e.id === id);
      if (el) nextPositions[id] = { x: el.position.x, y: el.position.y };
    }

    const grid = 40;
    const snap = (v: number) => Math.round(v / grid) * grid;
    const snappedNext: Record<string, { x: number; y: number }> = ui.grid.snap
      ? Object.fromEntries(Object.entries(nextPositions).map(([id, p]) => [id, { x: snap(p.x), y: snap(p.y) }]))
      : nextPositions;

    let changed = false;
    for (const id of ids) {
      const prev = prevPositions[id];
      const next = snappedNext[id];
      if (!prev || !next) continue;
      if (prev.x !== next.x || prev.y !== next.y) {
        changed = true;
        break;
      }
    }
    if (!changed) return;

    if (ui.grid.snap) {
      set((s) => {
        const elements = s.project.elements.map((e) => {
          const p = snappedNext[e.id];
          return p ? { ...e, position: { x: p.x, y: p.y } } : e;
        });
        const project2 = { ...s.project, elements };
        return { project: recomputeRoutingForElementIds(project2, new Set(ids)) };
      });
    }

    get().execute(new SetElementsPositionsCommand(prevPositions, snappedNext));
  },

  duplicateSelected() {
    const { project, ui } = get();
    const ids = Array.from(ui.selection.elementIds);
    if (ids.length === 0) return;

    const step = 24;
    const elementsToCreate: UmlElement[] = [];
    for (const id of ids) {
      const el = project.elements.find((e) => e.id === id);
      if (!el) continue;
      elementsToCreate.push({
        ...el,
        id: nextId('el'),
        position: { x: el.position.x + step, y: el.position.y + step },
      });
    }
    if (elementsToCreate.length === 0) return;

    get().execute(new CreateElementsCommand(elementsToCreate));
    get().setSelection(new Set(elementsToCreate.map((e) => e.id)));
  },

  deleteSelected() {
    const ids = Array.from(get().ui.selection.elementIds);
    if (ids.length === 0) return;
    get().execute(new DeleteElementsCommand(ids));
    get().setSelection(new Set());
  },

  alignSelected(mode) {
    const { project, ui } = get();
    const ids = Array.from(ui.selection.elementIds);
    if (ids.length < 2) return;

    const selected = project.elements.filter((e) => ids.includes(e.id));
    if (selected.length < 2) return;

    const prevPositions: Record<string, { x: number; y: number }> = {};
    for (const el of selected) prevPositions[el.id] = { x: el.position.x, y: el.position.y };

    const left = Math.min(...selected.map((e) => e.position.x));
    const right = Math.max(...selected.map((e) => e.position.x + e.size.width));
    const top = Math.min(...selected.map((e) => e.position.y));
    const bottom = Math.max(...selected.map((e) => e.position.y + e.size.height));
    const hcenter = (left + right) / 2;

    const nextPositions: Record<string, { x: number; y: number }> = {};
    for (const el of selected) {
      let x = el.position.x;
      let y = el.position.y;
      if (mode === 'left') x = left;
      if (mode === 'right') x = right - el.size.width;
      if (mode === 'hcenter') x = hcenter - el.size.width / 2;
      if (mode === 'top') y = top;
      if (mode === 'bottom') y = bottom - el.size.height;

      const grid = 40;
      const snap = (v: number) => Math.round(v / grid) * grid;
      if (ui.grid.snap) {
        x = snap(x);
        y = snap(y);
      }

      nextPositions[el.id] = { x, y };
    }

    let changed = false;
    for (const id of ids) {
      const p = prevPositions[id];
      const n = nextPositions[id];
      if (!p || !n) continue;
      if (p.x !== n.x || p.y !== n.y) {
        changed = true;
        break;
      }
    }
    if (!changed) return;

    set((s) => {
      const elements = s.project.elements.map((e) => {
        const p = nextPositions[e.id];
        return p ? { ...e, position: { x: p.x, y: p.y } } : e;
      });
      const project2 = { ...s.project, elements };
      return { project: recomputeRoutingForElementIds(project2, new Set(ids)) };
    });

    get().execute(new SetElementsPositionsCommand(prevPositions, nextPositions));
  },

  resizeSelectedBy({ dx, dy, handle }) {
    const ids = Array.from(get().ui.selection.elementIds);
    if (ids.length !== 1) return;
    const id = ids[0]!;

    set((s) => {
      const elements = s.project.elements.map((e) => {
        if (e.id !== id) return e;
        const minW = 60;
        const minH = 40;

        const x0 = e.position.x;
        const y0 = e.position.y;
        const x1 = e.position.x + e.size.width;
        const y1 = e.position.y + e.size.height;

        let nx0 = x0;
        let ny0 = y0;
        let nx1 = x1;
        let ny1 = y1;

        if (handle === 'se') {
          nx1 += dx;
          ny1 += dy;
        } else if (handle === 'nw') {
          nx0 += dx;
          ny0 += dy;
        } else if (handle === 'ne') {
          nx1 += dx;
          ny0 += dy;
        } else if (handle === 'sw') {
          nx0 += dx;
          ny1 += dy;
        }

        if (nx1 - nx0 < minW) {
          if (handle === 'nw' || handle === 'sw') nx0 = nx1 - minW;
          else nx1 = nx0 + minW;
        }
        if (ny1 - ny0 < minH) {
          if (handle === 'nw' || handle === 'ne') ny0 = ny1 - minH;
          else ny1 = ny0 + minH;
        }

        return {
          ...e,
          position: { x: nx0, y: ny0 },
          size: { width: nx1 - nx0, height: ny1 - ny0 },
        };
      });
      const project = { ...s.project, elements };
      const updated = recomputeRoutingForElementIds(project, new Set([id]));
      return { project: updated };
    });
    get().scheduleAutosave();
  },

  commitResizeSelected(prevRects) {
    const { project, ui } = get();
    const ids = Array.from(ui.selection.elementIds);
    if (ids.length !== 1) return;
    const id = ids[0]!;

    const el = project.elements.find((e) => e.id === id);
    const prev = prevRects[id];
    if (!el || !prev) return;

    const grid = 40;
    const snap = (v: number) => Math.round(v / grid) * grid;
    const minW = 60;
    const minH = 40;
    const nextRaw = { x: el.position.x, y: el.position.y, width: el.size.width, height: el.size.height };
    const next = ui.grid.snap
      ? {
          x: snap(nextRaw.x),
          y: snap(nextRaw.y),
          width: Math.max(minW, snap(nextRaw.width)),
          height: Math.max(minH, snap(nextRaw.height)),
        }
      : nextRaw;
    if (prev.width === next.width && prev.height === next.height) return;

    if (ui.grid.snap) {
      set((s) => {
        const elements = s.project.elements.map((e) =>
          e.id === id ? { ...e, position: { x: next.x, y: next.y }, size: { width: next.width, height: next.height } } : e,
        );
        const project2 = { ...s.project, elements };
        return { project: recomputeRoutingForElementIds(project2, new Set([id])) };
      });
    }

    get().execute(
      new SetElementsRectsCommand(
        {
          [id]: { position: { x: prev.x, y: prev.y }, size: { width: prev.width, height: prev.height } },
        },
        {
          [id]: { position: { x: next.x, y: next.y }, size: { width: next.width, height: next.height } },
        },
      ),
    );
  },

  createRelationshipDemo() {
    const { project } = get();
    const els = project.elements.filter((e) => e.diagramType === project.diagramType);
    if (els.length < 2) return;
    const a = els[0];
    const b = els[1];
    const rel = {
      id: nextId('rel'),
      diagramType: project.diagramType,
      type: 'association' as const,
      sourceId: a.id,
      targetId: b.id,
      routing: { points: [] },
    };

    // routing은 현재 요소 위치 기준으로 즉시 계산
    const nextProject = recomputeAllRouting({ ...project, relationships: [...project.relationships, rel] });
    // execute로 기록하면 recomputeAllRouting이 한번 더 적용되지만 부작용은 없음
    get().execute(
      new CreateRelationshipCommand({
        ...rel,
        routing: nextProject.relationships[nextProject.relationships.length - 1]!.routing,
      }),
    );
  },
}));
