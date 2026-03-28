import type { CSSProperties } from 'react'
import { teamIds, teams } from '../data/teams'
import './MyTeamSetup.css'

interface MyTeamSetupProps {
  onSelect: (teamId: string) => void
}

export default function MyTeamSetup({ onSelect }: MyTeamSetupProps) {
  return (
    <div className="my-team-setup" role="dialog" aria-modal="true" aria-label="응원 구단 선택">
      <div className="my-team-setup__header">
        <div className="my-team-setup__kbo-badge">
          ⚾ KBO 티켓 캘린더
        </div>
        <h1 className="my-team-setup__title">응원하는 구단을<br />선택하세요</h1>
        <p className="my-team-setup__subtitle">
          홈/원정 관계없이 경기를 모아볼 수 있어요
        </p>
      </div>

      <div className="my-team-setup__content">
        <div className="my-team-setup__grid">
          {teamIds.map((teamId) => {
            const team = teams[teamId]
            return (
              <button
                key={teamId}
                className="my-team-setup__team-btn"
                style={
                  {
                    '--team-color': team.color,
                  } as CSSProperties
                }
                onClick={() => onSelect(teamId)}
                aria-label={`${team.name} 선택`}
              >
                <span className="my-team-setup__team-name">{team.name}</span>
                <span className="my-team-setup__team-stadium">{team.stadium}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
