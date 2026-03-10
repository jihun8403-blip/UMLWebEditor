# 1. 시스템 개요

UML Web Editor는 브라우저에서 실행되는 **정적 웹 기반 UML 다이어그램 편집기**이다.

설치 없이 브라우저에서 동작하며 UML 다이어그램을 생성, 편집, 저장, 내보내기 할 수 있다.

시스템은 UML 요소를 단순 그래픽이 아니라 **데이터 모델 기반 객체**로 관리하며, 캔버스 렌더링 엔진과 상태 관리 계층을 분리한다.

핵심 목표

* UML 요소의 데이터 기반 관리
    
* 캔버스 기반 편집 환경
    
* JSON Import / Export
    
* PNG / SVG / PDF export
    

* * *

# 2. 전체 아키텍처

시스템은 다음 계층 구조로 구성된다.

UI Layer  
│  
Canvas Engine  
│  
Interaction Layer  
│  
Application State  
│  
Data Model

* * *

# 2.1 UI Layer

사용자 인터페이스 구성

* Toolbar
    
* CanvasView
    
* PropertyPanel
    
* DiagramSwitcher
    
* ExportDialog
    

역할

* 사용자 입력 전달
    
* 상태 표시
    
* 편집 UI 제공
    

* * *

# 2.2 Canvas Engine

그래픽 렌더링 담당

역할

* 요소 렌더링
    
* 관계선 렌더링
    
* Grid 표시
    
* Selection Overlay 표시
    

Canvas 기반 렌더링을 사용한다.

* * *

# 2.3 Interaction Layer

사용자 입력 처리

주요 구성

* InteractionController
    
* SelectionManager
    
* MoveController
    
* ResizeController
    
* HitTestEngine
    

역할

* 마우스 이벤트 처리
    
* 편집 동작 결정
    
* 상태 업데이트 트리거
    

* * *

# 2.4 Application State

편집 상태 관리

구성

* elements
    
* relationships
    
* selection state
    
* viewport
    
* history stack
    

상태 관리 라이브러리

Zustand

* * *

# 2.5 Data Model

UML 데이터 구조 정의

구성

Project  
 ├ metadata  
 ├ diagramType  
 ├ elements[]  
 └ relationships[]

* * *

# 3. 기술 스택

Frontend Framework

React + TypeScript

Canvas Rendering

HTML5 Canvas

State Management

Zustand

Export

jsPDF

* * *

# 4. 주요 컴포넌트 구조

App  
 ├ Toolbar  
 ├ CanvasView  
 ├ PropertyPanel  
 ├ DiagramSwitcher  
 └ ExportDialog

* * *

# 5. 데이터 모델

## 5.1 Project

Project {  
  metadata  
  diagramType  
  elements[]  
  relationships[]  
}

* * *

# 5.2 Element

Element {  
  id: string  
  type: string  
  name: string  
  stereotype?: string  
  
  position: {  
    x: number  
    y: number  
  }  
  
  size: {  
    width: number  
    height: number  
  }  
  
  attributes?: Attribute[]  
  methods?: Method[]  
}

* * *

# 5.3 Attribute

Attribute {  
  name: string  
  type: string  
  visibility: "public" | "private" | "protected"  
}

* * *

# 5.4 Method

Method {  
  name: string  
  returnType: string  
  visibility: string  
  parameters: Parameter[]  
}

* * *

# 5.5 Relationship

Relationship {  
  id: string  
  type: string  
  
  sourceId: string  
  targetId: string  
  
  sourceAnchor?: string  
  targetAnchor?: string  
  
  routing: {  
    points: Point[]  
  }  
  
  label?: string  
}

* * *

# 5.6 Sequence Diagram Model

### Lifeline

Lifeline {  
  elementId  
  actor?: boolean  
}

### Message

Message {  
  id  
  sourceId  
  targetId  
  messageType  
  yPosition  
}

### Activation

Activation {  
  id  
  lifelineId  
  startY  
  endY  
  depth  
}

* * *

# 6. Placement Manager

요소 생성 위치 정책 관리

역할

* 연속 생성 offset
    
* viewport 보정
    
* duplicate offset
    

기본 offset

{ x: 24, y: 24 }

생성 알고리즘

