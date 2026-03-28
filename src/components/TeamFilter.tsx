import { teamIds, teams, stadiumGroups } from '../data/teams'
import './TeamFilter.css'

interface TeamFilterProps {
  viewTeam: string | null
  myTeam: string | null
  onTeamChange: (teamId: string | null) => void
  viewStadium: string | null
  onStadiumChange: (stadiumId: string | null) => void
}

export default function TeamFilter({
  viewTeam, myTeam, onTeamChange, viewStadium, onStadiumChange,
}: TeamFilterProps) {
  return (
    <div className="team-filter">
      {/* 팀 필터 */}
      <div className="team-filter__section-label">팀</div>
      <div className="team-filter__scroll">
        <button
          className={`team-filter__chip${viewTeam === null ? ' team-filter__chip--all-active' : ''}`}
          onClick={() => onTeamChange(null)}
          aria-pressed={viewTeam === null}
        >
          전체
        </button>

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

      {/* 구장/지역 필터 */}
      <div className="team-filter__section-label">지역</div>
      <div className="team-filter__scroll">
        <button
          className={`team-filter__chip${viewStadium === null ? ' team-filter__chip--all-active' : ''}`}
          onClick={() => onStadiumChange(null)}
          aria-pressed={viewStadium === null}
        >
          전체
        </button>

        {stadiumGroups.map((sg) => {
          const isActive = viewStadium === sg.id
          return (
            <button
              key={sg.id}
              className={`team-filter__chip${isActive ? ' team-filter__chip--stadium-active' : ''}`}
              onClick={() => onStadiumChange(sg.id)}
              aria-pressed={isActive}
            >
              {sg.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
