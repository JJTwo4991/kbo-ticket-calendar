import './SeasonReport.css'

interface SeasonReportProps {
  totalGames: number
  wins: number
  losses: number
  winRate: number
  stadiumCount: number
  totalStadiums: number
}

export default function SeasonReport({
  totalGames, wins, losses, winRate, stadiumCount, totalStadiums,
}: SeasonReportProps) {
  const winRateDisplay = totalGames > 0 ? `${Math.round(winRate * 100)}%` : '-'
  const winLabel = totalGames > 0
    ? (winRate >= 0.6 ? '직관 요정 ✨' : winRate <= 0.4 ? '패요... 😢' : '평균이에요')
    : ''

  return (
    <div className="season-report">
      <h2 className="season-report__title">2026 시즌 직관 리포트</h2>
      <div className="season-report__cards">
        <div className="season-report__card">
          <span className="season-report__card-value">{totalGames}회</span>
          <span className="season-report__card-label">직관</span>
        </div>
        <div className="season-report__card">
          <span className="season-report__card-value">{winRateDisplay}</span>
          <span className="season-report__card-label">승률</span>
          {winLabel && <span className="season-report__card-sub">{winLabel}</span>}
        </div>
        <div className="season-report__card">
          <span className="season-report__card-value">{stadiumCount}/{totalStadiums}</span>
          <span className="season-report__card-label">구장</span>
        </div>
      </div>
      {totalGames > 0 && (
        <div className="season-report__detail">
          {wins}승 {losses}패
        </div>
      )}
    </div>
  )
}
