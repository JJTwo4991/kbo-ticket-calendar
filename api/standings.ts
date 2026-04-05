import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSupabaseAdmin } from './_lib/supabase-server.js'

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('standings')
    .select('*')
    .order('rank', { ascending: true })

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600')
  res.status(200).json(data)
}
