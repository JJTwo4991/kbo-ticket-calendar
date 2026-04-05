import { teams } from '../data/teams'
import type { AttendanceRecord } from '../lib/attendance-api'
import './AttendanceList.css'

interface AttendanceListProps {
  records: AttendanceRecord[]
  onAddRecord?: () => void
}

const KO_DAYS = ['일', '월', '화', '수', '목', '금', '토']

const RESULT_MAP: Record<string, { emoji: string; label: string }> = {
  win: { emoji: '🎉', label: '승리' },
  lose: { emoji: '😢', label: '패배' },
  draw: { emoji: '🤝', label: '무승부' },
  unknown: { emoji: '🤔', label: '모름' },
}

export default function AttendanceList({ records, onAddRecord: _onAddRecord }: AttendanceListProps) {
  if (records.length === 0) {
    return (
      <div className="attendance-list">
        <div className="attendance-list__header">
          <h3 className="attendance-list__title">직관 기록</h3>
        </div>
        <div className="attendance-list__empty">
          <span style={{ fontSize: '36px' }}>⚾</span>
          <p>아직 직관 기록이 없어요</p>
          <p className="attendance-list__empty-sub">경기를 관람하고 기록을 남겨보세요!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="attendance-list">
      <div className="attendance-list__header">
        <h3 className="attendance-list__title">직관 기록</h3>
        <span className="attendance-list__count">{records.length}경기</span>
      </div>
      <div className="attendance-list__items">
        {records.map((record) => {
          const game = record.games
          if (!game) return null

          const homeTeam = teams[game.home]
          const awayTeam = teams[game.away]
          const resultInfo = record.result ? RESULT_MAP[record.result] : null

          const [, month, day] = game.date.split('-').map(Number)
          const d = new Date(Number(game.date.split('-')[0]), month - 1, day)
          const dow = KO_DAYS[d.getDay()]

          return (
            <div key={record.id} className="attendance-item">
              <div className="attendance-item__date">
                {month}/{day}({dow})
              </div>
              <div className="attendance-item__info">
                <span className="attendance-item__matchup">
                  {awayTeam?.shortName ?? game.away} vs {homeTeam?.shortName ?? game.home}
                </span>
                <span className="attendance-item__stadium">📍 {game.stadium}</span>
                {record.memo && (
                  <span className="attendance-item__memo">"{record.memo}"</span>
                )}
              </div>
              <div className="attendance-item__right">
                {resultInfo && (
                  <span className="attendance-item__result">
                    {resultInfo.emoji} {resultInfo.label}
                  </span>
                )}
                {record.seat_area && (
                  <span className="attendance-item__seat">{record.seat_area}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
