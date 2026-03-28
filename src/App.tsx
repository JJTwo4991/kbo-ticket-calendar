import { useState, useEffect, useMemo } from 'react'
import Calendar from './components/Calendar'
import GameList from './components/GameList'
import TeamFilter from './components/TeamFilter'
import MyTeamSetup from './components/MyTeamSetup'
import AlertSettings from './components/AlertSettings'
import { teams, stadiumGroups } from './data/teams'
import scheduleData from './data/schedule.json'
import type { RawGame, Game, AlertSettingsData } from './types'
import { setupBackHandler, parseDeepLink } from './lib/toss-bridge'
import './App.css'

function getTodayKey(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${day}`
}

function loadAlertSettings(): AlertSettingsData {
  try {
    const raw = localStorage.getItem('kbo-alert-settings')
    if (raw) return JSON.parse(raw) as AlertSettingsData
  } catch {
    // ignore
  }
  return { enabled: false, timings: ['1시간 전'] }
}

export default function App() {
  const allGames: Game[] = (scheduleData as RawGame[]).map((g, i) => ({
    ...g,
    id: `${g.date}-${g.away}-${g.home}-${i}`,
  }))

  // My team from localStorage
  const [myTeam, setMyTeam] = useState<string | null>(() => {
    return localStorage.getItem('kbo-my-team')
  })

  // Selected date (default today or fallback)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = getTodayKey()
    // Use today if there's a game, otherwise use fallback
    return today || '2026-03-28'
  })

  // Current month for calendar
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const parts = selectedDate.split('-').map(Number)
    return new Date(parts[0], parts[1] - 1, 1)
  })

  // View team filter (default to myTeam when first set)
  const [viewTeam, setViewTeam] = useState<string | null>(() => {
    return localStorage.getItem('kbo-my-team')
  })

  // 구장/지역 필터
  const [viewStadium, setViewStadium] = useState<string | null>(null)

  const [showAlertSettings, setShowAlertSettings] = useState(false)

  const [alertSettings, setAlertSettings] = useState<AlertSettingsData>(loadAlertSettings)

  // 알림 설정된 경기 ID Set — localStorage에 영속화
  const [alertedGames, setAlertedGames] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('kbo-alerted-games')
      if (raw) return new Set(JSON.parse(raw) as string[])
    } catch { /* ignore */ }
    return new Set()
  })

  // Persist myTeam to localStorage
  function handleSelectMyTeam(teamId: string) {
    localStorage.setItem('kbo-my-team', teamId)
    setMyTeam(teamId)
    setViewTeam(teamId)
  }

  // Persist alertSettings to localStorage
  function handleAlertSettingsChange(next: AlertSettingsData) {
    setAlertSettings(next)
    localStorage.setItem('kbo-alert-settings', JSON.stringify(next))
  }

  // 딥링크로 날짜/팀 자동 설정
  useEffect(() => {
    const { date, team } = parseDeepLink()
    if (date) {
      setSelectedDate(date)
      const parts = date.split('-').map(Number)
      setCurrentMonth(new Date(parts[0], parts[1] - 1, 1))
    }
    if (team) {
      setViewTeam(team)
    }
  }, [])

  // 뒤로가기 처리
  useEffect(() => {
    const cleanup = setupBackHandler(() => {
      if (showAlertSettings) {
        setShowAlertSettings(false)
      }
    })
    return cleanup
  }, [showAlertSettings])

  // Sync viewTeam when myTeam is first set
  useEffect(() => {
    if (myTeam && viewTeam === null) {
      setViewTeam(myTeam)
    }
  }, [myTeam, viewTeam])

  // Filter games by viewTeam + viewStadium
  const filteredGames = useMemo(() => {
    let games = allGames

    // 팀 필터
    if (viewTeam) {
      games = games.filter((g) => g.home === viewTeam || g.away === viewTeam)
    }

    // 구장/지역 필터
    if (viewStadium) {
      const group = stadiumGroups.find((sg) => sg.id === viewStadium)
      if (group) {
        games = games.filter((g) => group.stadiums.includes(g.stadium ?? ''))
      }
    }

    return games
  }, [allGames, viewTeam, viewStadium])

  // Game dates in current month (for calendar dots)
  const gameDatesInMonth = useMemo(() => {
    const set = new Set<string>()
    const y = currentMonth.getFullYear()
    const m = currentMonth.getMonth() + 1
    const prefix = `${y}-${m.toString().padStart(2, '0')}`
    for (const g of filteredGames) {
      if (g.date.startsWith(prefix)) {
        set.add(g.date)
      }
    }
    return set
  }, [filteredGames, currentMonth])

  // Games for selected date
  const gamesOnSelectedDate = useMemo(() => {
    return filteredGames.filter((g) => g.date === selectedDate)
  }, [filteredGames, selectedDate])

  function handleDateSelect(date: string) {
    setSelectedDate(date)
  }

  function handleMonthChange(month: Date) {
    setCurrentMonth(month)
  }

  function handleTeamChange(teamId: string | null) {
    setViewTeam(teamId)
  }

  function handleStadiumChange(stadiumId: string | null) {
    setViewStadium(stadiumId)
  }

  function handleToggleAlert(gameId: string) {
    setAlertedGames(prev => {
      const next = new Set(prev)
      if (next.has(gameId)) {
        next.delete(gameId)
      } else {
        next.add(gameId)
      }
      localStorage.setItem('kbo-alerted-games', JSON.stringify([...next]))
      return next
    })
  }

  const myTeamInfo = myTeam ? teams[myTeam] : null

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="app-header__title-group">
          <span className="app-header__title">⚾ KBO 티켓 캘린더</span>
          <span className="app-header__subtitle">경기 일정 & 예매</span>
        </div>
        <div className="app-header__actions">
          {myTeamInfo && (
            <span
              className="app-header__my-team-badge"
              style={{ backgroundColor: myTeamInfo.color }}
            >
              {myTeamInfo.shortName}
            </span>
          )}
          <button
            className="app-header__icon-btn"
            onClick={() => setShowAlertSettings(true)}
            aria-label="알림 설정"
          >
            🔔
          </button>
        </div>
      </header>

      <div className="app-content">
        {/* Team filter */}
        <TeamFilter
          viewTeam={viewTeam}
          myTeam={myTeam}
          onTeamChange={handleTeamChange}
          viewStadium={viewStadium}
          onStadiumChange={handleStadiumChange}
        />

        {/* Calendar */}
        <Calendar
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          gameDates={gameDatesInMonth}
          onDateSelect={handleDateSelect}
          onMonthChange={handleMonthChange}
        />

        {/* Game list */}
        <GameList
          games={gamesOnSelectedDate}
          myTeam={myTeam}
          onToggleAlert={handleToggleAlert}
          alertSettings={alertSettings}
          alertedGames={alertedGames}
        />
      </div>

      {/* Overlays */}
      {myTeam === null && (
        <MyTeamSetup onSelect={handleSelectMyTeam} />
      )}

      {showAlertSettings && (
        <AlertSettings
          settings={alertSettings}
          onClose={() => setShowAlertSettings(false)}
          onChange={handleAlertSettingsChange}
        />
      )}
    </div>
  )
}
