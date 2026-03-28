# KBO 티켓 캘린더 - Architecture

## 1. 데이터 파이프라인

```
[iCal Source] → [Python Parser] → [schedule.json] → [React App]
https://kbo.elezy.com/schedule/ALL → parse_ical.py → src/data/schedule.json → import in App.tsx
```

데이터 특성:
- `schedule.json`: 정적 데이터 (빌드타임 포함, 675경기)
- `teams.ts`: 하드코딩된 정적 데이터 (10개 구단 정보)
- 구독 데이터: 런타임 동적 (인메모리 → Upstash Redis)

---

## 2. 프론트엔드 흐름도

```
App.tsx (상태 중앙 관리)
├── myTeam === null? → MyTeamSetup (풀스크린 오버레이)
├── TeamFilter (viewTeam 변경)
├── Calendar (날짜 선택, dot 표시)
│   └── gameDatesInMonth = schedule filtered by viewTeam + currentMonth
├── GameList (선택 날짜의 경기 목록)
│   └── filteredGames = schedule filtered by viewTeam + selectedDate
│   └── 예매 버튼 → teams[game.home].ticketUrl (홈팀 기준!)
│   └── 알림 토글 → POST /api/subscribe
└── AlertSettings (바텀시트)
    └── localStorage "kbo-alert-settings"
```

### 상태 구조 (App.tsx)

```typescript
// localStorage에 영속화
myTeam: TeamKey | null         // 내 구단 (최초 실행 시 선택)
viewTeam: TeamKey | "ALL"      // 현재 필터 (TeamFilter)
alertSettings: AlertSettings   // 알림 타이밍 설정

// 런타임 only
selectedDate: string           // "2026-03-28"
currentMonth: { year, month }  // 캘린더 표시 월
```

---

## 3. 백엔드 흐름도

```
Vercel Cron (매시간) → GET /api/check-alerts
  → Authorization: Bearer CRON_SECRET
  → schedule.json 순회
  → 각 경기 × 3 알림 윈도우 (24h, 1h, 10m)
  → |now - alertTime| ≤ 30분? → 구독자 조회 → Push 발송

POST /api/subscribe
  → { userId, team, timings, enabled }
  → storage.subscribe() / unsubscribe()
  → 현재: 인메모리 Map (cold start 시 초기화)
  → 프로덕션: Upstash Redis
```

### API 엔드포인트

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/subscribe` | POST | 알림 구독 등록/해제 |
| `/api/check-alerts` | GET | Cron 트리거, 알림 발송 |

### Vercel Cron 설정 (vercel.json)

```json
{
  "crons": [
    {
      "path": "/api/check-alerts",
      "schedule": "0 * * * *"
    }
  ]
}
```

---

## 4. 하드코딩 vs 동적 데이터

| 데이터 | 소스 | 타입 | 업데이트 방법 |
|--------|------|------|--------------|
| 경기 일정 | kbo.elezy.com iCal | 정적 (빌드타임) | iCal 재다운로드 → 파싱 → 재배포 |
| 구단 정보 | teams.ts | 하드코딩 | 코드 수정 → 재배포 |
| 예매 URL | teams.ts | 하드코딩 | 시즌 전 확인 후 수정 |
| 내 구단 설정 | localStorage | 동적 (클라이언트) | 사용자 선택 |
| 알림 설정 | localStorage | 동적 (클라이언트) | 사용자 선택 |
| 알림 구독 | 서버 저장소 | 동적 (서버) | API 호출 |

---

## 5. 토스 앱인토스 출시 체크리스트

- [ ] `granite.config.ts` 설정
- [ ] `@apps-in-toss/web-framework` 설치
- [ ] `@toss/tds-mobile` 설치 (선택)
- [ ] mTLS 인증서 발급 + 환경변수 등록
- [ ] 메시지 템플릿 등록 + 검수
- [ ] `.ait` 빌드 → 콘솔 업로드 → 심사

---

## 6. 환경변수

| 변수명 | 설명 | 필수 |
|--------|------|------|
| `CRON_SECRET` | Vercel Cron 인증 Bearer 토큰 | 필수 |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST 엔드포인트 | 프로덕션 |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis 인증 토큰 | 프로덕션 |
| `TOSS_MTLS_CERT` | 토스 앱인토스 mTLS 클라이언트 인증서 | 앱인토스 출시 시 |
| `TOSS_MTLS_KEY` | 토스 앱인토스 mTLS 클라이언트 키 | 앱인토스 출시 시 |
| `NEXT_PUBLIC_APP_ENV` | 환경 구분 (`development` / `production`) | 선택 |

로컬 개발: `.env.local`에 설정 (`.gitignore`에 포함됨)
프로덕션: Vercel 대시보드 Environment Variables에 등록
