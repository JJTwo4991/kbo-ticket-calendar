import { getTossUserId } from './toss-bridge'

interface SubscribeRequest {
  team: string
  timings: string[]
  enabled: boolean
}

interface SubscribeResponse {
  status: string
  userId: string
  team: string
  timings: string[]
}

/**
 * 서버에 알림 구독/해제 요청
 * 토스 앱인토스 환경에서는 실제 userId 사용, 웹에서는 임시 ID
 */
export async function subscribeToAlerts(req: SubscribeRequest): Promise<SubscribeResponse | null> {
  const userId = getTossUserId()
  if (!userId) return null

  try {
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        team: req.team,
        timings: req.timings,
        enabled: req.enabled,
      }),
    })
    if (!res.ok) {
      console.error('[subscribe] API error:', res.status)
      return null
    }
    return await res.json() as SubscribeResponse
  } catch (err) {
    console.error('[subscribe] Network error:', err)
    return null
  }
}
