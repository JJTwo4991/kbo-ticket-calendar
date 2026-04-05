import { useState, useEffect } from 'react'
import type { Game, Standing, TicketPolicy, RawGame } from '../types'
import { fetchSchedule, fetchStandings } from './api'
import fallbackSchedule from '../data/schedule.json'

interface UseGamesResult {
  games: Game[]
  standings: Standing[]
  ticketPolicies: TicketPolicy[]
  loading: boolean
  error: string | null
}

export function useGames(): UseGamesResult {
  const [games, setGames] = useState<Game[]>([])
  const [standings, setStandings] = useState<Standing[]>([])
  const [ticketPolicies, setTicketPolicies] = useState<TicketPolicy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [scheduleData, standingsData] = await Promise.all([
          fetchSchedule(),
          fetchStandings(),
        ])
        if (cancelled) return
        setGames(scheduleData)
        setStandings(standingsData)
        setTicketPolicies([])
        setError(null)
      } catch (err) {
        if (cancelled) return
        // API 실패 시 정적 schedule.json 폴백
        const fallbackGames: Game[] = (fallbackSchedule as RawGame[]).map((g, i) => ({
          ...g,
          id: `${g.date}-${g.away}-${g.home}-${i}`,
        }))
        setGames(fallbackGames)
        setTicketPolicies([])
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return { games, standings, ticketPolicies, loading, error }
}
