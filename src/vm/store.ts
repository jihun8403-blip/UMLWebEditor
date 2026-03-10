import { create } from 'zustand';
import type { DiagramType, Project, UmlElement, Viewport } from './types';
import { nextId } from './id';
import { recomputeAllRouting, recomputeRoutingForElementIds } from './routing';
import { clearAutosave, exportProjectJson, loadAutosave, saveAutosave } from './persistence';
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
  setDiagramType(t: DiagramType): void;
  setViewport(v: Viewport): void;

  setSelection(ids: Set<string>): void;

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

let autosaveTimer: number | undefined;

function resetHistory() {
  return { undo: [] as Command[], redo: [] as Command[] };
}

export const useEditorStore = create<EditorState>((set, get) => ({
  project: initialProject,
  ui: {
    tool: 'select',
    selection: { elementIds: new Set() },
    autosave: {
      pending: false,
      hasRecoveryData: loadAutosave() !== null,
    },
  },
  history: resetHistory(),

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
