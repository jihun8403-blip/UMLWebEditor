# 1. 문서 목적

본 문서는 UML Web Editor MVP의 **요구사항과 테스트 케이스 간 추적성을 확보**하기 위해 작성되었다.

RTM의 목적은 다음과 같다.

* 모든 요구사항이 최소 1개 이상의 테스트로 검증되는지 확인
    
* 테스트 누락 여부 발견
    
* QA 진행 시 요구사항 기반 검증 가능
    
* 릴리즈 품질 근거 확보
    

* * *

# 2. 요구사항 분류

요구사항은 다음 두 가지로 구분된다.

FR  Functional Requirement  
NFR Non-Functional Requirement

* * *

# 3. 기능 요구사항 매트릭스

| 요구사항 ID | 요구사항 설명 | 연결 테스트 케이스 |
| --- | --- | --- |
| FR-001 | 단일 캔버스 기반 UML 편집 환경 제공 | TC-CV-001 |
| FR-002 | 다이어그램 타입 전환(Class / UseCase / Sequence) | TC-CV-002, TC-CV-003, TC-CV-004, TC-CV-005, TC-CV-006, TC-CV-007, TC-CV-008 |
| FR-003 | 클래스 다이어그램 요소 생성(Class, Interface, Abstract Class) | TC-CL-001, TC-CL-002, TC-CL-003, TC-ED-007 |
| FR-004 | 유스케이스 다이어그램 요소 생성(Actor, Use Case, Boundary) | TC-UC-001, TC-UC-002, TC-UC-003 |
| FR-005 | 시퀀스 다이어그램 요소 생성(Lifeline, Message, Activation) | TC-SQ-001, TC-SQ-002, TC-SQ-003, TC-SQ-004, TC-SQ-005 |
| FR-006 | Property Panel 기반 요소 속성 편집 | TC-CL-004, TC-CL-005, TC-CL-006, TC-CL-007, TC-PP-001, TC-PP-002, TC-PP-003 |
| FR-007 | stereotype 입력 및 표시 | TC-CL-008 |
| FR-008 | UML 관계선 생성(Association, Dependency, Generalization, Realization) | TC-RL-001, TC-RL-002, TC-RL-003, TC-RL-004, TC-RL-007 |
| FR-009 | Orthogonal Routing 관계선 렌더링 | TC-RL-005, TC-RL-006 |
| FR-010 | 요소 편집 기능(선택, 이동, 재편집, 복제, 삭제, Resize) | TC-ED-001, TC-ED-002, TC-ED-003, TC-ED-004, TC-ED-005, TC-ED-006, TC-ED-008, TC-ED-009, TC-ED-010, TC-ED-011, TC-ED-012, TC-ED-013, TC-ED-014, TC-ED-015 |
| FR-011 | Grid 표시, Snap 및 정렬 기능 | TC-GR-001, TC-GR-002, TC-GR-003 |
| FR-012 | Undo / Redo 편집 히스토리 관리 | TC-HS-001, TC-HS-002, TC-HS-003, TC-HS-004, TC-HS-005, TC-HS-006 |
| FR-013 | 다이어그램 요소 검색 기능 | TC-SR-001, TC-SR-002, TC-SR-003 |
| FR-014 | 프로젝트 JSON 저장 기능 | TC-FL-001 |
| FR-015 | JSON Import / Export 및 데이터 무결성 보장 | TC-FL-002, TC-FL-003, TC-FL-006 |
| FR-016 | 자동 저장 및 복구 기능 | TC-FL-004, TC-FL-005 |
| FR-017 | 이미지 Export(PNG, SVG) | TC-EX-001, TC-EX-002 |
| FR-018 | PDF Export (이미지 기반) | TC-EX-003 |

* * *

# 4. 비기능 요구사항 매트릭스

| 요구사항 ID | 요구사항 설명 | 연결 테스트 케이스 |
| --- | --- | --- |
| NFR-001 | 대규모 다이어그램 편집 성능 유지 | TC-PF-001 |
| NFR-002 | 편집 반응 시간 100ms 이하 | TC-PF-002 |
| NFR-003 | JSON Import/Export 처리 시간 1초 이하 | TC-PF-003 |
| NFR-004 | 장시간 편집 안정성 보장 | TC-ST-001 |
| NFR-005 | 주요 브라우저 호환성 (Chrome, Edge, Firefox) | TC-CP-001, TC-CP-002, TC-CP-003 |

* * *

# 5. 요구사항 커버리지 검증

## 요구사항 커버리지

Functional Requirements 18개  
Non-Functional Requirements 5개

모든 요구사항은 최소 1개 이상의 테스트 케이스와 연결되어 있다.

* * *

## 테스트 커버리지

총 테스트 케이스 약 70개

분포

Canvas / Mode           8  
Class Diagram           8  
Use Case                3  
Sequence Diagram        5  
Relationships           7  
Property Panel          3  
Editing                15  
Grid / Alignment        3  
Undo / Redo             6  
Search                  3  
File I/O                6  
Export                  3  
Performance             3  
Stability / Compat      4

* * *

# 6. 검토 메모

다음 사항은 RTM 검토 시 확인해야 한다.

### 타입 전환 정책

타입 전환 시

비활성 타입 요소 → 숨김 처리  
데이터 유지  
복귀 시 복원

관련 테스트

TC-CV-006  
TC-CV-007  
TC-CV-008

* * *

### 편집 기능 검증

요소 편집 기능은 다음 테스트로 검증된다.

선택  
이동  
Resize  
복제  
삭제  
HitTest  
Drag Threshold

관련 테스트

TC-ED-001 ~ TC-ED-015

* * *

### 데이터 무결성 검증

저장 및 복구 시 다음을 검증한다.

요소 수  
관계 수  
속성 값  
좌표

관련 테스트

TC-FL-002  
TC-FL-003

* * *

# 7. RTM 활용 방법

RTM은 다음 상황에서 활용된다.

* 테스트 계획 수립
    
* QA 진행 시 요구사항 검증
    
* 릴리즈 승인
    
* 회귀 테스트 관리
    

특히 다음 질문에 답할 수 있다.

이 요구사항은 테스트되었는가?  
이 테스트는 어떤 요구사항을 검증하는가?

* * *

# RTM 품질 상태

현재 RTM 기준

요구사항 커버리지 100%  
테스트 매핑 완료  
MVP 기준 누락 없음

* * *
