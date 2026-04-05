import { useState, useEffect, useCallback } from 'react'
import { useTossAuth } from '../lib/toss-auth'
import { fetchAttendance, fetchStats } from '../lib/attendance-api'
import type { AttendanceRecord, AttendanceStats } from '../lib/attendance-api'
import LoginGate from '../components/LoginGate'
import SeasonReport from '../components/SeasonReport'
import AttendanceList from '../components/AttendanceList'
import StampMap from '../components/StampMap'
import './MyRecordsPage.css'

export default function MyRecordsPage() {
  const { user, isLoggedIn, login, loading: authLoading } = useTossAuth()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [dataLoading, setDataLoading] = useState(false)

  const loadData = useCallback(async () => {
    if (!user) return
    setDataLoading(true)
    try {
      const [recordsData, statsData] = await Promise.all([
        fetchAttendance(user.userKey.toString()),
        fetchStats(user.userKey.toString()),
      ])
      setRecords(recordsData)
      setStats(statsData)
    } catch (err) {
      console.error('[MyRecords] Failed to load data:', err)
    } finally {
      setDataLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (isLoggedIn) loadData()
  }, [isLoggedIn, loadData])

  return (
    <div className="my-records-page">
      <div className="my-records-page__header">
        <h1 className="my-records-page__title">내 직관</h1>
      </div>

      {!isLoggedIn ? (
        <LoginGate onLogin={login} loading={authLoading} />
      ) : dataLoading ? (
        <div className="my-records-page__loading">
          직관 기록을 불러오는 중...
        </div>
      ) : (
        <div className="my-records-page__content">
          {stats && (
            <SeasonReport
              totalGames={stats.totalGames}
              wins={stats.wins}
              losses={stats.losses}
              winRate={stats.winRate}
              stadiumCount={stats.stadiumCount}
              totalStadiums={stats.totalStadiums}
            />
          )}

          {(() => {
            const visitedStadiums = new Set(records.map(r => r.games?.stadium).filter(Boolean) as string[])
            const visitCounts: Record<string, number> = {}
            records.forEach(r => {
              const s = r.games?.stadium
              if (s) visitCounts[s] = (visitCounts[s] || 0) + 1
            })
            return <StampMap visitedStadiums={visitedStadiums} visitCounts={visitCounts} />
          })()}

          <AttendanceList records={records} />
        </div>
      )}
    </div>
  )
}
