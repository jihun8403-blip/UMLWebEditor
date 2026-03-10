* * *

# UML Web Editor

## System Design Specification (SDS) – MVP

* * *

# 1. 시스템 개요

UML Web Editor는 브라우저에서 실행되는 **정적 웹 기반 UML 다이어그램 편집기**이다.

본 시스템은 UML 요소를 단순 시각 객체가 아니라 **구조화된 데이터 모델**로 관리하며, 캔버스 렌더링 엔진과 데이터 모델을 분리한 아키텍처를 사용한다.

핵심 목표

* UML 요소의 데이터 기반 관리
    
* 캔버스 기반 편집 환경 제공
    
* JSON 기반 프로젝트 저장/불러오기
    
* 이미지/PDF export 지원
    

* * *

# 2. 전체 아키텍처

시스템은 다음 4개 계층으로 구성된다.

UI Layer  
 │  
Canvas Engine  
 │  
Application State  
 │  
Data Model

각 계층 역할

### UI Layer

사용자 인터페이스

* Toolbar
    
* Property Panel
    
* Canvas View
    
* Export Dialog
    

### Canvas Engine

그래픽 렌더링 및 사용자 상호작용 처리

* 요소 렌더링
    
* 드래그
    
* 선택
    
* 관계선 연결
    
* 줌 / 팬
    

### Application State

편집 상태 관리

* 선택 상태
    
* 히스토리 관리
    
* undo/redo
    
* 캔버스 상태


### Diagram Type 전환 정책 (MVP)

MVP에서 다이어그램 타입 전환은 **요소 변환 없이 숨김 처리**로 동작한다.

- `diagramType`은 캔버스의 현재 모드를 의미한다.
- 요소/관계 데이터는 삭제/변환하지 않고 유지한다.
- 렌더링 시점에 `diagramType`에 맞는 요소/관계만 필터링하여 그린다.

예: `diagramType=usecase`일 때 클래스 요소는 데이터에 남아있지만 캔버스에는 표시되지 않는다.
    

### Data Model

UML 데이터 구조

* elements
    
* relationships
    
* diagram metadata
    

* * *

# 3. 기술 스택

## Frontend Framework

추천

React + TypeScript

이유

* 상태 관리 용이
    
* 컴포넌트 구조 명확
    
* 대규모 UI 관리 용이
    

* * *

## Canvas Rendering

추천

HTML5 Canvas

이유

* 요소 수가 많을 때 DOM보다 효율적
    
* 드래그 성능 우수
    
* 그래픽 제어 유연
    

* * *

## State Management

추천

Zustand

이유

* 가벼움
    
* undo/redo 구현 용이
    
* React 친화적
    

* * *

### Export (MVP)

- PNG: Canvas를 `toBlob()`/`toDataURL()`로 이미지화하여 다운로드
- PDF: Canvas를 PNG로 변환 후 `jsPDF.addImage()`로 PDF 생성(이미지 기반)
- SVG: 데이터 모델(`elements/relationships`)을 기반으로 별도의 SVG 직렬화 경로를 제공
  - MVP에서는 “표현 가능한 도형/선/텍스트” 범위 내에서만 지원(고급 스타일은 V1+)
* * *

# 4. 주요 컴포넌트 구조

App  
 ├ Toolbar  
 ├ CanvasView  
 ├ PropertyPanel  
 ├ DiagramSwitcher  
 └ ExportDialog

* * *

## Toolbar

기능

* 요소 생성
    
* 관계선 선택
    
* 정렬
    
* 줌
    

* * *

## CanvasView

역할

* 캔버스 렌더링
    
* 사용자 이벤트 처리
    

이벤트

* mouse down
    
* mouse move
    
* mouse up
    
* wheel
    

* * *

## PropertyPanel

우측 패널

기능

* 요소 속성 편집
    
* 클래스 속성/메서드 관리
    
* stereotype 입력
    

* * *

# 5. 데이터 모델

프로젝트 구조

