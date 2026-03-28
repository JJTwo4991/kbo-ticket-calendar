/**
 * 토스 앱인토스 WebView 브릿지
 * @apps-in-toss/web-framework 설치 전에는 fallback으로 동작
 */

// 앱인토스 환경 감지
export function isTossWebView(): boolean {
  if (typeof window === 'undefined') return false
  // 토스 앱 내부 WebView에서는 userAgent에 'TossApp'이 포함됨
  return navigator.userAgent.includes('TossApp')
}

// 토스 유저 ID 가져오기 (앱인토스 SDK 설치 후 실제 구현)
export function getTossUserId(): string | null {
  // TODO: @apps-in-toss/web-framework의 useUser() 훅으로 교체
  // 현재는 localStorage 기반 임시 ID
  let userId = localStorage.getItem('kbo-user-id')
  if (!userId) {
    userId = `web_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    localStorage.setItem('kbo-user-id', userId)
  }
  return userId
}

// 뒤로가기 이벤트 핸들러 등록
export function setupBackHandler(onBack: () => void): () => void {
  if (!isTossWebView()) {
    // 웹 브라우저: popstate로 뒤로가기 처리
    const handler = (e: PopStateEvent) => {
      e.preventDefault()
      onBack()
    }
    // 히스토리에 더미 엔트리 추가 (뒤로가기 캡처용)
    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }

  // 토스 WebView: graniteEvent 사용
  // TODO: @apps-in-toss/web-framework 설치 후 활성화
  // import { graniteEvent } from '@apps-in-toss/web-framework'
  // graniteEvent.addEventListener('backEvent', onBack)
  // return () => graniteEvent.removeEventListener('backEvent', onBack)

  return () => {} // noop cleanup
}

// 토스 앱 닫기
export function closeApp(): void {
  if (!isTossWebView()) {
    window.history.back()
    return
  }
  // TODO: @apps-in-toss/web-framework 설치 후 활성화
  // import { closeView } from '@apps-in-toss/web-bridge'
  // closeView()
}

// 딥링크 파라미터 파싱
// 딥링크 형식: kbo-ticket-calendar?date=2026-03-28&team=SSG
export interface DeepLinkParams {
  date?: string
  team?: string
}

export function parseDeepLink(): DeepLinkParams {
  const params = new URLSearchParams(window.location.search)
  return {
    date: params.get('date') || undefined,
    team: params.get('team') || undefined,
  }
}
