# UML Web Editor

브라우저에서 실행되는 **정적 웹 기반 UML 다이어그램 편집기**입니다. UML 요소를 단순 도형이 아니라 **데이터 모델 기반(Project JSON)** 으로 관리하며, 단일 캔버스에서 다이어그램 타입을 전환하면서(Class / Use Case / Sequence) 편집할 수 있습니다.

- PRD: `PRD-MVP.md`
- SDS: `SDS-MVP.md`

## 실행 방법

### 요구 사항

- Node.js 18+ 권장

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

- 기본 접속: `http://localhost:5173/`

### 빌드/프리뷰

```bash
npm run build
npm run preview
```

## MVP 범위(요약)

### 캔버스/편집

- 단일 캔버스 + 다이어그램 타입 전환(`diagramType`)
- 타입 전환 정책(MVP): **기존 타입 요소는 변환하지 않고 숨김 처리**
  - 예: Class → Use Case 전환 시 Class 요소는 데이터에 남아있지만 캔버스에 표시되지 않음
- 무한 캔버스(줌/팬), 그리드 표시
- 요소 생성/선택/이동(드래그)
- 우측 Property Panel에서 속성 편집
- Undo/Redo(커맨드 기반)

### 지원 다이어그램(MVP)

- Class Diagram
  - Class / Interface / Abstract Class
- Use Case Diagram
  - Actor / Use Case / System Boundary
- Sequence Diagram
  - Lifeline / Message / Activation

### 관계선(MVP)

- Association / Dependency / Generalization / Realization
- Orthogonal routing(직각 꺾은선)
  - 장애물 회피(스마트 라우팅)는 MVP 제외

### 파일/내보내기(MVP)

- JSON Import / Export
- Export: PNG / SVG / PDF
  - PDF는 **이미지 기반(MVP)**
  - 벡터 기반 PDF는 V1에서 고도화

## 현재 구현 상태(초기 단계)

현재는 MVP 구현을 위한 **프로젝트 스캐폴딩과 최소 동작 뼈대**가 구성된 상태입니다.

- Vite + React + TypeScript
- Zustand 기반 상태 저장소
- Canvas 렌더링(그리드/줌/팬)
- 다이어그램 타입 전환(숨김 필터)
- 기본 요소 생성/선택/드래그 이동
- Property Panel에서 name/stereotype 편집
- Undo/Redo(생성/속성변경/이동 커밋 일부)

## 다음 구현 단계(Backlog)

아래는 `PRD-MVP.md` 기준으로 남아있는 주요 작업 순서입니다.

1. **관계선 편집 고도화**
   - 요소 이동 시 관계선 라우팅 자동 재계산
   - 앵커(시작/끝점) 결정 규칙 정교화
   - 관계선 생성 UI(드래그로 source→target)

2. **파일 관리**
   - 새 프로젝트 / 저장 / 다른 이름으로 저장 / 불러오기(JSON)
   - JSON 스키마 버전(`schemaVersion`) 및 유효성 검증
   - 자동 저장/복구(localStorage)

3. **Export 완성**
   - PNG Export(캔버스 이미지화)
   - PDF Export(캔버스 → 이미지 → jsPDF)
   - SVG Export(데이터 모델 기반 SVG 직렬화)

4. **편집 기능 확장**
   - 다중 선택/그룹 이동
   - 요소 크기 변경(리사이즈 핸들)
   - 정렬(좌/우/중앙/상/하단)

5. **시퀀스 다이어그램 상세**
   - Activation 생성/이동/리사이즈 UX 마무리
   - Message와 Activation 정렬/정합성

6. **테스트/품질**
   - `Test Strategy – MVP.md`/`Test Case 정의서 – MVP.md` 기준 스모크/회귀
   - 성능 목표(요소 300/관계 500) 대응 최적화

## 폴더 구조(요약)

- `src/ui`: React UI 컴포넌트
- `src/vm`: 상태/모델/명령(Command) 등 로직 레이어

## 라이선스

TBD
