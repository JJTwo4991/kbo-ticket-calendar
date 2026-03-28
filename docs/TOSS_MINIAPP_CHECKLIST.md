# 토스 앱인토스 출시 체크리스트

## Phase 1: 코드 준비 (지금 할 수 있는 것)
- [x] granite.config.ts 생성
- [ ] `@apps-in-toss/web-framework` 패키지 설치
- [ ] `@toss/tds-mobile` 패키지 설치 (선택 - 현재 커스텀 CSS로도 OK)
- [x] Vercel Serverless API 구현 (subscribe, check-alerts)
- [x] Push API 클라이언트 구현 (dry-run 모드)
- [x] vercel.json Cron 설정

## Phase 2: Vercel 배포
- [ ] `vercel login` 실행
- [ ] `vercel link` → 프로젝트 연결
- [ ] `vercel --prod` 배포
- [ ] CRON_SECRET 환경변수 설정
- [ ] 배포 URL 확인 및 테스트

## Phase 3: 앱인토스 콘솔 등록 (외부 작업 필요)
- [ ] 앱인토스 콘솔 (https://apps-in-toss.toss.im) 접속
- [ ] 앱 등록 (앱명: KBO 티켓 캘린더)
- [ ] 앱 아이콘 업로드 (512x512, PNG)
- [ ] granite.config.ts의 icon URL 업데이트
- [ ] 배포 URL을 앱인토스 콘솔에 등록

## Phase 4: mTLS 인증서 (Push 알림용)
- [ ] 앱인토스 콘솔 → mTLS 인증서 탭
- [ ] 인증서 발급 (cert.pem + key.pem)
- [ ] base64 인코딩: `base64 -w0 cert.pem`, `base64 -w0 key.pem`
- [ ] Vercel 환경변수 등록:
  - `TOSS_MTLS_CERT` = cert.pem base64 값
  - `TOSS_MTLS_KEY` = key.pem base64 값
  - `TOSS_APP_ID` = 앱인토스 앱 ID
  - `TOSS_TEMPLATE_CODE` = 메시지 템플릿 코드
- [ ] 인증서 갱신 알림 설정 (유효기간 390일)

## Phase 5: 메시지 템플릿
- [ ] 앱인토스 콘솔 → 기능성 메시지 탭
- [ ] 템플릿 등록:
  - 제목: "경기 알림"
  - 본문: "{title}\n{body}"
  - 딥링크: "toss://apps-in-toss/kbo-ticket-calendar"
- [ ] 검수 제출 (영업일 2~3일 소요)
- [ ] 검수 통과 확인

## Phase 6: 토스 로그인 연동
- [ ] @apps-in-toss/web-framework의 useUser() 훅 사용
- [ ] userId를 토스 유저 ID로 교체
- [ ] subscribe API에 실제 userId 전달

## Phase 7: .ait 빌드 & 심사
- [ ] `npx @apps-in-toss/web-framework build` → .ait 파일 생성
- [ ] 앱인토스 콘솔에서 .ait 파일 업로드
- [ ] 심사 제출
- [ ] 심사 통과 → 출시

## 블로커 (외부 의존)
| 항목 | 의존 | 예상 소요 |
|------|------|----------|
| 앱인토스 앱 등록 | 토스 콘솔 접근 권한 | 즉시 |
| mTLS 인증서 | 앱 등록 완료 후 | 즉시 |
| 메시지 템플릿 검수 | 앱인토스 팀 | 영업일 2~3일 |
| .ait 심사 | 앱인토스 팀 | 영업일 3~5일 |

## 참고: Project Business 패턴
- granite.config.ts: appName, brand, permissions, navigationBar, webViewProps
- @apps-in-toss/web-framework ^2.0.5
- @toss/tds-mobile ^2.2.1 (TDS 컴포넌트 사용 시)
- .ait 빌드 파일은 .gitignore에 포함
