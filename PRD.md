* * *

# UML Web Editor

## Product Requirements Document (PRD) – MVP

* * *

# 1. 제품 개요

본 제품은 설치 없이 브라우저에서 실행 가능한 **정적 웹 기반 UML 다이어그램 편집기**이다.

사용자는 UML 다이어그램을 생성하고 편집하며, UML 요소의 속성을 데이터 기반으로 관리할 수 있다. 생성된 다이어그램은 JSON 형식으로 저장하거나 불러올 수 있으며 PNG, SVG, PDF 형식으로 내보낼 수 있다.

본 제품은 단순 드로잉 도구가 아니라 **UML 모델을 데이터로 관리하는 모델 기반 편집기(Model-based Diagram Editor)**를 목표로 한다.

초기 MVP에서는 UML 작성의 핵심 기능에 집중하며, 향후 확장을 고려한 구조를 유지한다.

* * *

# 2. 제품 목표

본 제품의 주요 목표는 다음과 같다.

* 브라우저에서 **설치 없이 UML 작성**
    
* UML 요소를 **데이터 모델 기반으로 관리**
    
* 직관적인 편집 UI 제공
    
* JSON 기반 **프로젝트 저장 및 재사용**
    
* 설계 결과를 **이미지 및 PDF로 공유**
    

* * *

# 3. 제품 범위 (MVP)

MVP에서는 UML 작성의 핵심 기능만 제공한다.

지원 범위

* UML 다이어그램 생성 및 편집
    
* UML 요소 속성 편집
    
* JSON 기반 프로젝트 저장 및 불러오기
    
* 이미지 및 PDF export
    
* 로컬 브라우저 기반 실행
    

제외 범위

* 스마트 라우팅 고도화
    
* 코드 생성
    
* 리버스 엔지니어링
    
* XMI 호환
    
* 실시간 협업
    

* * *

# 4. 실행 환경

## 4.1 실행 방식

본 제품은 **정적 웹 애플리케이션(static web app)** 으로 제공된다.

특징

* 서버 설치 필요 없음
    
* 인터넷 연결 없이 실행 가능
    
* 로컬 브라우저에서 바로 사용 가능
    

지원 브라우저

* Chrome (권장)
    
* Edge
    
* Firefox
    

* * *

# 5. 캔버스 구조

## 5.1 단일 캔버스 모델

본 제품은 **단일 캔버스 구조**를 사용한다.

다이어그램은 캔버스를 새로 생성하는 방식이 아니라 **다이어그램 타입을 전환하는 방식**으로 동작한다.

예

Canvas  
 └ Diagram Type  
      ├ Class  
      ├ Use Case  
      └ Sequence

타입 전환 시 기존 요소는 숨겨지거나 변환된다. 

예: 클래스 다이어그램에서 유스케이스 다이어그램으로 전환 시, 클래스 요소는 숨겨진다.

* * *

# 6. 지원 UML 다이어그램 (MVP)

MVP에서는 다음 다이어그램을 지원한다.

### 클래스 다이어그램

* Class
    
* Interface
    
* Abstract Class
    

### 유스케이스 다이어그램

* Actor
    
* Use Case
    
* System Boundary
    

### 시퀀스 다이어그램

* Lifeline
    
* Message
    
* Activation
    

* * *

# 7. UML 요소 속성 관리

모든 UML 요소는 **데이터 모델 기반 객체**로 관리된다.

속성 편집은 **우측 패널(Property Panel)** 에서 수행한다.

## 7.1 클래스 요소

편집 가능한 속성

* Class Name
    
* Attributes
    
* Methods
    
* Visibility
    

Visibility 표기

+ public  
- private  
# protected

* * *

## 7.2 스테레오타입

UML stereotype 입력 지원

예

<<interface>>  
<<entity>>  
<<control>>

* * *

# 8. 관계선 (Relationship)

다음 UML 관계를 지원한다.

* Association
    
* Dependency
    
* Generalization
    
* Realization
    

* * *

## 8.1 Orthogonal Routing (MVP)

관계선은 **직각 꺾은선(orthogonal routing)** 형태로 표현된다.

특징

* 시작점 / 끝점 anchor
    
* 직각 경로 유지
    
* 요소 이동 시 자동 업데이트
    

