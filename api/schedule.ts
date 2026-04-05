import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSupabaseAdmin } from './_lib/supabase-server.js'

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  const supabase = getSupabaseAdmin()

  let query = supabase
    .from('games')
    .select('*')
    .order('date', { ascending: true })
    .order('time', { ascending: true })

  const month = req.query.month as string | undefined
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const startDate = `${month}-01`
    const [y, m] = month.split('-').map(Number)
    const lastDay = new Date(y, m, 0).getDate()
    const endDate = `${month}-${lastDay.toString().padStart(2, '0')}`
    query = query.gte('date', startDate).lte('date', endDate)
  }

  const team = req.query.team as string | undefined
  if (team) {
    query = query.or(`home.eq.${team},away.eq.${team}`)
  }

  const { data, error } = await query

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600')
  res.status(200).json(data)
}
