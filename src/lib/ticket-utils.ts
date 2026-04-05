import type { Game, TicketPolicy } from '../types'

export type TicketOpenStatus = 'not-yet' | 'tomorrow' | 'today' | 'open'

export interface TicketOpenInfo {
  status: TicketOpenStatus
  openDate: string      // "2026-03-29"
  openTime: string      // "11:00"
  platformName: string  // "티켓링크"
  platformUrl: string   // URL
  label: string         // UI 표시용 텍스트
}

function formatDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${m}/${d}(${days[date.getDay()]})`
}

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d + days)
  const ny = date.getFullYear()
  const nm = (date.getMonth() + 1).toString().padStart(2, '0')
  const nd = date.getDate().toString().padStart(2, '0')
  return `${ny}-${nm}-${nd}`
}

function getTodayStr(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${day}`
}

function isAfterTime(timeStr: string): boolean {
  const now = new Date()
  const [h, m] = timeStr.split(':').map(Number)
  return now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m)
}

export function getTicketOpenInfo(
  game: Game,
  policies: TicketPolicy[]
): TicketOpenInfo | null {
  // 홈팀 기준으로 예매 정책 조회
  const policy = policies.find(p => p.team === game.home)
  if (!policy) return null

  // 예매 오픈일 계산: 경기일 - days_before
  const openDate = addDays(game.date, -policy.days_before)
  const today = getTodayStr()
  const tomorrow = addDays(today, 1)

  let status: TicketOpenStatus
  let label: string

  if (today > openDate || (today === openDate && isAfterTime(policy.open_time))) {
    status = 'open'
    label = '예매 오픈중!'
  } else if (today === openDate) {
    status = 'today'
    label = `오늘 ${policy.open_time} 예매 오픈`
  } else if (tomorrow === openDate) {
    status = 'tomorrow'
    label = `내일 ${policy.open_time} 예매 오픈`
  } else {
    status = 'not-yet'
    label = `예매 오픈: ${formatDateLabel(openDate)} ${policy.open_time}`
  }

  return {
    status,
    openDate,
    openTime: policy.open_time,
    platformName: policy.platform_name,
    platformUrl: policy.platform_url,
    label,
  }
}