if no previous element  
   place at viewport center  
else  
   place at lastPosition + offset

* * *

# 7. Canvas Rendering Engine

렌더링 흐름

State Update  
   ↓  
Render Queue  
   ↓  
Canvas Draw

렌더링 순서

1 Grid  
2 Relationships  
3 Elements  
4 Selection Overlay  
5 Resize Handles  
6 Interaction Overlay

* * *

# 8. Hit Test Engine

캔버스 좌표 기반 요소 탐지

기능

hitElement(x, y)  
hitResizeHandle(x, y)  
hitRelationship(x, y)

우선순위

1 Resize Handle  
2 Element  
3 Relationship

* * *

# 9. Selection Manager

선택 상태 관리

SelectionState {  
  selectedElementIds: string[]  
}

지원

* single select
    
* multi select
    
* drag select
    
* clear selection
    

API

selectElement(id)  
toggleElement(id)  
clearSelection()  
selectArea(rect)

* * *

# 10. Interaction Controller

사용자 입력 기반 편집 상태 관리

상태 정의

type InteractionMode =  
  | "idle"  
  | "selecting"  
  | "dragging-element"  
  | "dragging-selection"  
  | "resizing-element"  
  | "connecting-relationship"  
  | "panning"

이벤트 흐름

Mouse Event  
   ↓  
HitTestEngine  
   ↓  
InteractionController  
   ↓  
SelectionManager  
   ↓  
Editing Controller  
   ↓  
State Update  
   ↓  
Canvas Re-render

* * *

# 11. Move Controller

요소 이동 처리

구조

MoveController {  
  startDrag(elementIds, startPosition)  
  updateDrag(mousePosition)  
  endDrag()  
}

동작

mousedown  
  → hit test  
mousemove  
  → 위치 업데이트  
mouseup  
  → MoveElementCommand 실행

* * *

# 12. Resize Controller

요소 크기 조절 처리

구조

ResizeController {  
  startResize(elementId, handleType)  
  updateResize(mousePosition)  
  endResize()  
}

Resize Handle

NW  
NE  
SW  
SE

제약

* 최소 크기 존재
    
* 텍스트 영역 보장
    

* * *

# 13. Undo / Redo 시스템

Command Pattern 기반

History  
 ├ undoStack[]  
 └ redoStack[]

Command Interface

Command {  
  execute()  
  undo()  
}

* * *

# 13.1 Command Catalog

지원 Command

CreateElementCommand  
MoveElementCommand  
ResizeElementCommand  
DeleteElementCommand  
DuplicateElementCommand  
UpdatePropertyCommand  
CreateRelationshipCommand  
DeleteRelationshipCommand

* * *

# 14. JSON 저장 구조

예시

{  
  "metadata": {  
    "version": "0.1"  
  },  
  "diagramType": "class",  
  "elements": [],  
  "relationships": []  
}

* * *

# 15. Export 시스템

## PNG Export

Canvas → toBlob() → Download

* * *

## SVG Export

SVG는 Canvas raster가 아닌  
**Data Model 기반 벡터 직렬화 방식**으로 생성한다.

elements → SVG shapes  
relationships → SVG paths  
text → SVG text

* * *

## PDF Export

Canvas → PNG → jsPDF

* * *

# 16. 성능 설계

Dirty Rendering

변경된 영역만 재렌더링

* * *

Render Throttling

requestAnimationFrame

* * *

Spatial Index

QuadTree

요소 선택 성능 향상

* * *

# 17. 오류 처리

주요 오류

* JSON Import 오류
    
* Relationship 연결 오류
    
* 데이터 무결성 오류
    

대응

* 사용자 경고
    
* rollback 처리
    

* * *

# 18. 보안 고려사항

로컬 실행 기반

보안 정책

* JSON Import 검증
    
* 파일 크기 제한
    
* 스크립트 삽입 방지
    

* * *

# 19. 로그 및 디버깅

개발 모드 로그

element creation  
relationship creation  
move  
resize  
undo/redo

* * *

# 20. 향후 확장

다음 기능을 확장 가능하도록 설계

* Smart Routing
    
* Code Generation
    
* Reverse Engineering
    
* XMI Import / Export
    
* Git Integration
    
* Collaborative Editing
    

* * *