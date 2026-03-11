import React from 'react';
import { useEditorStore } from '../vm/store';
import type { Attribute, Method, Visibility } from '../vm/types';

export function PropertyPanel() {
  const selectedId = useEditorStore((s) => (s.ui.selection.elementIds.values().next().value as string | undefined));
  const selectedRelationshipId = useEditorStore((s) => s.ui.selection.relationshipId);
  const element = useEditorStore((s) => (selectedId ? s.project.elements.find((e) => e.id === selectedId) : undefined));
  const relationship = useEditorStore((s) => (selectedRelationshipId ? s.project.relationships.find((r) => r.id === selectedRelationshipId) : undefined));
  const updateElement = useEditorStore((s) => s.updateElement);
  const updateRelationship = useEditorStore((s) => s.updateRelationship);

  const setAttributeAt = (idx: number, patch: Partial<Attribute>) => {
    if (!element) return;
    const prev = element.attributes ?? [];
    const next = prev.map((a, i) => (i === idx ? { ...a, ...patch } : a));
    updateElement(element.id, { attributes: next });
  };

  const addAttribute = () => {
    if (!element) return;
    const prev = element.attributes ?? [];
    updateElement(element.id, {
      attributes: [...prev, { name: 'attr', type: 'string', visibility: 'private' as Visibility }],
    });
  };

  const removeAttributeAt = (idx: number) => {
    if (!element) return;
    const prev = element.attributes ?? [];
    updateElement(element.id, { attributes: prev.filter((_, i) => i !== idx) });
  };

  const setMethodAt = (idx: number, patch: Partial<Method>) => {
    if (!element) return;
    const prev = element.methods ?? [];
    const next = prev.map((m, i) => (i === idx ? { ...m, ...patch } : m));
    updateElement(element.id, { methods: next });
  };

  const addMethod = () => {
    if (!element) return;
    const prev = element.methods ?? [];
    updateElement(element.id, {
      methods: [...prev, { name: 'method', returnType: 'void', visibility: 'public' as Visibility, parameters: [] }],
    });
  };

  const removeMethodAt = (idx: number) => {
    if (!element) return;
    const prev = element.methods ?? [];
    updateElement(element.id, { methods: prev.filter((_, i) => i !== idx) });
  };

  const renderVisibilitySelect = (value: Visibility, onChange: (v: Visibility) => void) => (
    <select className="input" value={value} onChange={(e) => onChange(e.target.value as Visibility)}>
      <option value="public">public (+)</option>
      <option value="private">private (-)</option>
      <option value="protected">protected (#)</option>
    </select>
  );

  if (selectedRelationshipId && relationship) {
    return (
      <div>
        <div className="label">Property Panel</div>

        <div className="section">
          <div className="kv">
            <div className="label">id</div>
            <div>{relationship.id}</div>
          </div>
          <div className="kv">
            <div className="label">type</div>
            <div>{relationship.type}</div>
          </div>
          <div className="kv">
            <div className="label">label</div>
            <input
              className="input"
              value={relationship.label ?? ''}
              onChange={(e) => updateRelationship(relationship.id, { label: e.target.value })}
            />
          </div>
        </div>
      </div>
    );
  }

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

        {(element.type === 'class' || element.type === 'interface' || element.type === 'abstractClass') && (
          <div className="kv">
            <div className="label">display</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={element.showAttributes ?? true}
                  onChange={(e) => updateElement(element.id, { showAttributes: e.target.checked })}
                />
                Attributes
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={element.showMethods ?? true}
                  onChange={(e) => updateElement(element.id, { showMethods: e.target.checked })}
                />
                Methods
              </label>
            </div>
          </div>
        )}
        <div className="kv">
          <div className="label">stereotype</div>
          <input
            className="input"
            value={element.stereotype ?? ''}
            onChange={(e) => updateElement(element.id, { stereotype: e.target.value })}
          />
        </div>
      </div>

      {(element.type === 'class' || element.type === 'interface' || element.type === 'abstractClass') && (
        <>
          <div className="section">
            <div className="label" style={{ marginBottom: 8 }}>
              Attributes
            </div>
            <div className="btnGroup" style={{ marginBottom: 8 }}>
              <button className="btn" onClick={addAttribute}>
                + Attribute
              </button>
            </div>
            {(element.attributes ?? []).map((a, idx) => (
              <div key={idx} className="kv" style={{ gridTemplateColumns: '72px 1fr', alignItems: 'center' }}>
                <div className="label">#{idx + 1}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 140px 72px', gap: 8 }}>
                  <input
                    className="input"
                    value={a.name}
                    onChange={(e) => setAttributeAt(idx, { name: e.target.value })}
                    placeholder="name"
                  />
                  <input
                    className="input"
                    value={a.type}
                    onChange={(e) => setAttributeAt(idx, { type: e.target.value })}
                    placeholder="type"
                  />
                  {renderVisibilitySelect(a.visibility, (v) => setAttributeAt(idx, { visibility: v }))}
                  <button className="btn" onClick={() => removeAttributeAt(idx)}>
                    Del
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="section">
            <div className="label" style={{ marginBottom: 8 }}>
              Methods
            </div>
            <div className="btnGroup" style={{ marginBottom: 8 }}>
              <button className="btn" onClick={addMethod}>
                + Method
              </button>
            </div>
            {(element.methods ?? []).map((m, idx) => (
              <div key={idx} className="kv" style={{ gridTemplateColumns: '72px 1fr', alignItems: 'center' }}>
                <div className="label">#{idx + 1}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 140px 72px', gap: 8 }}>
                  <input
                    className="input"
                    value={m.name}
                    onChange={(e) => setMethodAt(idx, { name: e.target.value })}
                    placeholder="name"
                  />
                  <input
                    className="input"
                    value={m.returnType}
                    onChange={(e) => setMethodAt(idx, { returnType: e.target.value })}
                    placeholder="return"
                  />
                  {renderVisibilitySelect(m.visibility, (v) => setMethodAt(idx, { visibility: v }))}
                  <button className="btn" onClick={() => removeMethodAt(idx)}>
                    Del
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
