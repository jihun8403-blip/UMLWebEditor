import React from 'react';
import { useEditorStore } from '../vm/store';

export function PropertyPanel() {
  const selectedId = useEditorStore((s) => (s.ui.selection.elementIds.values().next().value as string | undefined));
  const element = useEditorStore((s) => (selectedId ? s.project.elements.find((e) => e.id === selectedId) : undefined));
  const updateElement = useEditorStore((s) => s.updateElement);

  if (!selectedId || !element) {
    return (
      <div>
        <div className="label">Property Panel</div>
        <div className="section label">No selection</div>
      </div>
    );
  }

  return (
    <div>
      <div className="label">Property Panel</div>

      <div className="section">
        <div className="kv">
          <div className="label">id</div>
          <div>{element.id}</div>
        </div>
        <div className="kv">
          <div className="label">type</div>
          <div>{element.type}</div>
        </div>
        <div className="kv">
          <div className="label">name</div>
          <input
            className="input"
            value={element.name ?? ''}
            onChange={(e) => updateElement(element.id, { name: e.target.value })}
          />
        </div>
        <div className="kv">
          <div className="label">stereotype</div>
          <input
            className="input"
            value={element.stereotype ?? ''}
            onChange={(e) => updateElement(element.id, { stereotype: e.target.value })}
          />
        </div>
      </div>

      <div className="section label">(MVP) attributes/methods 편집 UI는 다음 단계에서 추가</div>
    </div>
  );
}
