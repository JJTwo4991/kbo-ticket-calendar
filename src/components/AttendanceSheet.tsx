import { useState } from 'react'
import type { Game } from '../types'
import { teams } from '../data/teams'
import './AttendanceSheet.css'

interface AttendanceSheetProps {
  game: Game
  onSave: (data: { result: string; seatArea: string; memo: string }) => void
  onClose: () => void
  saving: boolean
}

const RESULTS = [
  { value: 'win', label: '승리', emoji: '🎉' },
  { value: 'lose', label: '패배', emoji: '😢' },
  { value: 'draw', label: '무승부', emoji: '🤝' },
  { value: 'unknown', label: '모름', emoji: '🤔' },
]

export default function AttendanceSheet({ game, onSave, onClose, saving }: AttendanceSheetProps) {
  const [result, setResult] = useState('')
  const [seatArea, setSeatArea] = useState('')
  const [memo, setMemo] = useState('')

  const homeTeam = teams[game.home]
  const awayTeam = teams[game.away]

  return (
    <div className="attendance-overlay" role="dialog" aria-modal="true">
      <div className="attendance-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="attendance-sheet">
        <div className="attendance-sheet__handle" />
        <div className="attendance-sheet__header">
          <span className="attendance-sheet__title">직관 기록</span>
          <button className="attendance-sheet__close" onClick={onClose}>✕</button>
        </div>

        <div className="attendance-sheet__game-info">
          <span>{game.date} {game.time}</span>
          <span className="attendance-sheet__matchup">
            {awayTeam?.shortName ?? game.away} vs {homeTeam?.shortName ?? game.home}
          </span>
          <span className="attendance-sheet__stadium">📍 {game.stadium ?? homeTeam?.stadium}</span>
        </div>

        <div className="attendance-sheet__body">
          <div className="attendance-sheet__section">
            <div className="attendance-sheet__label">경기 결과</div>
            <div className="attendance-sheet__results">
              {RESULTS.map(r => (
                <button
                  key={r.value}
                  className={`attendance-sheet__result-btn${result === r.value ? ' attendance-sheet__result-btn--active' : ''}`}
                  onClick={() => setResult(r.value)}
                >
                  <span>{r.emoji}</span>
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="attendance-sheet__section">
            <div className="attendance-sheet__label">좌석 구역 (선택)</div>
            <input
              className="attendance-sheet__input"
              placeholder="예: 1루 응원석, 테이블석 A구역"
              value={seatArea}
              onChange={e => setSeatArea(e.target.value)}
              maxLength={50}
            />
          </div>

          <div className="attendance-sheet__section">
            <div className="attendance-sheet__label">한줄 메모 (선택)</div>
            <input
              className="attendance-sheet__input"
              placeholder="오늘 직관 한줄평"
              value={memo}
              onChange={e => setMemo(e.target.value)}
              maxLength={100}
            />
          </div>

          <button
            className="attendance-sheet__save-btn"
            onClick={() => onSave({ result, seatArea, memo })}
            disabled={!result || saving}
          >
            {saving ? '저장 중...' : '기록 저장하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
