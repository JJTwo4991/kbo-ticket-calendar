import type { CSSProperties } from 'react'
import { teamIds, teams } from '../data/teams'
import './SettingsSheet.css'

interface SettingsSheetProps {
  myTeam: string | null
  onChangeTeam: (teamId: string) => void
  onClose: () => void
}

export default function SettingsSheet({ myTeam, onChangeTeam, onClose }: SettingsSheetProps) {
  return (
    <div className="settings-overlay" role="dialog" aria-modal="true" aria-label="설정">
      <div className="settings-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="settings-sheet">
        <div className="settings-sheet__handle" />
        <div className="settings-sheet__header">
          <span className="settings-sheet__title">설정</span>
          <button className="settings-sheet__close-btn" onClick={onClose} aria-label="닫기">✕</button>
        </div>
        <div className="settings-sheet__body">
          <div className="settings-section">
            <div className="settings-section__label">응원 구단 변경</div>
            <div className="settings-section__grid">
              {teamIds.map(teamId => {
                const team = teams[teamId]
                const isSelected = teamId === myTeam
                return (
                  <button
                    key={teamId}
                    className={`settings-team-btn${isSelected ? ' settings-team-btn--selected' : ''}`}
                    style={{ '--team-color': team.color } as CSSProperties}
                    onClick={() => { onChangeTeam(teamId); onClose() }}
                  >
                    <img className="settings-team-btn__logo" src={team.logo} alt={team.shortName} width={32} height={32} />
                    <span className="settings-team-btn__name">{team.shortName}</span>
                    {isSelected && <span className="settings-team-btn__check">✓</span>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
