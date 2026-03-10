import React from 'react';
import { useEditorStore } from '../vm/store';
import { CanvasView } from './CanvasView';
import { PropertyPanel } from './PropertyPanel';
import { parseProjectJson } from '../vm/persistence';
import { exportCanvasPdf, exportCanvasPng, exportProjectSvg } from '../vm/export';

export function App() {
  const diagramType = useEditorStore((s) => s.project.diagramType);
  const setDiagramType = useEditorStore((s) => s.setDiagramType);
  const tool = useEditorStore((s) => s.ui.tool);
  const setTool = useEditorStore((s) => s.setTool);
  const autosave = useEditorStore((s) => s.ui.autosave);

  const project = useEditorStore((s) => s.project);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const onImportClick = () => {
    fileInputRef.current?.click();
  };

  const onFileSelected: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const project = parseProjectJson(text);
      useEditorStore.getState().importProject(project);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid JSON';
      window.alert(`Import failed: ${msg}`);
    }
    e.target.value = '';
  };

  const getCanvas = () => {
    const el = document.getElementById('uml-canvas');
    if (!el) throw new Error('Canvas not found');
    if (!(el instanceof HTMLCanvasElement)) throw new Error('Canvas element mismatch');
    return el;
  };

  const onExportPng = async () => {
    try {
      await exportCanvasPng(getCanvas());
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'PNG export failed';
      window.alert(msg);
    }
  };

  const onExportPdf = () => {
    try {
      exportCanvasPdf(getCanvas());
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'PDF export failed';
      window.alert(msg);
    }
  };

  const onExportSvg = () => {
    try {
      const canvas = getCanvas();
      const rect = canvas.getBoundingClientRect();
      exportProjectSvg(project, { width: rect.width, height: rect.height });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'SVG export failed';
      window.alert(msg);
    }
  };

  return (
    <div className="appShell">
      <div className="topbar">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <strong>UML Web Editor</strong>
          <span className="label">diagramType: {diagramType}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="btnGroup">
            <button className={"btn " + (diagramType === 'class' ? 'btnPrimary' : '')} onClick={() => setDiagramType('class')}>
              Class
            </button>
            <button className={"btn " + (diagramType === 'usecase' ? 'btnPrimary' : '')} onClick={() => setDiagramType('usecase')}>
              Use Case
            </button>
            <button className={"btn " + (diagramType === 'sequence' ? 'btnPrimary' : '')} onClick={() => setDiagramType('sequence')}>
              Sequence
            </button>
          </div>

          <div className="btnGroup">
            <button className="btn" onClick={() => useEditorStore.getState().exportJson()}>
              Export JSON
            </button>
            <button className="btn" onClick={onExportPng}>
              Export PNG
            </button>
            <button className="btn" onClick={onExportSvg}>
              Export SVG
            </button>
            <button className="btn" onClick={onExportPdf}>
              Export PDF
            </button>
            <button className="btn" onClick={onImportClick}>
              Import JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              style={{ display: 'none' }}
              onChange={onFileSelected}
            />
          </div>

          <div className="btnGroup">
            <button className="btn" disabled={!autosave.hasRecoveryData} onClick={() => useEditorStore.getState().tryRecoverFromAutosave()}>
              Recover
            </button>
            <button className="btn" disabled={!autosave.hasRecoveryData} onClick={() => useEditorStore.getState().clearRecoveryData()}>
              Clear
            </button>
          </div>

          <span className="label">
            autosave: {autosave.pending ? 'pending' : 'idle'}
            {autosave.lastSavedAt ? ` · saved ${new Date(autosave.lastSavedAt).toLocaleTimeString()}` : ''}
            {autosave.error ? ` · error: ${autosave.error}` : ''}
          </span>
        </div>
      </div>

      <div className="leftPanel">
        <div className="label">Tools</div>
        <div className="section btnGroup">
          <button className={"btn " + (tool === 'select' ? 'btnPrimary' : '')} onClick={() => setTool('select')}>
            Select
          </button>
          <button className={"btn " + (tool === 'pan' ? 'btnPrimary' : '')} onClick={() => setTool('pan')}>
            Pan
          </button>
        </div>

        <div className="section">
          <div className="label">Create element (current type)</div>
          <div className="section btnGroup">
            <button className="btn" onClick={() => useEditorStore.getState().createDefaultElementForCurrentDiagram()}>
              + Element
            </button>
            <button className="btn" onClick={() => useEditorStore.getState().createRelationshipDemo()}>
              + Relationship (demo)
            </button>
          </div>
        </div>

        <div className="section">
          <div className="label">History</div>
          <div className="section btnGroup">
            <button className="btn" onClick={() => useEditorStore.getState().undo()}>
              Undo
            </button>
            <button className="btn" onClick={() => useEditorStore.getState().redo()}>
              Redo
            </button>
          </div>
        </div>
      </div>

      <div className="canvasPanel">
        <CanvasView />
      </div>

      <div className="rightPanel">
        <PropertyPanel />
      </div>
    </div>
  );
}
