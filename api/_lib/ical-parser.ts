import ICAL from 'ical.js'

export interface ParsedGame {
  id: string
  date: string
  time: string
  home: string
  away: string
  stadium: string
  status: string
}

const TEAM_ALIASES: Record<string, string> = {
  'SSG 랜더스': 'SSG',
  'LG 트윈스': 'LG',
  '두산 베어스': '두산',
  '키움 히어로즈': '키움',
  'KT 위즈': 'KT',
  'NC 다이노스': 'NC',
  '삼성 라이온즈': '삼성',
  '롯데 자이언츠': '롯데',
  '한화 이글스': '한화',
  'KIA 타이거즈': 'KIA',
}

function resolveTeam(name: string): string {
  return TEAM_ALIASES[name.trim()] ?? name.trim()
}

export function parseIcal(icalText: string): ParsedGame[] {
  const jcalData = ICAL.parse(icalText)
  const comp = new ICAL.Component(jcalData)
  const events = comp.getAllSubcomponents('vevent')
  const games: ParsedGame[] = []

  for (let i = 0; i < events.length; i++) {
    const event = new ICAL.Event(events[i])
    const summary = event.summary ?? ''

    const vsMatch = summary.match(/^(.+?)\s+(?:vs|VS)\s+(.+?)$/)
    if (!vsMatch) continue

    const away = resolveTeam(vsMatch[1])
    const home = resolveTeam(vsMatch[2])
    const location = event.location ?? ''

    const startDate = event.startDate
    if (!startDate) continue

    const jsDate = startDate.toJSDate()
    const kstOffset = 9 * 60 * 60 * 1000
    const kstDate = new Date(jsDate.getTime() + kstOffset)

    const dateStr = kstDate.toISOString().slice(0, 10)
    const timeStr = kstDate.toISOString().slice(11, 16)

    const id = `${dateStr}-${away}-${home}-${i}`

    games.push({ id, date: dateStr, time: timeStr, home, away, stadium: location, status: 'scheduled' })
  }

  return games
}
