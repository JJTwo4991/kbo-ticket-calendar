import { getTicketInfo, teams } from '../data/teams'
import { getTicketOpenInfo } from '../lib/ticket-utils'
import type { Game, AlertSettingsData, TicketPolicy } from '../types'
import './GameList.css'

interface GameListProps {
  games: Game[]
  myTeam: string | null
  onToggleAlert: (gameId: string) => void
  alertSettings: AlertSettingsData
  alertedGames: Set<string>
  ticketOpenGames?: Game[]
  ticketPolicies?: TicketPolicy[]
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
  games, myTeam, onToggleAlert, alertSettings, alertedGames,
  ticketOpenGames, ticketPolicies,
}: GameListProps) {
  const dateHeader = games.length > 0 ? formatDateHeader(games[0].date) : ''
  const hasAnyContent = games.length > 0 || (ticketOpenGames?.length ?? 0) > 0

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

      {!hasAnyContent ? (
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
            const ticketInfo = ticketPolicies ? getTicketOpenInfo(game, ticketPolicies) : null

            // Alert active if settings are enabled and this specific game is alerted
            const alertActive = isMyTeamGame && alertSettings.enabled && alertedGames.has(game.id)

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
                      <img className="game-card__team-logo" src={awayTeam.logo} alt={awayTeam.shortName} width={28} height={28} />
                    )}
                  </div>

                  <span className="game-card__vs">VS</span>

                  {/* Home team */}
                  <div className="game-card__team game-card__team--home">
                    {homeTeam && (
                      <img className="game-card__team-logo" src={homeTeam.logo} alt={homeTeam.shortName} width={28} height={28} />
                    )}
                    <span
                      className={`game-card__team-name${myTeam === game.home ? ' game-card__team-name--my-team' : ''}`}
                    >
                      {homeTeam?.shortName ?? game.home}
                    </span>
                    <span className="game-card__home-badge">홈</span>
                  </div>
                </div>

                {/* Bottom row: stadium + ticket status + ticket button */}
                <div className="game-card__bottom">
                  <span className="game-card__stadium">
                    <span className="game-card__stadium-icon">📍</span>
                    {stadium}
                  </span>
                  <div className="game-card__bottom-right">
                    {ticketInfo && (
                      <span className={`game-card__ticket-status game-card__ticket-status--${ticketInfo.status}`}>
                        {ticketInfo.status === 'open' ? '🎫' : ticketInfo.status === 'today' ? '🔥' : ticketInfo.status === 'tomorrow' ? '⏰' : '🎫'}
                        {' '}{ticketInfo.label}
                      </span>
                    )}
                    <a
                      className={`game-card__ticket-btn${ticketInfo?.status === 'open' ? ' game-card__ticket-btn--open' : ''}`}
                      href={ticketInfo?.platformUrl ?? ticket.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${ticket.platform}에서 예매하기`}
                    >
                      예매하기
                    </a>
                  </div>
                </div>
              </div>
            )
          })}

          {(ticketOpenGames?.length ?? 0) > 0 && (
            <div className="game-list__ticket-open-section">
              <div className="game-list__ticket-open-label">🎫 예매 오픈</div>
              <div className="game-list__ticket-open-items">
                {ticketOpenGames!.map((game) => {
                  const homeTeam = teams[game.home]
                  const awayTeam = teams[game.away]
                  const ticket = getTicketInfo(game.home)
                  const stadium = game.stadium ?? homeTeam?.stadium ?? ''
                  const tInfo = ticketPolicies ? getTicketOpenInfo(game, ticketPolicies) : null
                  const [yearStr, mmStr, ddStr] = game.date.split('-')
                  const mm = Number(mmStr)
                  const dd = Number(ddStr)
                  const dow = KO_DAYS[new Date(Number(yearStr), mm - 1, dd).getDay()]
                  return (
                    <div key={`ticket-${game.id}`} className="ticket-open-card">
                      <div className="ticket-open-card__info">
                        <span className="ticket-open-card__date">{mm}월 {dd}일({dow}) {game.time}</span>
                        <span className="ticket-open-card__matchup">{awayTeam?.shortName ?? game.away} vs {homeTeam?.shortName ?? game.home} 경기의 예매일이에요</span>
                        <span className="ticket-open-card__stadium">📍 {stadium}</span>
                        {tInfo && <span className="ticket-open-card__time">⏰ {tInfo.openTime} 오픈</span>}
                      </div>
                      <a className="ticket-open-card__btn" href={tInfo?.platformUrl ?? ticket.url} target="_blank" rel="noopener noreferrer">예매하기</a>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {hasAnyContent && (
        <div className="game-list__disclaimer">
          예매 일정은 구단 사정에 따라 변경될 수 있어요
        </div>
      )}
    </div>
  )
}
