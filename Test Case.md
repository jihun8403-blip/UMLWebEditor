# 1. 문서 개요

본 문서는 **UML Web Editor MVP 기능을 검증하기 위한 테스트 케이스를 정의한다.**

목표

* 기능 요구사항 검증
    
* 데이터 모델 무결성 검증
    
* 캔버스 편집 상호작용 검증
    
* 성능 및 안정성 확인
    

테스트 케이스는 **요구사항 추적성(Requirement Traceability)**을 유지하도록 작성한다.

* * *

# 2. 테스트 케이스 구성 기준

각 테스트 케이스는 다음 항목으로 구성된다.

| 항목 | 설명 |
| --- | --- |
| TC ID | 테스트 고유 ID |
| 요구사항 ID | 대응 요구사항 |
| 기능 분류 | 기능 영역 |
| 테스트 제목 | 검증 목적 |
| 사전 조건 | 테스트 시작 상태 |
| 절차 | 수행 단계 |
| 기대 결과 | 성공 기준 |
| 우선순위 | Critical / High / Medium / Low |
| 자동화 후보 | Yes / Later / No |

* * *

# 3. 테스트 범위

MVP 테스트 범위

Canvas  
Diagram Mode  
Element Creation  
Element Editing  
Relationships  
Property Panel  
Grid & Alignment  
Undo / Redo  
Search  
File Save / Load  
Export  
Performance  
Compatibility

* * *

# 4. 테스트 케이스

* * *

# A. 캔버스 및 다이어그램 타입

| TC ID | 요구사항 | 기능 | 테스트 제목 | 절차 | 기대 결과 |
| --- | --- | --- | --- | --- | --- |
| TC-CV-001 | FR-001 | Canvas | 앱 실행 시 단일 캔버스 표시 | 앱 실행 | 단일 캔버스와 기본 UI 표시 |
| TC-CV-002 | FR-002 | Mode | Class 모드 전환 | Class 선택 | 캔버스 모드 변경 |
| TC-CV-003 | FR-002 | Mode | Use Case 모드 전환 | UseCase 선택 | 모드 변경 |
| TC-CV-004 | FR-002 | Mode | Sequence 모드 전환 | Sequence 선택 | 모드 변경 |
| TC-CV-005 | FR-002 | Mode | 타입별 툴셋 변경 | 모드 전환 반복 | 해당 타입 툴 표시 |
| TC-CV-006 | FR-002 | Mode | 타입 전환 시 요소 숨김 처리 | Class→UseCase | 클래스 요소 숨김 |
| TC-CV-007 | FR-002 | Mode | 타입 복귀 시 요소 복원 | UseCase→Class | 기존 요소 복원 |
| TC-CV-008 | FR-002 | Mode | 타입 전환 시 선택 상태 초기화 | 요소 선택 → 타입 변경 | 선택 해제 |

* * *

# B. 클래스 다이어그램

| TC ID | 요구사항 | 기능 | 테스트 제목 |
| --- | --- | --- | --- |
| TC-CL-001 | FR-003 | 생성 | Class 생성 |
| TC-CL-002 | FR-003 | 생성 | Interface 생성 |
| TC-CL-003 | FR-003 | 생성 | Abstract Class 생성 |

속성 편집

| TC ID | 요구사항 | 기능 | 테스트 제목 |
| --- | --- | --- | --- |
| TC-CL-004 | FR-006 | 속성 | 클래스 이름 수정 |
| TC-CL-005 | FR-006 | 속성 | Attribute 추가 |
| TC-CL-006 | FR-006 | 속성 | Method 추가 |
| TC-CL-007 | FR-006 | 속성 | Visibility 변경 |
| TC-CL-008 | FR-007 | 확장 | stereotype 입력 |

* * *

# C. 유스케이스 다이어그램

| TC ID | 요구사항 | 기능 | 테스트 |
| --- | --- | --- | --- |
| TC-UC-001 | FR-004 | 생성 | Actor 생성 |
| TC-UC-002 | FR-004 | 생성 | Use Case 생성 |
| TC-UC-003 | FR-004 | 생성 | System Boundary 생성 |

* * *

# D. 시퀀스 다이어그램

| TC ID | 요구사항 | 기능 | 테스트 |
| --- | --- | --- | --- |
| TC-SQ-001 | FR-005 | 생성 | Lifeline 생성 |
| TC-SQ-002 | FR-005 | 생성 | Message 생성 |
| TC-SQ-003 | FR-005 | 생성 | Activation 생성 |
| TC-SQ-004 | FR-005 | 편집 | Activation 길이 조절 |
| TC-SQ-005 | FR-005 | 편집 | Message 정렬 |

* * *

# E. 관계선

| TC ID | 요구사항 | 기능 | 테스트 |
| --- | --- | --- | --- |
| TC-RL-001 | FR-008 | 관계 | Association 생성 |
| TC-RL-002 | FR-008 | 관계 | Dependency 생성 |
| TC-RL-003 | FR-008 | 관계 | Generalization 생성 |
| TC-RL-004 | FR-008 | 관계 | Realization 생성 |
| TC-RL-005 | FR-009 | 라우팅 | Orthogonal routing |
| TC-RL-006 | FR-009 | 라우팅 | 요소 이동 시 선 갱신 |
| TC-RL-007 | FR-008 | 관계 | 관계 label 입력 |

