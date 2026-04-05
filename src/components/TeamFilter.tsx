import { teamIds, teams, stadiumGroups } from '../data/teams'
import './TeamFilter.css'

interface TeamFilterProps {
  viewTeams: Set<string>
  myTeam: string | null
  onTeamChange: (teamId: string | null) => void
  viewStadiums: Set<string>
  onStadiumChange: (stadiumId: string | null) => void
}

export default function TeamFilter({
  viewTeams, myTeam, onTeamChange, viewStadiums, onStadiumChange,
}: TeamFilterProps) {
  return (
    <div className="team-filter">
      {/* 팀 필터 */}
      <div className="team-filter__section-label">팀</div>
      <div className="team-filter__scroll">
        <button
          className={`team-filter__chip${viewTeams.size === 0 ? ' team-filter__chip--all-active' : ''}`}
          onClick={() => onTeamChange(null)}
          aria-pressed={viewTeams.size === 0}
        >
          전체
        </button>

        {myTeam && (
          <button
            className={`team-filter__chip${viewTeams.has(myTeam) ? ' team-filter__chip--active' : ''}`}
            style={
              viewTeams.has(myTeam)
                ? { backgroundColor: teams[myTeam]?.color, borderColor: teams[myTeam]?.color }
                : {}
            }
            onClick={() => onTeamChange(myTeam)}
            aria-pressed={viewTeams.has(myTeam)}
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
          const isActive = viewTeams.has(teamId)
          return (
            <button
              key={teamId}
              className={`team-filter__chip${isActive ? ' team-filter__chip--active' : ''}`}
              style={isActive ? { backgroundColor: team.color, borderColor: team.color } : {}}
              onClick={() => onTeamChange(teamId)}
              aria-pressed={isActive}
            >
              <img className="team-filter__chip-logo" src={team.logo} alt={team.shortName} width={18} height={18} />
              {team.shortName}
            </button>
          )
        })}
      </div>

      {/* 구장/지역 필터 */}
      <div className="team-filter__section-label">지역</div>
      <div className="team-filter__scroll">
        <button
          className={`team-filter__chip${viewStadiums.size === 0 ? ' team-filter__chip--all-active' : ''}`}
          onClick={() => onStadiumChange(null)}
          aria-pressed={viewStadiums.size === 0}
        >
          전체
        </button>

        {stadiumGroups.map((sg) => {
          const isActive = viewStadiums.has(sg.id)
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
