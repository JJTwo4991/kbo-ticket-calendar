import type { Game, Standing } from '../types'

export async function fetchSchedule(): Promise<Game[]> {
  const res = await fetch('/api/schedule')
  if (!res.ok) throw new Error(`Schedule API error: ${res.status}`)
  const data = await res.json()
  return data as Game[]
}

export async function fetchStandings(): Promise<Standing[]> {
  const res = await fetch('/api/standings')
  if (!res.ok) throw new Error(`Standings API error: ${res.status}`)
  const data = await res.json()
  return data as Standing[]
}
