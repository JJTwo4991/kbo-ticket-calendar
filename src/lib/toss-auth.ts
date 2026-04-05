import { useState, useCallback } from 'react'

interface TossUser {
  userKey: number
  myTeam?: string
}

interface UseTossAuthResult {
  user: TossUser | null
  loading: boolean
  error: string | null
  login: () => Promise<void>
  logout: () => void
  isLoggedIn: boolean
}

export function useTossAuth(): UseTossAuthResult {
  const [user, setUser] = useState<TossUser | null>(() => {
    try {
      const raw = localStorage.getItem('kbo-toss-user')
      if (raw) return JSON.parse(raw) as TossUser
    } catch { /* ignore */ }
    return null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // 1. appLogin으로 인가 코드 받기
      const { appLogin } = await import('@apps-in-toss/web-framework')
      const result = await appLogin()

      if (!result?.authorizationCode) {
        throw new Error('인가 코드를 받지 못했습니다')
      }

      // 2. 서버에 인가 코드 전달 → accessToken → 사용자 정보
      const res = await fetch('/api/auth/toss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorizationCode: result.authorizationCode,
          referrer: result.referrer,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(errData.error || `로그인 실패: ${res.status}`)
      }

      const userData = await res.json() as TossUser
      setUser(userData)
      localStorage.setItem('kbo-toss-user', JSON.stringify(userData))
    } catch (err) {
      const msg = err instanceof Error ? err.message : '로그인 실패'
      setError(msg)
      console.error('[TossAuth]', msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('kbo-toss-user')
  }, [])

  return {
    user,
    loading,
    error,
    login,
    logout,
    isLoggedIn: user !== null,
  }
}
