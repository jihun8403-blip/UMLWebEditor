import type { Point, Project, Relationship, UmlElement, Viewport } from './types';

export type Command = {
  execute(project: Project): Project;
  undo(project: Project): Project;
};

export class SetDiagramTypeCommand implements Command {
  constructor(private next: Project['diagramType'], private prev: Project['diagramType']) {}

  execute(project: Project): Project {
    return { ...project, diagramType: this.next };
  }
  undo(project: Project): Project {
    return { ...project, diagramType: this.prev };
  }
}

export class SetElementsPositionsCommand implements Command {
  constructor(private prev: Record<string, Point>, private next: Record<string, Point>) {}

  execute(project: Project): Project {
    const elements = project.elements.map((e) => {
      const p = this.next[e.id];
      return p ? { ...e, position: { x: p.x, y: p.y } } : e;
    });
    return { ...project, elements };
  }

  undo(project: Project): Project {
    const elements = project.elements.map((e) => {
      const p = this.prev[e.id];
      return p ? { ...e, position: { x: p.x, y: p.y } } : e;
    });
    return { ...project, elements };
  }
}

export class SetViewportCommand implements Command {
  constructor(private next: Viewport, private prev: Viewport) {}

  execute(project: Project): Project {
    return { ...project, viewport: this.next };
  }

  undo(project: Project): Project {
    return { ...project, viewport: this.prev };
  }
}

export class CreateElementCommand implements Command {
  constructor(private element: UmlElement) {}

  execute(project: Project): Project {
    return { ...project, elements: [...project.elements, this.element] };
  }

  undo(project: Project): Project {
    return { ...project, elements: project.elements.filter((e) => e.id !== this.element.id) };
  }
}

export class CreateElementsCommand implements Command {
  constructor(private elementsToCreate: UmlElement[]) {}

  execute(project: Project): Project {
    return { ...project, elements: [...project.elements, ...this.elementsToCreate] };
  }

  undo(project: Project): Project {
    const ids = new Set(this.elementsToCreate.map((e) => e.id));
    return { ...project, elements: project.elements.filter((e) => !ids.has(e.id)) };
  }
}

export class DeleteElementsCommand implements Command {
  private removedElements: UmlElement[] = [];
  private removedRelationships: Relationship[] = [];

  constructor(private elementIds: string[]) {}

  execute(project: Project): Project {
    const ids = new Set(this.elementIds);
    this.removedElements = project.elements.filter((e) => ids.has(e.id));
    this.removedRelationships = project.relationships.filter((r) => ids.has(r.sourceId) || ids.has(r.targetId));
    return {
      ...project,
      elements: project.elements.filter((e) => !ids.has(e.id)),
      relationships: project.relationships.filter((r) => !(ids.has(r.sourceId) || ids.has(r.targetId))),
    };
  }

  undo(project: Project): Project {
    return {
      ...project,
      elements: [...project.elements, ...this.removedElements],
      relationships: [...project.relationships, ...this.removedRelationships],
    };
  }
}

export class SetElementsRectsCommand implements Command {
  constructor(
    private prev: Record<string, { position: Point; size: { width: number; height: number } }>,
    private next: Record<string, { position: Point; size: { width: number; height: number } }>,
  ) {}

  execute(project: Project): Project {
    const elements = project.elements.map((e) => {
      const rect = this.next[e.id];
      return rect ? { ...e, position: rect.position, size: rect.size } : e;
    });
    return { ...project, elements };
  }

  undo(project: Project): Project {
    const elements = project.elements.map((e) => {
      const rect = this.prev[e.id];
      return rect ? { ...e, position: rect.position, size: rect.size } : e;
    });
    return { ...project, elements };
  }
}

export class UpdateElementCommand implements Command {
  private prev?: UmlElement;
  constructor(private id: string, private patch: Partial<UmlElement>) {}

  execute(project: Project): Project {
    const idx = project.elements.findIndex((e) => e.id === this.id);
    if (idx < 0) return project;
    const cur = project.elements[idx];
    this.prev = cur;
    const next = { ...cur, ...this.patch };
    const elements = project.elements.slice();
    elements[idx] = next;
    return { ...project, elements };
  }

  undo(project: Project): Project {
    if (!this.prev) return project;
    const idx = project.elements.findIndex((e) => e.id === this.id);
    if (idx < 0) return project;
    const elements = project.elements.slice();
    elements[idx] = this.prev;
    return { ...project, elements };
  }
}

export class MoveElementsCommand implements Command {
  constructor(private ids: string[], private dx: number, private dy: number) {}

  execute(project: Project): Project {
    const elements = project.elements.map((e) =>
      this.ids.includes(e.id)
        ? { ...e, position: { x: e.position.x + this.dx, y: e.position.y + this.dy } }
        : e,
    );
    return { ...project, elements };
  }

  undo(project: Project): Project {
    const elements = project.elements.map((e) =>
      this.ids.includes(e.id)
        ? { ...e, position: { x: e.position.x - this.dx, y: e.position.y - this.dy } }
        : e,
    );
    return { ...project, elements };
  }
}

export class CreateRelationshipCommand implements Command {
  constructor(private relationship: Relationship) {}

  execute(project: Project): Project {
    return { ...project, relationships: [...project.relationships, this.relationship] };
  }

  undo(project: Project): Project {
    return { ...project, relationships: project.relationships.filter((r) => r.id !== this.relationship.id) };
  }
}

export class UpdateRelationshipCommand implements Command {
  private prev?: Relationship;
  constructor(private id: string, private patch: Partial<Relationship>) {}

  execute(project: Project): Project {
    const idx = project.relationships.findIndex((r) => r.id === this.id);
    if (idx < 0) return project;
    const cur = project.relationships[idx];
    this.prev = cur;
    const next = { ...cur, ...this.patch };
    const relationships = project.relationships.slice();
    relationships[idx] = next;
    return { ...project, relationships };
  }

  undo(project: Project): Project {
    if (!this.prev) return project;
    const idx = project.relationships.findIndex((r) => r.id === this.id);
    if (idx < 0) return project;
    const relationships = project.relationships.slice();
    relationships[idx] = this.prev;
    return { ...project, relationships };
  }
}
