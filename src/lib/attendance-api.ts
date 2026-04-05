export interface AttendanceRecord {
  id: string
  user_id: string
  game_id: string
  result: string | null
  seat_area: string | null
  memo: string | null
  created_at: string
  games?: {
    date: string
    time: string
    home: string
    away: string
    stadium: string
  }
}

export interface AttendanceStats {
  totalGames: number
  wins: number
  losses: number
  winRate: number
  stadiumCount: number
  totalStadiums: number
}

export async function fetchAttendance(userId: string): Promise<AttendanceRecord[]> {
  const res = await fetch(`/api/attendance?userId=${userId}`)
  if (!res.ok) throw new Error(`Attendance API error: ${res.status}`)
  return await res.json()
}

export async function addAttendance(params: {
  userId: string
  gameId: string
  result?: string
  seatArea?: string
  memo?: string
}): Promise<AttendanceRecord> {
  const res = await fetch('/api/attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) throw new Error(`Add attendance error: ${res.status}`)
  return await res.json()
}

export async function fetchStats(userId: string): Promise<AttendanceStats> {
  const res = await fetch(`/api/stats?userId=${userId}`)
  if (!res.ok) throw new Error(`Stats API error: ${res.status}`)
  return await res.json()
}
