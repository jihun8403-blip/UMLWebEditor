import { create } from 'zustand';
import type { DiagramType, Project, UmlElement, Viewport } from './types';
import { nextId } from './id';
import { orthogonalRoute } from './routing';
import {
  type Command,
  CreateElementCommand,
  CreateRelationshipCommand,
  SetElementsPositionsCommand,
  UpdateElementCommand,
} from './commands';

type Tool = 'select' | 'pan';

type EditorState = {
  project: Project;
  ui: {
    tool: Tool;
    selection: {
      elementIds: Set<string>;
    };
  };
  history: {
    undo: Command[];
    redo: Command[];
  };

  setTool(tool: Tool): void;
  setDiagramType(t: DiagramType): void;
  setViewport(v: Viewport): void;

  setSelection(ids: Set<string>): void;

  execute(cmd: Command, record?: boolean): void;
  undo(): void;
  redo(): void;

  createDefaultElementForCurrentDiagram(): void;
  updateElement(id: string, patch: Partial<UmlElement>): void;
  moveSelectedBy(delta: { dx: number; dy: number }): void;
  commitMoveSelected(prevPositions: Record<string, { x: number; y: number }>): void;

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

export const useEditorStore = create<EditorState>((set, get) => ({
  project: initialProject,
  ui: {
    tool: 'select',
    selection: { elementIds: new Set() },
  },
  history: {
    undo: [],
    redo: [],
  },

  setTool(tool) {
    set((s) => ({ ui: { ...s.ui, tool } }));
  },

  setDiagramType(t) {
    // 정책: 타입 전환은 히스토리에 기록하지 않음(뷰 상태)
    set((s) => ({ project: { ...s.project, diagramType: t }, ui: { ...s.ui, selection: { elementIds: new Set() } } }));
  },

  setViewport(v) {
    set((s) => ({ project: { ...s.project, viewport: v } }));
  },

  setSelection(ids) {
    set((s) => ({ ui: { ...s.ui, selection: { elementIds: ids } } }));
  },

  execute(cmd, record = true) {
    set((s) => {
      const nextProject = cmd.execute(s.project);
      const undo = record ? [...s.history.undo, cmd] : s.history.undo;
      return {
        project: nextProject,
        history: {
          undo,
          redo: record ? [] : s.history.redo,
        },
      };
    });
  },

  undo() {
    const last = get().history.undo.at(-1);
    if (!last) return;
    set((s) => {
      const undo = s.history.undo.slice(0, -1);
      const project = last.undo(s.project);
      return {
        project,
        history: { undo, redo: [...s.history.redo, last] },
      };
    });
  },

  redo() {
    const last = get().history.redo.at(-1);
    if (!last) return;
    set((s) => {
      const redo = s.history.redo.slice(0, -1);
      const project = last.execute(s.project);
      return {
        project,
        history: { undo: [...s.history.undo, last], redo },
      };
    });
  },

  createDefaultElementForCurrentDiagram() {
    const { project } = get();
    const id = nextId('el');
    const base = {
      id,
      diagramType: project.diagramType,
      position: { x: 120, y: 120 },
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

  moveSelectedBy({ dx, dy }) {
    const ids = Array.from(get().ui.selection.elementIds);
    if (ids.length === 0) return;
    // MVP: 드래그 중 매 프레임 커맨드 푸시하면 히스토리가 폭증하므로, 여기서는 기록하지 않음.
    // 드래그 종료 시점에 커밋하는 방식은 다음 단계에서 추가.
    set((s) => {
      const elements = s.project.elements.map((e) =>
        ids.includes(e.id) ? { ...e, position: { x: e.position.x + dx, y: e.position.y + dy } } : e,
      );
      return { project: { ...s.project, elements } };
    });
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

    let changed = false;
    for (const id of ids) {
      const prev = prevPositions[id];
      const next = nextPositions[id];
      if (!prev || !next) continue;
      if (prev.x !== next.x || prev.y !== next.y) {
        changed = true;
        break;
      }
    }
    if (!changed) return;

    get().execute(new SetElementsPositionsCommand(prevPositions, nextPositions));
  },

  createRelationshipDemo() {
    const { project } = get();
    const els = project.elements.filter((e) => e.diagramType === project.diagramType);
    if (els.length < 2) return;
    const a = els[0];
    const b = els[1];
    const src = { x: a.position.x + a.size.width, y: a.position.y + a.size.height / 2 };
    const tgt = { x: b.position.x, y: b.position.y + b.size.height / 2 };
    const points = orthogonalRoute(src, tgt);

    const rel = {
      id: nextId('rel'),
      diagramType: project.diagramType,
      type: 'association' as const,
      sourceId: a.id,
      targetId: b.id,
      routing: { points },
    };

    get().execute(new CreateRelationshipCommand(rel));
  },
}));
