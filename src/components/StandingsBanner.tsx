import { teams } from '../data/teams'
import type { Standing } from '../types'
import './StandingsBanner.css'

interface StandingsBannerProps {
  standings: Standing[]
  myTeam: string | null
  onTap: () => void
}

export default function StandingsBanner({ standings, myTeam, onTap }: StandingsBannerProps) {
  if (standings.length === 0 || !myTeam) return null

  const myStanding = standings.find(s => s.team === myTeam)
  if (!myStanding) return null

  const teamInfo = teams[myTeam]

  return (
    <button className="standings-banner" onClick={onTap} aria-label="전체 순위 보기">
      <div className="standings-banner__left">
        {teamInfo && (
          <img className="standings-banner__logo" src={teamInfo.logo} alt={teamInfo.shortName} width={24} height={24} />
        )}
        <span className="standings-banner__team">{teamInfo?.shortName ?? myTeam}</span>
      </div>
      <div className="standings-banner__stats">
        <span className="standings-banner__rank">{myStanding.rank}위</span>
        <span className="standings-banner__record">{myStanding.wins}승 {myStanding.losses}패 {myStanding.draws}무</span>
        <span className="standings-banner__pct">승률 {myStanding.pct.toFixed(3).slice(1)}</span>
      </div>
      <span className="standings-banner__arrow">›</span>
    </button>
  )
}
