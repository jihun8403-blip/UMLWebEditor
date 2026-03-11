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
  const showLeft = useEditorStore((s) => s.ui.panels.showLeft);
  const showRight = useEditorStore((s) => s.ui.panels.showRight);
  const toggleLeftPanel = useEditorStore((s) => s.toggleLeftPanel);
  const toggleRightPanel = useEditorStore((s) => s.toggleRightPanel);
  const relationshipType = useEditorStore((s) => s.ui.relationship.type);
  const setRelationshipType = useEditorStore((s) => s.setRelationshipType);
  const gridSnap = useEditorStore((s) => s.ui.grid.snap);
  const setGridSnap = useEditorStore((s) => s.setGridSnap);
  const autosave = useEditorStore((s) => s.ui.autosave);

  const project = useEditorStore((s) => s.project);

  React.useEffect(() => {
    const onKeyDown = (ev: KeyboardEvent) => {
      const target = ev.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (target as any)?.isContentEditable) return;

      const ctrl = ev.ctrlKey || ev.metaKey;
      if (!ctrl) return;

      const key = ev.key.toLowerCase();
      if (key === 'z') {
        ev.preventDefault();
        useEditorStore.getState().undo();
      } else if (key === 'y') {
        ev.preventDefault();
        useEditorStore.getState().redo();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

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
      const canvas = getCanvas();
      const rect = canvas.getBoundingClientRect();
      exportCanvasPdf(canvas, { width: rect.width, height: rect.height });
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
    <div
      className="appShell"
      style={{
        gridTemplateColumns: `${showLeft ? '240px' : '0px'} 1fr ${showRight ? '320px' : '0px'}`,
      }}
    >
      <div className="topbar">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <strong>UML Web Editor</strong>
          <span className="label">diagramType: {diagramType}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="btnGroup">
            <button className="btn" onClick={toggleLeftPanel}>
              {showLeft ? 'Hide Tools' : 'Show Tools'}
            </button>
            <button className="btn" onClick={toggleRightPanel}>
              {showRight ? 'Hide Properties' : 'Show Properties'}
            </button>
          </div>

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
            <button className="btn" onClick={() => useEditorStore.getState().duplicateSelected()}>
              Duplicate
            </button>
            <button className="btn" onClick={() => useEditorStore.getState().deleteSelected()}>
              Delete
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

      {showLeft && (
        <div className="leftPanel">
          <div className="label">Tools</div>
          <div className="section btnGroup">
            <button className={"btn " + (tool === 'select' ? 'btnPrimary' : '')} onClick={() => setTool('select')}>
              Select
            </button>
            <button className={"btn " + (tool === 'pan' ? 'btnPrimary' : '')} onClick={() => setTool('pan')}>
              Pan
            </button>
            <button className={"btn " + (tool === 'relationship' ? 'btnPrimary' : '')} onClick={() => setTool('relationship')}>
              Relationship
            </button>
          </div>

          <div className="section">
            <div className="label">Relationship Type</div>
            <select className="input" value={relationshipType} onChange={(e) => setRelationshipType(e.target.value as any)}>
              <option value="association">association</option>
              <option value="dependency">dependency</option>
              <option value="generalization">generalization</option>
              <option value="realization">realization</option>
            </select>
          </div>

          <div className="section">
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={gridSnap} onChange={(e) => setGridSnap(e.target.checked)} />
              Grid Snap
            </label>
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
            <div className="label">Align (multi-select)</div>
            <div className="section btnGroup">
              <button className="btn" onClick={() => useEditorStore.getState().alignSelected('left')}>
                Left
              </button>
              <button className="btn" onClick={() => useEditorStore.getState().alignSelected('right')}>
                Right
              </button>
              <button className="btn" onClick={() => useEditorStore.getState().alignSelected('hcenter')}>
                HCenter
              </button>
              <button className="btn" onClick={() => useEditorStore.getState().alignSelected('top')}>
                Top
              </button>
              <button className="btn" onClick={() => useEditorStore.getState().alignSelected('bottom')}>
                Bottom
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
      )}

      <div className="canvasPanel">
        <CanvasView />
      </div>

      {showRight && (
        <div className="rightPanel">
          <PropertyPanel />
        </div>
      )}
    </div>
  );
}