Project  
 ├ metadata  
 ├ diagramType  
 ├ elements[]  
 └ relationships[]

* * *

## Element 구조

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

## Attribute 구조

Attribute {  
  name: string  
  type: string  
  visibility: "public" | "private" | "protected"  
}

* * *

## Method 구조

Method {  
  name: string  
  returnType: string  
  visibility: string  
  parameters: Parameter[]  
}

* * *

## Relationship 구조

Relationship {  
  id: string  
  type: string  
  
  sourceId: string  
  targetId: string  
  
  label?: string  
  
  routing: {  
    points: Point[]  
  }  
}

* * *

# 6. 캔버스 렌더링 엔진

렌더링 흐름

State Update  
   ↓  
Render Queue  
   ↓  
Canvas Draw

* * *

## 렌더링 순서

1. Grid
    
2. Relationship
    
3. Elements
    
4. Selection Box
    
5. Interaction Overlay
    

* * *

# 7. Orthogonal Routing (MVP)

관계선은 직각 꺾은선 방식으로 구현한다.

기본 알고리즘

source center  
   ↓  
horizontal line  
   ↓  
vertical line  
   ↓  
target center

예시

┌──────┐  
│ A    │  
└──┐   │  
   │  
   └───────►  
        ┌──────┐  
        │ B    │  
        └──────┘

MVP 제한

* 장애물 회피 없음
    
* 자동 경로 재계산만 수행
    

* * *

# 8. 선택 시스템

선택 상태

SelectionState {  
  selectedElementIds: string[]  
}

지원

* single select
    
* multi select
    
* drag selection
    

* * *

# 9. Undo / Redo 시스템

히스토리는 **Command Pattern** 기반으로 구현한다.

구조

History  
 ├ undoStack[]  
 └ redoStack[]

Command 구조

Command {  
  execute()  
  undo()  
}

예

* CreateElementCommand
    
* MoveElementCommand
    
* DeleteElementCommand
    
* UpdatePropertyCommand
    

* * *

# 10. 이벤트 처리 흐름

사용자 이벤트 흐름

Mouse Event  
   ↓  
Interaction Controller  
   ↓  
State Update  
   ↓  
Canvas Re-render

* * *

# 11. JSON 저장 구조

저장 예시

{  
  "metadata": {  
    "version": "0.1",  
    "created": "2026-03-10"  
  },  
  
  "diagramType": "class",  
  
  "elements": [  
    {  
      "id": "class1",  
      "type": "class",  
      "name": "User",  
      "position": { "x": 200, "y": 100 }  
    }  
  ],  
  
  "relationships": []  
}

* * *

# 12. Export 시스템

## PNG / SVG

방법

Canvas → Image Export

* * *

## PDF (MVP)

흐름

Canvas → PNG → jsPDF

* * *

# 13. 성능 설계

최적화 전략

### Dirty Rendering

전체 캔버스 대신 변경된 영역만 다시 렌더링

* * *

### Spatial Index

요소 선택 성능 향상을 위해

QuadTree

사용 고려

* * *

### Render Throttling

mousemove 이벤트에서

requestAnimationFrame

사용

* * *

# 14. 오류 처리

주요 오류

* JSON Import 오류
    
* Relationship 연결 오류
    
* 데이터 무결성 오류
    

대응

* 사용자 알림
    
* rollback
    

* * *

# 15. 보안 고려사항

로컬 실행 기반이므로 보안 위험은 낮다.

주의

* JSON Import 시 스크립트 삽입 방지
    
* 파일 크기 제한
    

* * *

# 16. 로그 및 디버깅

개발 모드에서

debug logger

기록

* element 생성
    
* relationship 생성
    
* undo/redo 이벤트
    

* * *

# 17. 향후 확장 설계

아키텍처는 다음 확장을 고려한다.

* Smart routing
    
* Code generation
    
* Reverse engineering
    
* XMI export/import
    
* Git integration
    
* Collaborative editing
    