## WBS (Work Breakdown Structure)

이 WBS는 **MVP 기준 약 2주 개발**을 목표로 구성했다.  
순서는 캔버스 엔진 → 데이터 모델 → 편집 기능 → 파일 기능 순으로 진행하는 것이 가장 안정적이다.

* * *

# 1. 프로젝트 초기 설정

## 1.1 개발 환경 구성

작업

* 프로젝트 생성
    
* TypeScript 설정
    
* ESLint / Prettier 설정
    
* 개발 서버 설정
    
* 기본 폴더 구조 생성
    

산출물

* 초기 Git 저장소
    
* 기본 앱 실행 가능 상태
    

* * *

## 1.2 기본 UI 레이아웃

작업

* Toolbar 컴포넌트
    
* Canvas 영역
    
* Property Panel
    
* Diagram Type Switcher
    
* 기본 스타일 설정
    

산출물

* 빈 캔버스 UI
    

* * *

# 2. 데이터 모델 구현

## 2.1 UML 데이터 구조 정의

작업

* Element 타입 정의
    
* Relationship 타입 정의
    
* Attribute / Method 구조 정의
    
* Diagram 타입 정의
    

산출물

* TypeScript 인터페이스
    

예

Element  
Relationship  
Diagram  
Project

* * *

## 2.2 상태 관리 구조

작업

* global state store 생성
    
* elements 상태 관리
    
* relationships 상태 관리
    
* selection 상태 관리
    

산출물

* State Store
    

* * *

## 2.3 히스토리 시스템

작업

* undo stack
    
* redo stack
    
* command 패턴 구조
    

산출물

HistoryManager  
Command interface

* * *

# 3. 캔버스 엔진

이 단계가 사실상 프로젝트의 핵심이다.

* * *

## 3.1 Canvas 렌더링 엔진

작업

* canvas 초기화
    
* render loop
    
* element drawing
    
* relationship drawing
    

산출물

CanvasRenderer

* * *

## 3.2 좌표 시스템

작업

* world 좌표
    
* screen 좌표
    
* zoom
    
* pan
    

산출물

ViewportController

* * *

## 3.3 hit detection

작업

* element hit test
    
* relationship hit test
    
* selection 영역 계산
    

산출물

HitTestEngine

* * *

# 4. 요소 생성 시스템

## 4.1 요소 생성

작업

* Class 생성
    
* Actor 생성
    
* UseCase 생성
    
* Lifeline 생성
    

산출물

ElementFactory

* * *

## 4.2 생성 위치 규칙

작업

* PlacementManager 구현
    
* offset 생성 규칙
    
* viewport 중심 생성
    

산출물

PlacementManager

* * *

# 5. 편집 시스템

## 5.1 선택 시스템

작업

* single select
    
* multi select
    
* drag select
    

산출물

SelectionManager

* * *

## 5.2 이동 시스템

작업

* drag start
    
* drag update
    
* drag end
    
* 좌표 업데이트
    

산출물

MoveController

* * *

## 5.3 Resize 시스템

작업

* resize handle 표시
    
* resize drag 처리
    

산출물

ResizeController

* * *

## 5.4 속성 편집

작업

* property panel UI
    
* name 수정
    
* attribute 수정
    
* method 수정
    

산출물

PropertyPanel

* * *

## 5.5 복제 / 삭제

작업

* duplicate command
    
* delete command
    
* 관계선 정리
    

산출물

DuplicateCommand  
DeleteCommand

* * *

# 6. 관계선 시스템

## 6.1 관계선 생성

작업

* relationship 도구
    
* source 선택
    
* target 선택
    

산출물

RelationshipCreator

* * *

## 6.2 orthogonal routing

작업

* anchor 계산
    
* 직각 경로 생성
    

산출물

OrthogonalRouter

* * *

# 7. 시퀀스 다이어그램 기능

## 7.1 Lifeline

작업

* lifeline 렌더링
    
* vertical axis
    

* * *

## 7.2 Message

작업

* message arrow
    
* 연결 처리
    

* * *

## 7.3 Activation

작업

* activation block
    
* resize 가능 처리
    

* * *

# 8. 편의 기능

## 8.1 Grid

작업

* grid rendering
    
* grid snap
    

* * *

## 8.2 정렬 기능

작업

* left align
    
* right align
    
* center align
    

* * *

## 8.3 검색 기능

작업

* element search
    
* highlight
    

* * *

# 9. 파일 기능

## 9.1 JSON 저장

작업

* serialize project
    
* export json
    

* * *

## 9.2 JSON import

작업

* parse json
    
* restore state
    

* * *

## 9.3 자동 저장

작업

* local storage 저장
    
* 복구 로직
    

* * *

# 10. Export 기능

## 10.1 PNG export

작업

* canvas image export
    

* * *

## 10.2 SVG export

작업

* vector export
    

* * *

## 10.3 PDF export

작업

* canvas → image
    
* jsPDF export
    

* * *

# 11. 성능 최적화

## 11.1 렌더링 최적화

작업

* requestAnimationFrame
    
* dirty render
    

* * *

## 11.2 선택 성능

작업

* spatial index
    

* * *

# 12. 테스트

## 12.1 단위 테스트

작업

* data model
    
* routing
    
* undo system
    

* * *

## 12.2 기능 테스트

작업

* element 생성
    
* drag 이동
    
* json import/export
    

* * *

## 12.3 성능 테스트

작업

* 300 element
    
* 500 relationship