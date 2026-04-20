# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**NodeBasicTool** — 게임 데일리 루틴(숙제) 자동화를 위한 설치형 데스크탑 툴.
블랙박스 테스트 방식으로 게임 화면을 인식하고, 비주얼 노드 에디터로 자동화 플로우를 구성·저장·실행한다.

### 핵심 목표
- 유저가 한 번 설정한 플로우는 앱 내부에 영구 저장
- 코딩 없이 노드 연결만으로 자동화 루틴 구성 가능
- PC 게임 우선, 이후 모바일(ADB) 확장 예정

---

## Tech Stack

| 역할 | 기술 |
|---|---|
| 데스크탑 앱 프레임워크 | Electron |
| UI 프레임워크 | React |
| 비주얼 노드 에디터 | React Flow |
| 마우스/키보드 시뮬레이션 | @nut-tree/nut-js |
| 화면 캡처 | screenshot-desktop |
| 이미지 템플릿 매칭 | Python + OpenCV (subprocess 호출) |
| OCR | Tesseract.js |
| 플로우 저장 | 로컬 JSON 파일 (앱 내부 기본 폴더, 앱 내에서 경로 변경 가능) |
| 상태 관리 | Zustand |
| 빌드 | electron-builder |

---

## Project Structure

```
NodeBasicTool/
├── electron/                  # Electron main process
│   ├── main.ts                # 앱 진입점, BrowserWindow 생성
│   ├── ipc/                   # IPC 핸들러 (renderer ↔ main 통신)
│   │   ├── flowHandlers.ts    # 플로우 저장/불러오기
│   │   ├── captureHandlers.ts # 화면 캡처
│   │   └── actionHandlers.ts  # 마우스/키보드 실행
│   └── python/                # Python subprocess 래퍼
│       └── bridge.ts          # OpenCV 호출 인터페이스
├── src/                       # React renderer process
│   ├── components/
│   │   ├── NodeEditor/        # React Flow 기반 노드 에디터
│   │   ├── NodePanel/         # 노드 팔레트 (드래그해서 추가)
│   │   └── FlowManager/       # 플로우 목록·저장·불러오기 UI
│   ├── nodes/                 # 노드 타입 정의
│   │   ├── ActionNodes/       # 클릭, 키 입력, 드래그 등
│   │   ├── ConditionNodes/    # 이미지 감지, OCR 결과 분기 등
│   │   └── ControlNodes/      # 루프, 딜레이, 시퀀스 등
│   └── store/                 # Zustand 전역 상태
├── python/                    # Python OpenCV 스크립트
│   ├── template_match.py      # 템플릿 매칭 실행
│   └── requirements.txt       # opencv-python, numpy
├── flows/                     # 저장된 플로우 JSON (기본 경로)
└── assets/                    # 템플릿 이미지 등 리소스
```

---

## Node Types

### Action Nodes (실행)
- **Click** — 좌표 또는 이미지 위치 클릭
- **KeyInput** — 키보드 입력 (단일키, 조합키)
- **Drag** — 드래그 동작
- **Delay** — 대기 시간

### Condition Nodes (판단)
- **ImageMatch** — 화면에서 템플릿 이미지 탐색 → 발견/미발견 분기
- **OCRRead** — 지정 영역 텍스트 읽기 → 값 비교 분기

### Control Nodes (흐름 제어)
- **Loop** — 지정 횟수 또는 조건 충족까지 반복
- **Sequence** — 노드 순차 실행
- **SubFlow** — 다른 저장된 플로우를 서브루틴으로 호출

---

## Flow Storage

- 기본 저장 경로: `{appData}/NodeBasicTool/flows/`
- 앱 설정에서 저장 경로 변경 가능 (변경 시 기존 플로우 이동 여부 선택)
- 저장 포맷: JSON (React Flow 노드/엣지 구조 + 메타데이터)
- 플로우 파일명: `{flowName}.flow.json`

---

## Python Bridge 규칙

- Electron main process에서 `child_process.spawn`으로 Python 스크립트 호출
- 통신: stdin/stdout JSON
- Python은 로컬에 설치되어 있어야 하며, 앱 실행 시 Python 환경 체크
- OpenCV 의존: `opencv-python`, `numpy`

```
요청 (stdin JSON):  { "action": "template_match", "screen": "<base64>", "template": "<base64>", "threshold": 0.8 }
응답 (stdout JSON): { "found": true, "x": 320, "y": 240, "confidence": 0.95 }
```

---

## IPC 채널 규칙

Electron IPC 채널명은 `도메인:동작` 형식을 따른다.

```
flow:save        플로우 저장
flow:load        플로우 불러오기
flow:list        저장된 플로우 목록
flow:delete      플로우 삭제
flow:setPath     저장 경로 변경

capture:screen   전체 화면 캡처
capture:region   지정 영역 캡처

action:click     마우스 클릭
action:keyInput  키보드 입력
action:drag      드래그

python:match     OpenCV 템플릿 매칭
python:ocr       OCR 텍스트 읽기
```

---

## Getting Started

```bash
npm install              # Node 의존성 설치
pip install -r python/requirements.txt  # Python 의존성 설치
npm run dev              # 개발 모드 (Electron + React HMR)
npm run build            # 프로덕션 빌드
npm run dist             # 설치 파일 패키징 (electron-builder)
```

---

## 개발 원칙

- Electron main/renderer 간 통신은 반드시 IPC를 통해서만 수행 (직접 Node API 노출 금지)
- 노드 타입 추가 시 `src/nodes/` 하위에 타입별 폴더에 정의
- 플로우 JSON 스키마 변경 시 하위 호환성 유지 또는 마이그레이션 로직 추가
- Python 스크립트는 stdin/stdout JSON만으로 통신, 파일 시스템 직접 접근 금지
- 모바일(ADB) 확장을 고려해 액션 실행 레이어는 플랫폼 어댑터 패턴으로 추상화

---

## Git 워크플로우

- **main 브랜치는 직접 수정 금지** — PR 머지로만 반영
- 모든 작업은 별도 브랜치에서 진행

```bash
# 기능 추가
git checkout -b feature/기능명

# 버그 픽스
git checkout -b fix/버그명
```

- 작업 완료 후 GitHub PR 생성 → 리뷰 → main 머지

---

## Future: Mobile Support

모바일 확장 시 `ActionAdapter` 인터페이스를 구현하는 `ADBAdapter`를 추가하는 방식으로 확장.
현재 PC 액션은 `NutJSAdapter`로 구현.
