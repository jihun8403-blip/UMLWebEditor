export type DiagramType = 'class' | 'usecase' | 'sequence';

export type Point = { x: number; y: number };

export type Size = { width: number; height: number };

export type Viewport = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

export type ElementType =
  | 'class'
  | 'interface'
  | 'abstractClass'
  | 'actor'
  | 'usecase'
  | 'systemBoundary'
  | 'lifeline'
  | 'activation'
  | 'message';

export type UmlElement = {
  id: string;
  diagramType: DiagramType;
  type: ElementType;
  name?: string;
  stereotype?: string;
  position: Point;
  size: { width: number; height: number };
};

export type RelationshipType = 'association' | 'dependency' | 'generalization' | 'realization';

export type Relationship = {
  id: string;
  diagramType: DiagramType;
  type: RelationshipType;
  sourceId: string;
  targetId: string;
  label?: string;
  routing: { points: Point[] };
};

export type Project = {
  metadata: {
    schemaVersion: string;
    createdAt: string;
  };
  diagramType: DiagramType;
  elements: UmlElement[];
  relationships: Relationship[];
  viewport: Viewport;
};
