# KBO 티켓 캘린더 - Project Rules

## 프로젝트 개요
2026 KBO 정규시즌 경기 일정 캘린더 + 예매 바로가기 + 경기 알림 모바일 웹앱.
최종 목표: 토스 앱인토스(App in Toss) 미니앱 출시.

## 빌드 & 개발
- 개발: `npm run dev` (Vite, localhost:5173)
- 빌드: `npm run build` (tsc -b && vite build)
- 배포: `vercel --prod`
- 커밋/푸시: 사용자가 요청할 때만

## 핵심 원칙

### 1. 데이터 정합성
- schedule.json의 팀명(SSG, LG, 두산, 키움, KT, NC, 삼성, 롯데, 한화, KIA)과 teams.ts의 키는 반드시 일치해야 한다
- 잠실 구장은 LG(티켓링크)와 두산(놀티켓)이 공유. 예매 버튼은 **홈팀 기준**으로 올바른 사이트 연결. 이 로직을 깨뜨리지 말 것
- SSG는 2026 시즌부터 SSG닷컴(ticket.ssg.com)으로 전환. 티켓링크 아님

### 2. 모바일 퍼스트
- max-width 480px 기준 설계
- 터치 타겟 최소 44px
- 토스 디자인 시스템 컬러 팔레트 사용 (CSS 변수)

### 3. 시간대
- 모든 경기 시간은 KST(+09:00)
- Date 파싱: `new Date("2026-03-28T14:00:00+09:00")`

### 4. 아키텍처
- 프론트엔드: Vite + React 18 + TypeScript
- 백엔드: Vercel Serverless Functions (api/ 디렉토리)
- 상태관리: App.tsx에서 중앙 관리, localStorage 영속화
- 알림: 현재 Web Notification 폴백 → 추후 앱인토스 Push API (mTLS)
- 저장소: 현재 인메모리 → 추후 Upstash Redis

### 5. 코드 스타일
- TypeScript strict mode
- 컴포넌트 파일명: PascalCase
- CSS: 컴포넌트별 .css 파일 (CSS Modules 아님, 일반 import)
- 한국어 UI 텍스트는 하드코딩 OK (i18n 불필요)

## 파일 구조 참조
- `ARCHITECTURE.md` — 앱 흐름도 및 데이터 파이프라인
- `src/data/schedule.json` — 675경기 정규시즌 데이터 (iCal에서 파싱)
- `src/data/teams.ts` — 10개 구단 정적 데이터
- `api/` — Vercel 서버리스 함수
