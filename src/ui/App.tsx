import React from 'react';
import { useEditorStore } from '../vm/store';
import { CanvasView } from './CanvasView';
import { PropertyPanel } from './PropertyPanel';

export function App() {
  const diagramType = useEditorStore((s) => s.project.diagramType);
  const setDiagramType = useEditorStore((s) => s.setDiagramType);
  const tool = useEditorStore((s) => s.ui.tool);
  const setTool = useEditorStore((s) => s.setTool);

  return (
    <div className="appShell">
      <div className="topbar">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <strong>UML Web Editor</strong>
          <span className="label">diagramType: {diagramType}</span>
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
