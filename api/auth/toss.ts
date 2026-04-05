import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSupabaseAdmin } from '../_lib/supabase-server.js'

const TOSS_API_BASE = 'https://apps-in-toss-api.toss.im'

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  const { authorizationCode, referrer } = req.body as {
    authorizationCode?: string
    referrer?: string
  }

  if (!authorizationCode) {
    res.status(400).json({ error: 'authorizationCode is required' })
    return
  }

  try {
    // 1. 인가 코드 → accessToken
    const tokenRes = await fetch(
      `${TOSS_API_BASE}/api-partner/v1/apps-in-toss/user/oauth2/generate-token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorizationCode,
          referrer: referrer || 'DEFAULT',
        }),
      }
    )

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text()
      console.error('[auth/toss] Token error:', errBody)
      res.status(401).json({ error: 'Failed to get access token' })
      return
    }

    const tokenData = await tokenRes.json() as { success?: { accessToken?: string } }
    const accessToken = tokenData.success?.accessToken

    if (!accessToken) {
      res.status(401).json({ error: 'No access token in response' })
      return
    }

    // 2. accessToken → 사용자 정보
    const userRes = await fetch(
      `${TOSS_API_BASE}/api-partner/v1/apps-in-toss/user/oauth2/login-me`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    if (!userRes.ok) {
      const errBody = await userRes.text()
      console.error('[auth/toss] User info error:', errBody)
      res.status(401).json({ error: 'Failed to get user info' })
      return
    }

    const userData = await userRes.json() as { success?: { userKey?: number } }
    const userKey = userData.success?.userKey

    if (!userKey) {
      res.status(401).json({ error: 'No userKey in response' })
      return
    }

    // 3. Supabase에 유저 upsert
    const supabase = getSupabaseAdmin()

    // 기존 유저 확인
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('toss_id', String(userKey))
      .single()

    let dbUser
    if (existingUser) {
      dbUser = existingUser
    } else {
      // 신규 유저 생성 (my_team은 나중에 설정)
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({ toss_id: String(userKey), my_team: '' })
        .select()
        .single()

      if (insertError) {
        console.error('[auth/toss] Supabase insert error:', insertError)
        res.status(500).json({ error: 'Failed to create user' })
        return
      }
      dbUser = newUser
    }

    res.status(200).json({
      userKey,
      myTeam: dbUser.my_team || null,
      id: dbUser.id,
    })
  } catch (err) {
    console.error('[auth/toss] Error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
