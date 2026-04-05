import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSupabaseAdmin } from './_lib/supabase-server.js'

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  const userId = req.query.userId as string
  if (!userId) {
    res.status(400).json({ error: 'userId is required' })
    return
  }

  const supabase = getSupabaseAdmin()

  const { data: records, error } = await supabase
    .from('attendance')
    .select('result, games(stadium)')
    .eq('user_id', userId)

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  const totalGames = records?.length ?? 0
  const wins = records?.filter(r => r.result === 'win').length ?? 0
  const losses = records?.filter(r => r.result === 'lose').length ?? 0
  const winRate = (wins + losses) > 0 ? wins / (wins + losses) : 0
  const stadiums = new Set(records?.map(r => (r.games as any)?.stadium).filter(Boolean))

  res.status(200).json({
    totalGames,
    wins,
    losses,
    winRate,
    stadiumCount: stadiums.size,
    totalStadiums: 9,
  })
}