MVP에서는 **장애물 회피 기능은 제공하지 않는다.**

* * *

# 9. 캔버스 기능

## 9.1 무한 캔버스

캔버스는 무한 확장을 지원한다.

사용자는 다음 기능을 사용할 수 있어야 한다.

* Zoom In / Out
    
* Pan 이동
    
* Mini Map
    

* * *

## 9.2 그리드 기능

편집 편의를 위해 다음 기능을 제공한다.

* Grid 표시
    
* Grid Snap
    
* 요소 정렬
    

정렬 옵션

* 좌측 정렬
    
* 우측 정렬
    
* 중앙 정렬
    
* 상단 정렬
    
* 하단 정렬
    

* * *

# 10. 편집 기능 (Editing)

본 시스템은 생성된 UML 요소를 **지속적으로 수정하고 재배치할 수 있는 편집 기능**을 제공해야 한다.

편집 기능은 UML 편집기의 핵심 기능이며, 생성된 요소는 항상 수정 가능 상태여야 한다.

* * *

# 10.1 요소 생성 (Element Creation)

사용자는 UML 요소를 캔버스에 생성할 수 있어야 한다.

지원 요소

* Class
    
* Interface
    
* Abstract Class
    
* Actor
    
* Use Case
    
* System Boundary
    
* Lifeline
    
* Message
    
* Activation
    

* * *

## 10.1.1 요소 생성 위치 규칙

연속 생성 시 요소가 동일 위치에 겹치지 않도록 생성 위치 정책을 적용한다.

생성 규칙

* 기본 생성 위치는 **현재 뷰포트 중심 또는 마지막 생성 위치**를 기준으로 한다.
    
* 연속 생성 시 새 요소는 이전 요소 대비 **우측 하단 방향으로 일정 간격(offset)** 을 두고 생성한다.
    
* 기본 오프셋 값
    

x + 24px  
y + 24px

* 생성 위치가 캔버스 가시 영역을 벗어날 경우 자동으로 뷰포트 내부로 보정한다.
    

수용 기준

* 요소를 연속 생성해도 동일 좌표에 겹치지 않는다.
    
* 생성된 모든 요소는 즉시 선택 가능해야 한다.
    

* * *

# 10.2 요소 선택 (Selection)

사용자는 캔버스에서 UML 요소를 선택할 수 있어야 한다.

지원 방식

* 단일 선택
    
* 다중 선택
    
* 드래그 선택
    
* 빈 캔버스 클릭 시 선택 해제
    

선택된 요소는 다음 방식으로 표시된다.

* 선택 테두리 표시
    
* Resize 핸들 표시
    
* 속성 패널 활성화
    

* * *

# 10.3 요소 이동 (Element Movement)

사용자는 생성된 UML 요소를 자유롭게 이동할 수 있어야 한다.

동작 방식

* 마우스 드래그를 통해 요소 이동
    
* 이동 중 위치가 실시간으로 반영
    
* 이동 완료 시 내부 데이터 모델 좌표 갱신
    

관계선 연결 상태에서의 동작

* 연결된 관계선은 요소 이동에 맞춰 자동 갱신된다.
    
* 관계선 anchor 위치도 함께 재계산된다.
    

* * *

# 10.4 드래그 상호작용 (Drag Interaction)

요소 이동을 위해 드래그 기반 상호작용을 지원해야 한다.

동작 규칙

* 요소 위에서 `mousedown` 후 드래그 시 이동 모드 진입
    
* 클릭과 드래그 구분을 위해 **3~5px 이동 임계값** 적용
    
* 드래그 중 선택 상태 유지
    
* `mouseup` 시 이동 확정
    

* * *

# 10.5 요소 재배치 (Repositioning)

다중 선택된 요소를 동시에 이동하거나 정렬할 수 있어야 한다.

지원 기능

* 그룹 이동
    
* 좌측 정렬
    
* 우측 정렬
    
* 중앙 정렬
    
* 상단 정렬
    
* 하단 정렬
    

Grid Snap 활성화 시

* 요소 이동 시 grid 간격에 맞게 자동 정렬된다.
    

* * *

# 10.6 요소 크기 조절 (Resize)

일부 UML 요소는 크기를 조절할 수 있어야 한다.

Resize 지원 요소

