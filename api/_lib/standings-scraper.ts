export interface ScrapedStanding {
  team: string
  rank: number
  wins: number
  losses: number
  draws: number
  pct: number
  games_back: number
  streak: string
}

const TEAM_NAME_MAP: Record<string, string> = {
  'SSG': 'SSG', 'LG': 'LG', '두산': '두산', '키움': '키움',
  'KT': 'KT', 'NC': 'NC', '삼성': '삼성', '롯데': '롯데',
  '한화': '한화', 'KIA': 'KIA',
}

export async function scrapeStandings(): Promise<ScrapedStanding[]> {
  const url = 'https://www.koreabaseball.com/Record/TeamRank/TeamRankDaily.aspx'
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; JikgwanGallae/1.0)',
      'Accept': 'text/html',
    },
  })
  if (!res.ok) throw new Error(`KBO standings fetch failed: ${res.status}`)
  const html = await res.text()
  return parseStandingsHtml(html)
}

function parseStandingsHtml(html: string): ScrapedStanding[] {
  const standings: ScrapedStanding[] = []
  const tbodyMatch = html.match(/<tbody>([\s\S]*?)<\/tbody>/)
  if (!tbodyMatch) return standings

  const rows = tbodyMatch[1].match(/<tr[\s\S]*?<\/tr>/g)
  if (!rows) return standings

  for (const row of rows) {
    const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g)
    if (!cells || cells.length < 8) continue

    const extractText = (cell: string): string => cell.replace(/<[^>]*>/g, '').trim()

    const rank = parseInt(extractText(cells[0]), 10)
    const teamRaw = extractText(cells[1])
    const wins = parseInt(extractText(cells[3]), 10)
    const losses = parseInt(extractText(cells[4]), 10)
    const draws = parseInt(extractText(cells[5]), 10)
    const pct = parseFloat(extractText(cells[6])) || 0
    const gamesBack = parseFloat(extractText(cells[7])) || 0
    let streak = ''
    if (cells.length > 8) streak = extractText(cells[8])

    const team = TEAM_NAME_MAP[teamRaw] ?? teamRaw
    if (!team) continue
    standings.push({ team, rank, wins, losses, draws, pct, games_back: gamesBack, streak })
  }
  return standings
}
