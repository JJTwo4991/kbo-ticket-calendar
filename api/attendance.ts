import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSupabaseAdmin } from './_lib/supabase-server.js'

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const userId = req.query.userId as string
    if (!userId) {
      res.status(400).json({ error: 'userId is required' })
      return
    }

    const { data, error } = await supabase
      .from('attendance')
      .select('*, games(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      res.status(500).json({ error: error.message })
      return
    }

    res.setHeader('Cache-Control', 'no-cache')
    res.status(200).json(data)
    return
  }

  if (req.method === 'POST') {
    const { userId, gameId, result, seatArea, memo } = req.body as {
      userId?: string
      gameId?: string
      result?: string
      seatArea?: string
      memo?: string
    }

    if (!userId || !gameId) {
      res.status(400).json({ error: 'userId and gameId are required' })
      return
    }

    const { data, error } = await supabase
      .from('attendance')
      .upsert(
        { user_id: userId, game_id: gameId, result: result || null, seat_area: seatArea || null, memo: memo || null },
        { onConflict: 'user_id,game_id' }
      )
      .select()
      .single()

    if (error) {
      res.status(500).json({ error: error.message })
      return
    }

    res.status(200).json(data)
    return
  }

  res.status(405).json({ error: 'Method Not Allowed' })
}
