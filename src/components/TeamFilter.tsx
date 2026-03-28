import { teamIds, teams } from '../data/teams'
import './TeamFilter.css'

interface TeamFilterProps {
  viewTeam: string | null
  myTeam: string | null
  onTeamChange: (teamId: string | null) => void
}

export default function TeamFilter({ viewTeam, myTeam, onTeamChange }: TeamFilterProps) {
  return (
    <div className="team-filter">
      <div className="team-filter__scroll">
        {/* 전체 chip */}
        <button
          className={`team-filter__chip${viewTeam === null ? ' team-filter__chip--all-active' : ''}`}
          onClick={() => onTeamChange(null)}
          aria-pressed={viewTeam === null}
        >
          전체
        </button>

        {/* 내 구단 chip */}
        {myTeam && (
          <button
            className={`team-filter__chip${viewTeam === myTeam ? ' team-filter__chip--active' : ''}`}
            style={
              viewTeam === myTeam
                ? { backgroundColor: teams[myTeam]?.color, borderColor: teams[myTeam]?.color }
                : {}
            }
            onClick={() => onTeamChange(myTeam)}
            aria-pressed={viewTeam === myTeam}
          >
            <div
              className="team-filter__chip-dot"
              style={{ backgroundColor: teams[myTeam]?.color }}
            />
            내 구단
          </button>
        )}

        {/* All 10 team chips */}
        {teamIds.map((teamId) => {
          const team = teams[teamId]
          const isActive = viewTeam === teamId
          return (
            <button
              key={teamId}
              className={`team-filter__chip${isActive ? ' team-filter__chip--active' : ''}`}
              style={isActive ? { backgroundColor: team.color, borderColor: team.color } : {}}
              onClick={() => onTeamChange(teamId)}
              aria-pressed={isActive}
            >
              {team.shortName}
            </button>
          )
        })}
      </div>
    </div>
  )
}
