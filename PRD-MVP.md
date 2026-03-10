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

# 10. 편집 기능

## 10.1 선택 기능

* 단일 선택
    
* 다중 선택
    
* 그룹 이동
    

* * *

## 10.2 편집 기능

* 요소 생성
    
* 요소 이동
    
* 요소 크기 변경
    
* 복제
    
* 삭제
    

* * *

## 10.3 Undo / Redo

다음 작업에 대해 Undo / Redo 지원

* 요소 생성
    
* 요소 삭제
    
* 위치 이동
    
* 관계선 연결
    
* 속성 수정
    

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
    
