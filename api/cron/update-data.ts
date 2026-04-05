import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSupabaseAdmin } from '../_lib/supabase-server.js'
import { parseIcal } from '../_lib/ical-parser.js'
import { scrapeStandings } from '../_lib/standings-scraper.js'

const ICAL_URL = 'https://kbo.elezy.com/schedule/ALL'

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET') { res.status(405).json({ error: 'Method Not Allowed' }); return }

  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers['authorization']
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) { res.status(401).json({ error: 'Unauthorized' }); return }

  const supabase = getSupabaseAdmin()
  const results = { schedule: { upserted: 0, error: null as string | null }, standings: { upserted: 0, error: null as string | null } }

  try {
    const icalRes = await fetch(ICAL_URL)
    if (!icalRes.ok) throw new Error(`iCal fetch failed: ${icalRes.status}`)
    const icalText = await icalRes.text()
    const games = parseIcal(icalText)
    if (games.length > 0) {
      const { error } = await supabase.from('games').upsert(games.map(g => ({ ...g, updated_at: new Date().toISOString() })), { onConflict: 'id' })
      if (error) throw error
      results.schedule.upserted = games.length
    }
  } catch (err) { results.schedule.error = err instanceof Error ? err.message : String(err) }

  try {
    const standings = await scrapeStandings()
    if (standings.length > 0) {
      const { error } = await supabase.from('standings').upsert(standings.map(s => ({ ...s, updated_at: new Date().toISOString() })), { onConflict: 'team' })
      if (error) throw error
      results.standings.upserted = standings.length
    }
  } catch (err) { results.standings.error = err instanceof Error ? err.message : String(err) }

  const status = results.schedule.error || results.standings.error ? 206 : 200
  res.status(status).json({ ...results, checkedAt: new Date().toISOString() })
}
