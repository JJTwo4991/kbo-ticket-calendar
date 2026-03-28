import { getTicketInfo, teams } from '../data/teams'
import './GameList.css'

interface Game {
  id: string
  date: string
  time: string
  home: string
  away: string
  stadium?: string
}

interface AlertSettingsData {
  enabled: boolean
  timings: string[]
}

interface GameListProps {
  games: Game[]
  myTeam: string | null
  onToggleAlert: (gameId: string) => void
  alertSettings: AlertSettingsData
}

const KO_DAYS = ['일', '월', '화', '수', '목', '금', '토']

function formatDateHeader(dateStr: string): string {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  const dow = KO_DAYS[d.getDay()]
  return `${month}월 ${day}일 ${dow}요일`
}

export default function GameList({
  games,
  myTeam,
  onToggleAlert,
  alertSettings,
}: GameListProps) {
  const dateHeader = games.length > 0 ? formatDateHeader(games[0].date) : ''

  return (
    <div className="game-list">
      <div className="game-list__header">
        {dateHeader && (
          <div className="game-list__date-title">{dateHeader}</div>
        )}
        {games.length > 0 && (
          <div className="game-list__count">총 {games.length}경기</div>
        )}
      </div>

      {games.length === 0 ? (
        <div className="game-list__empty">
          <div className="game-list__empty-icon">⚾</div>
          <div className="game-list__empty-text">
            이 날은 경기가 없어요
            <br />
            다른 날짜를 선택해보세요
          </div>
        </div>
      ) : (
        <div className="game-list__items">
          {games.map((game) => {
            const isMyTeamGame =
              myTeam !== null && (game.home === myTeam || game.away === myTeam)
            const homeTeam = teams[game.home]
            const awayTeam = teams[game.away]
            const ticket = getTicketInfo(game.home)
            const stadium = game.stadium ?? homeTeam?.stadium ?? ''

            // Alert active if settings are enabled and game involves myTeam
            const alertActive = isMyTeamGame && alertSettings.enabled

            return (
              <div
                key={game.id}
                className={`game-card${isMyTeamGame ? ' game-card--my-team' : ''}`}
              >
                {/* Top row: time + badge + alert */}
                <div className="game-card__top">
                  <div className="game-card__time-row">
                    <span className="game-card__time">{game.time}</span>
                    {isMyTeamGame && (
                      <span className="game-card__my-team-badge">내 구단</span>
                    )}
                  </div>
                  {isMyTeamGame && (
                    <button
                      className={`game-card__alert-btn${alertActive ? ' game-card__alert-btn--active' : ''}`}
                      onClick={() => onToggleAlert(game.id)}
                      aria-label={alertActive ? '알림 끄기' : '알림 켜기'}
                      aria-pressed={alertActive}
                    >
                      {alertActive ? '🔔' : '🔕'}
                    </button>
                  )}
                </div>

                {/* Matchup row */}
                <div className="game-card__matchup">
                  {/* Away team */}
                  <div className="game-card__team game-card__team--away">
                    <span
                      className={`game-card__team-name${myTeam === game.away ? ' game-card__team-name--my-team' : ''}`}
                    >
                      {awayTeam?.shortName ?? game.away}
                    </span>
                    {awayTeam && (
                      <div
                        className="game-card__team-color"
                        style={{ backgroundColor: awayTeam.color }}
                      />
                    )}
                  </div>

                  <span className="game-card__vs">VS</span>

                  {/* Home team */}
                  <div className="game-card__team game-card__team--home">
                    {homeTeam && (
                      <div
                        className="game-card__team-color"
                        style={{ backgroundColor: homeTeam.color }}
                      />
                    )}
                    <span
                      className={`game-card__team-name${myTeam === game.home ? ' game-card__team-name--my-team' : ''}`}
                    >
                      {homeTeam?.shortName ?? game.home}
                    </span>
                    <span className="game-card__home-badge">홈</span>
                  </div>
                </div>

                {/* Bottom row: stadium + ticket button */}
                <div className="game-card__bottom">
                  <span className="game-card__stadium">
                    <span className="game-card__stadium-icon">📍</span>
                    {stadium}
                  </span>
                  <a
                    className="game-card__ticket-btn"
                    href={ticket.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${ticket.platform}에서 예매하기`}
                  >
                    예매하기
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
