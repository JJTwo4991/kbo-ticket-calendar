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
