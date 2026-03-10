* * *

# UML Web Editor

## 요구사항-테스트 매트릭스 (Requirements Traceability Matrix)

* * *

## 1. 문서 개요

본 문서는 PRD 요구사항이 테스트 케이스로 적절히 검증되는지 추적하기 위한 매트릭스이다.  
각 요구사항은 최소 1개 이상의 테스트 케이스에 연결되어야 하며, 핵심 요구사항은 정상/예외/회귀 관점에서 중복 검증하는 것을 원칙으로 한다.

* * *

## 2. 요구사항 ID 정의

### 기능 요구사항 (FR)

* **FR-001**: 단일 캔버스 제공
    
* **FR-002**: 다이어그램 타입 전환 지원
    
* **FR-003**: 클래스 다이어그램 요소 지원
    
* **FR-004**: 유스케이스 다이어그램 요소 지원
    
* **FR-005**: 시퀀스 다이어그램 요소 및 activation 지원
    
* **FR-006**: 우측 패널 중심 속성 편집
    
* **FR-007**: stereotype 입력 지원
    
* **FR-008**: UML 관계선 지원
    
* **FR-009**: orthogonal routing 지원
    
* **FR-010**: 선택/이동/복제/삭제 기능
    
* **FR-011**: grid/snap/정렬 기능
    
* **FR-012**: undo/redo 기능
    
* **FR-013**: 검색 기능
    
* **FR-014**: JSON 저장 기능
    
* **FR-015**: JSON 불러오기/import 및 무결성 유지
    
* **FR-016**: 자동 저장 및 복구
    
* **FR-017**: PNG/SVG export
    
* **FR-018**: PDF 이미지 기반 export
    

### 비기능 요구사항 (NFR)

* **NFR-001**: 요소 300개 / 관계 500개 성능 유지
    
* **NFR-002**: 일반 반응시간 100ms 이하
    
* **NFR-003**: JSON import/export 1초 이하
    
* **NFR-004**: 안정성 및 비정상 종료 복원성
    
* **NFR-005**: 브라우저 호환성
    

* * *

## 3. 매트릭스

| 요구사항 ID | 요구사항 설명 | 대응 테스트 케이스 |
| --- | --- | --- |
| FR-001 | 단일 캔버스 제공 | TC-CV-001 | 
| FR-002 | 다이어그램 타입 전환 지원 | TC-CV-002, TC-CV-003, TC-CV-004, TC-CV-005, TC-CV-006 |
| FR-003 | 클래스 다이어그램 요소 지원 | TC-CL-001, TC-CL-002, TC-CL-003 |
| FR-004 | 유스케이스 다이어그램 요소 지원 | TC-UC-001, TC-UC-002, TC-UC-003 |
| FR-005 | 시퀀스 다이어그램 요소 및 activation 지원 | TC-SQ-001, TC-SQ-002, TC-SQ-003, TC-SQ-004, TC-SQ-005 |
| FR-006 | 우측 패널 중심 속성 편집 | TC-CL-004, TC-CL-005, TC-CL-006, TC-CL-007, TC-PP-001, TC-PP-002, TC-PP-003 |
| FR-007 | stereotype 입력 지원 | TC-CL-008 |
| FR-008 | UML 관계선 지원 | TC-RL-001, TC-RL-002, TC-RL-003, TC-RL-004, TC-RL-007 |
| FR-009 | orthogonal routing 지원 | TC-RL-005, TC-RL-006 |
| FR-010 | 선택/이동/복제/삭제 기능 | TC-ED-001, TC-ED-002, TC-ED-003, TC-ED-004, TC-ED-005, TC-ED-006 |
| FR-011 | grid/snap/정렬 기능 | TC-GR-001, TC-GR-002, TC-GR-003 |
| FR-012 | undo/redo 기능 | TC-HS-001, TC-HS-002, TC-HS-003, TC-HS-004, TC-HS-005 |
| FR-013 | 검색 기능 | TC-SR-001, TC-SR-002, TC-SR-003 |
| FR-014 | JSON 저장 기능 | TC-FL-001 |
| FR-015 | JSON 불러오기/import 및 무결성 유지 | TC-FL-002, TC-FL-003, TC-FL-006 |
| FR-016 | 자동 저장 및 복구 | TC-FL-004, TC-FL-005 |
| FR-017 | PNG/SVG export | TC-EX-001, TC-EX-002 |
| FR-018 | PDF 이미지 기반 export | TC-EX-003 |
| NFR-001 | 요소 300개 / 관계 500개 성능 유지 | TC-PF-001 |
| NFR-002 | 일반 반응시간 100ms 이하 | TC-PF-002 |
| NFR-003 | JSON import/export 1초 이하 | TC-PF-003 |
| NFR-004 | 안정성 및 비정상 종료 복원성 | TC-ST-001, TC-FL-005 |
| NFR-005 | 브라우저 호환성 | TC-CP-001, TC-CP-002, TC-CP-003 |

* * *

## 4. 검토 메모

현재 매트릭스 기준으로 **모든 MVP 요구사항은 최소 1건 이상 테스트 케이스에 연결**되어 있다.  
다만 실무적으로는 아래 항목을 다음 단계에서 더 보강하면 좋다.

* 관계선 label/multiplicity 편집 세부 케이스 추가
    
* 타입 전환 시 기존 데이터 보존/숨김 정책 테스트 추가
    
* 자동 저장 충돌 시나리오 추가
    
* export 결과 해상도 및 페이지 크기 옵션 테스트 추가
    
* 시퀀스 activation과 message 정합성 케이스 추가