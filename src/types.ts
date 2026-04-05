export interface RawGame {
  date: string
  time: string
  home: string
  away: string
  stadium?: string
}

export interface Game {
  id: string
  date: string
  time: string
  home: string
  away: string
  stadium?: string
}

export interface AlertSettingsData {
  enabled: boolean
  timings: string[]
}

export interface TicketPolicy {
  team: string
  days_before: number
  open_time: string
  platform_name: string
  platform_url: string
}

export interface Standing {
  team: string
  rank: number
  wins: number
  losses: number
  draws: number
  pct: number
  games_back: number
  streak: string
  updated_at: string
}
