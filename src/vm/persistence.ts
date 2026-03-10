import type { Project } from './types';

export const AUTOSAVE_KEY = 'uml-web-editor:autosave:v0';

export function downloadTextFile(filename: string, text: string, mime = 'application/json') {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportProjectJson(project: Project) {
  const filename = `uml-project-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  downloadTextFile(filename, JSON.stringify(project, null, 2));
}

export function parseProjectJson(text: string): Project {
  const data = JSON.parse(text) as unknown;
  if (!data || typeof data !== 'object') throw new Error('Invalid JSON');

  const p = data as any;
  if (!p.metadata || typeof p.metadata !== 'object') throw new Error('Missing metadata');
  if (!p.diagramType || typeof p.diagramType !== 'string') throw new Error('Missing diagramType');
  if (!Array.isArray(p.elements) || !Array.isArray(p.relationships)) throw new Error('Missing elements/relationships');
  if (!p.viewport || typeof p.viewport !== 'object') throw new Error('Missing viewport');

  return p as Project;
}

export function loadAutosave(): Project | null {
  const raw = localStorage.getItem(AUTOSAVE_KEY);
  if (!raw) return null;
  try {
    return parseProjectJson(raw);
  } catch {
    return null;
  }
}

export function saveAutosave(project: Project) {
  localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(project));
}

export function clearAutosave() {
  localStorage.removeItem(AUTOSAVE_KEY);
}