* Class
    
* Interface
    
* Abstract Class
    
* System Boundary
    

Resize 방식

* 선택 시 Resize 핸들 표시
    
* 핸들 드래그로 크기 변경
    

제약 조건

* 최소 크기 제한 존재
    
* 텍스트가 완전히 가려지지 않도록 보장
    

* * *

# 10.7 요소 속성 수정 (Property Editing)

모든 UML 요소의 속성은 **우측 Property Panel**에서 수정할 수 있어야 한다.

지원 편집 항목

* Name
    
* Attributes
    
* Methods
    
* Visibility
    
* Stereotype
    

속성 수정 시

* 즉시 캔버스에 반영
    
* 데이터 모델에 즉시 반영
    

* * *

# 10.8 요소 복제 (Duplicate)

사용자는 선택된 UML 요소를 복제할 수 있어야 한다.

복제 규칙

* 복제 요소는 원본과 동일 속성을 가진다.
    
* 새로운 고유 ID를 가진다.
    
* 원본과 동일 위치가 아닌 **offset 위치**에 생성된다.
    

* * *

# 10.9 요소 삭제 (Delete)

사용자는 선택된 UML 요소를 삭제할 수 있어야 한다.

삭제 규칙

* 요소 삭제 시 해당 요소와 연결된 관계선도 함께 삭제된다.
    
* 삭제 작업은 Undo/Redo 히스토리에 기록된다.
    

* * *

# 10.10 Undo / Redo

사용자의 편집 작업은 Undo / Redo가 가능해야 한다.

지원 작업

* 요소 생성
    
* 요소 삭제
    
* 요소 이동
    
* 관계선 생성
    
* 속성 수정
    
* 크기 변경
    

Undo / Redo 단축키

Ctrl + Z  → Undo  
Ctrl + Y  → Redo   

* * *

# 11. 파일 관리

## 11.1 프로젝트 저장

프로젝트는 JSON 형식으로 저장된다.

기능

* 새 프로젝트
    
* 저장
    
* 다른 이름으로 저장
    
* 불러오기
    

* * *

## 11.2 자동 저장

다음 조건에서 자동 저장 수행

* 편집 후 30초
    
* 주요 편집 이벤트 발생 시
    

자동 저장 위치

Browser Local Storage

* * *

# 12. JSON Import / Export

본 제품의 기본 데이터 포맷은 JSON이다.

지원 기능

* JSON Import
    
* JSON Export
    

데이터 구조

Project  
 ├ metadata  
 ├ diagramType  
 ├ elements[]  
 └ relationships[]

* * *

# 13. Export 기능

다음 형식의 export 기능을 제공한다.

지원 형식

* PNG
    
* SVG
    
* PDF
    

* * *

## 13.1 PDF Export (MVP)

MVP에서는 PDF export를 **이미지 기반 방식**으로 구현한다.

흐름

Canvas → Image → PDF

향후 버전에서는 **벡터 기반 PDF export**로 고도화한다.

* * *

# 14. 성능 요구사항

로컬 실행 환경 기준 성능 목표

### 캔버스 성능

* 요소 300개 이상에서도 캔버스 이동 시 60fps 유지
    
* 관계선 500개까지 편집 성능 유지
    

### 반응 속도

* 일반 UI 반응 시간 100ms 이하
    
* JSON import/export 1초 이하
    
* 이미지 export 3초 이하
    

### 메모리

* 일반 프로젝트 기준 200MB 이하
    

* * *

# 15. 비기능 요구사항

## 15.1 사용성

* 주요 기능은 3클릭 이내 접근 가능해야 한다.
    
* 속성 편집은 우측 패널 중심 UI로 제공한다.
    

* * *

## 15.2 안정성

* 비정상 종료 시 자동 복구 지원
    
* JSON 데이터 무결성 보장
    

* * *

# 16. 향후 확장 계획 (Future Scope)

다음 기능은 MVP 범위에서 제외되며 향후 버전에서 구현한다.

* 스마트 라우팅 (Obstacle Avoidance)
    
* 코드 생성 (Forward Engineering)
    
* 리버스 엔지니어링
    
* XMI Import / Export
    
* Git 기반 버전 관리
    
* 실시간 협업
    
* 벡터 기반 PDF export
    
