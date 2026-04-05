import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSupabaseAdmin } from './_lib/supabase-server.js'

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('ticket_policies')
    .select('*')

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600')
  res.status(200).json(data)
}