* * *

# F. Property Panel

| TC ID | 요구사항 | 기능 | 테스트 |
| --- | --- | --- | --- |
| TC-PP-001 | FR-006 | 패널 | 요소 선택 시 패널 표시 |
| TC-PP-002 | FR-006 | 패널 | 선택 해제 시 패널 초기화 |
| TC-PP-003 | FR-006 | 패널 | 선택 변경 시 패널 갱신 |

* * *

# G. 편집 (Selection / Move / Resize)

| TC ID | 요구사항 | 기능 | 테스트 |
| --- | --- | --- | --- |
| TC-ED-001 | FR-010 | 선택 | 단일 선택 |
| TC-ED-002 | FR-010 | 선택 | 다중 선택 |
| TC-ED-003 | FR-010 | 이동 | 요소 드래그 이동 |
| TC-ED-004 | FR-010 | 이동 | 그룹 이동 |
| TC-ED-005 | FR-010 | 편집 | 요소 복제 |
| TC-ED-006 | FR-010 | 편집 | 요소 삭제 |
| TC-ED-007 | FR-003 | 생성 | 연속 생성 offset 적용 |
| TC-ED-008 | FR-010 | 이동 | 드래그 이동 좌표 갱신 |
| TC-ED-009 | FR-010 | 관계 | 이동 시 관계선 갱신 |
| TC-ED-010 | FR-010 | 편집 | 속성 재편집 |
| TC-ED-011 | FR-010 | 크기 | Resize 기능 |
| TC-ED-012 | FR-010 | 복제 | 복제 offset 적용 |
| TC-ED-013 | FR-010 | HitTest | 요소 클릭 시 선택 |
| TC-ED-014 | FR-010 | HitTest | Resize Handle 우선 선택 |
| TC-ED-015 | FR-010 | Interaction | Drag threshold 적용 |

* * *

# H. Grid / 정렬

| TC ID | 요구사항 | 기능 |
| --- | --- | --- |
| TC-GR-001 | FR-011 | Grid 표시 |
| TC-GR-002 | FR-011 | Grid Snap |
| TC-GR-003 | FR-011 | 좌측 정렬 |

* * *

# I. Undo / Redo

| TC ID | 요구사항 | 테스트 |
| --- | --- | --- |
| TC-HS-001 | FR-012 | 생성 Undo |
| TC-HS-002 | FR-012 | Redo |
| TC-HS-003 | FR-012 | 속성 변경 Undo |
| TC-HS-004 | FR-012 | 관계선 Undo |
| TC-HS-005 | FR-012 | Redo 스택 초기화 |
| TC-HS-006 | FR-012 | 타입 전환 영향 없음 |

* * *

# J. 검색

| TC ID | 요구사항 | 테스트 |
| --- | --- | --- |
| TC-SR-001 | FR-013 | 클래스 이름 검색 |
| TC-SR-002 | FR-013 | 속성 검색 |
| TC-SR-003 | FR-013 | 검색 결과 없음 |

* * *

# K. 파일

| TC ID | 요구사항 | 테스트 |
| --- | --- | --- |
| TC-FL-001 | FR-014 | JSON 저장 |
| TC-FL-002 | FR-015 | JSON 불러오기 |
| TC-FL-003 | FR-015 | Export → Import 무결성 |
| TC-FL-004 | FR-016 | 자동 저장 |
| TC-FL-005 | FR-016 | 자동 복구 |
| TC-FL-006 | FR-015 | 잘못된 JSON 처리 |

* * *

# L. Export

| TC ID | 요구사항 | 테스트 |
| --- | --- | --- |
| TC-EX-001 | FR-017 | PNG Export |
| TC-EX-002 | FR-017 | SVG Export |
| TC-EX-003 | FR-018 | PDF Export |

* * *

# M. 성능

| TC ID | 요구사항 | 테스트 |
| --- | --- | --- |
| TC-PF-001 | NFR-001 | 300 요소 + 500 관계 성능 |
| TC-PF-002 | NFR-002 | 편집 반응 < 100ms |
| TC-PF-003 | NFR-003 | JSON I/O < 1s |

* * *

# N. 안정성 / 호환성

| TC ID | 요구사항 | 테스트 |
| --- | --- | --- |
| TC-ST-001 | NFR-004 | 장시간 편집 안정성 |
| TC-CP-001 | NFR-005 | Chrome |
| TC-CP-002 | NFR-005 | Edge |
| TC-CP-003 | NFR-005 | Firefox |

* * *

# 테스트 규모

총 테스트 케이스

약 70개

테스트 분포

Canvas / Mode        8  
Class Diagram        8  
UseCase              3  
Sequence             5  
Relationships        7  
Property Panel       3  
Editing             15  
Grid / Alignment     3  
Undo / Redo          6  
Search               3  
File I/O             6  
Export               3  
Performance          3  
Stability / Compat   4

* * *

# 최종 테스트 전략

MVP 테스트 우선순위

Critical  
  File I/O  
  Undo/Redo  
  Element Move  
  Relationship Update  
  
High  
  Editing  
  Property Panel  
  Mode Switching  
  
Medium  
  Grid / Alignment  
  Search
