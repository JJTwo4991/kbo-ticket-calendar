import { teams } from '../data/teams'
import type { Standing } from '../types'
import './StandingsSheet.css'

interface StandingsSheetProps {
  standings: Standing[]
  myTeam: string | null
  onClose: () => void
}

export default function StandingsSheet({ standings, myTeam, onClose }: StandingsSheetProps) {
  return (
    <div className="standings-overlay" role="dialog" aria-modal="true" aria-label="KBO 팀 순위">
      <div className="standings-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="standings-sheet">
        <div className="standings-sheet__handle" />
        <div className="standings-sheet__header">
          <span className="standings-sheet__title">2026 KBO 팀 순위</span>
          <button className="standings-sheet__close-btn" onClick={onClose} aria-label="닫기">✕</button>
        </div>
        <div className="standings-sheet__body">
          <div className="standings-table">
            <div className="standings-table__head">
              <span className="standings-table__th standings-table__th--rank">순위</span>
              <span className="standings-table__th standings-table__th--team">팀</span>
              <span className="standings-table__th">승</span>
              <span className="standings-table__th">패</span>
              <span className="standings-table__th">무</span>
              <span className="standings-table__th">승률</span>
              <span className="standings-table__th">게임차</span>
            </div>
            {standings.map(s => {
              const teamInfo = teams[s.team]
              const isMyTeam = s.team === myTeam
              return (
                <div key={s.team} className={`standings-table__row${isMyTeam ? ' standings-table__row--my-team' : ''}`}>
                  <span className="standings-table__td standings-table__td--rank">{s.rank}</span>
                  <span className="standings-table__td standings-table__td--team">
                    {teamInfo && <img className="standings-table__logo" src={teamInfo.logo} alt={teamInfo.shortName} width={20} height={20} />}
                    {teamInfo?.shortName ?? s.team}
                  </span>
                  <span className="standings-table__td">{s.wins}</span>
                  <span className="standings-table__td">{s.losses}</span>
                  <span className="standings-table__td">{s.draws}</span>
                  <span className="standings-table__td">{s.pct.toFixed(3).slice(1)}</span>
                  <span className="standings-table__td">{s.games_back}</span>
                </div>
              )
            })}
          </div>
          {standings.length > 0 && standings[0].updated_at && (
            <div className="standings-sheet__updated">기준: {new Date(standings[0].updated_at).toLocaleDateString('ko-KR')}</div>
          )}
        </div>
      </div>
    </div>
  )
}
