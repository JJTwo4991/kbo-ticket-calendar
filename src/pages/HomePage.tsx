import { useState, useEffect, useMemo } from 'react'
import Calendar from '../components/Calendar'
import GameList from '../components/GameList'
import TeamFilter from '../components/TeamFilter'
import MyTeamSetup from '../components/MyTeamSetup'
import AlertSettings from '../components/AlertSettings'
import StandingsBanner from '../components/StandingsBanner'
import StandingsSheet from '../components/StandingsSheet'
import SettingsSheet from '../components/SettingsSheet'
import BannerAd from '../components/BannerAd'
import { teams, stadiumGroups } from '../data/teams'
import type { AlertSettingsData } from '../types'
import { setupBackHandler, parseDeepLink, closeApp } from '../lib/toss-bridge'
import { getTicketOpenInfo } from '../lib/ticket-utils'
import { useGames } from '../lib/use-games'
import './HomePage.css'

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

export default function HomePage() {
  const { games: allGames, standings, ticketPolicies, loading } = useGames()

  // My team from localStorage
  const [myTeam, setMyTeam] = useState<string | null>(() => {
    return localStorage.getItem('kbo-my-team')
  })

  // Selected date (default today or fallback)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = getTodayKey()
    return today || '2026-03-28'
  })

  // Current month for calendar
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const parts = selectedDate.split('-').map(Number)
    return new Date(parts[0], parts[1] - 1, 1)
  })

  // 다중 팀 필터 (Set 기반)
  const [viewTeams, setViewTeams] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('kbo-my-team')
    return new Set([saved].filter(Boolean) as string[])
  })

  // 다중 구장/지역 필터 (Set 기반)
  const [viewStadiums, setViewStadiums] = useState<Set<string>>(() => new Set())

  const [showAlertSettings, setShowAlertSettings] = useState(false)
  const [showStandings, setShowStandings] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

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
    setViewTeams(new Set([teamId]))
  }

  // Persist alertSettings to localStorage
  function handleAlertSettingsChange(next: AlertSettingsData) {
    setAlertSettings(next)
    localStorage.setItem('kbo-alert-settings', JSON.stringify(next))
  }

  // 팀 필터 toggle: null이면 전체 초기화, 아니면 toggle (add/delete)
  function handleTeamChange(teamId: string | null) {
    if (teamId === null) {
      setViewTeams(new Set())
    } else {
      setViewTeams(prev => {
        const next = new Set(prev)
        if (next.has(teamId)) {
          next.delete(teamId)
        } else {
          next.add(teamId)
        }
        return next
      })
    }
  }

  // 구장/지역 필터 toggle: null이면 전체 초기화, 아니면 toggle
  function handleStadiumChange(stadiumId: string | null) {
    if (stadiumId === null) {
      setViewStadiums(new Set())
    } else {
      setViewStadiums(prev => {
        const next = new Set(prev)
        if (next.has(stadiumId)) {
          next.delete(stadiumId)
        } else {
          next.add(stadiumId)
        }
        return next
      })
    }
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
      setViewTeams(new Set([team]))
    }
  }, [])

  // 뒤로가기 처리: 모든 시트 닫혀있으면 앱 종료
  useEffect(() => {
    const cleanup = setupBackHandler(() => {
      if (showAlertSettings) {
        setShowAlertSettings(false)
      } else if (showStandings) {
        setShowStandings(false)
      } else if (showSettings) {
        setShowSettings(false)
      } else {
        closeApp()
      }
    })
    return cleanup
  }, [showAlertSettings, showStandings, showSettings])

  // 게임 로드 후 오늘 경기 없으면 가장 가까운 미래 경기일로 이동
  useEffect(() => {
    if (allGames.length === 0) return
    const today = getTodayKey()
    const hasGameToday = allGames.some(g => g.date === today)
    if (!hasGameToday) {
      const futureGame = allGames.find(g => g.date >= today)
      if (futureGame) {
        setSelectedDate(futureGame.date)
        const parts = futureGame.date.split('-').map(Number)
        setCurrentMonth(new Date(parts[0], parts[1] - 1, 1))
      }
    }
  }, [allGames])

  // Filter games by viewTeams + viewStadiums
  const filteredGames = useMemo(() => {
    let games = allGames

    if (viewTeams.size > 0) {
      games = games.filter((g) => viewTeams.has(g.home) || viewTeams.has(g.away))
    }

    if (viewStadiums.size > 0) {
      const allowedStadiums = new Set<string>()
      for (const id of viewStadiums) {
        const group = stadiumGroups.find((sg) => sg.id === id)
        if (group) {
          for (const s of group.stadiums) allowedStadiums.add(s)
        }
      }
      games = games.filter((g) => allowedStadiums.has(g.stadium ?? ''))
    }

    return games
  }, [allGames, viewTeams, viewStadiums])

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

  // 예매 오픈 날짜 (현재 월, filteredGames 기반)
  const ticketOpenDatesInMonth = useMemo(() => {
    if (ticketPolicies.length === 0) return new Set<string>()
    const set = new Set<string>()
    const y = currentMonth.getFullYear()
    const m = currentMonth.getMonth() + 1
    const prefix = `${y}-${m.toString().padStart(2, '0')}`
    for (const g of filteredGames) {
      if (g.date.startsWith(prefix)) {
        const info = getTicketOpenInfo(g, ticketPolicies)
        if (info) set.add(info.openDate)
      }
    }
    return set
  }, [filteredGames, currentMonth, ticketPolicies])

  // Games for selected date
  const gamesOnSelectedDate = useMemo(() => {
    return filteredGames.filter((g) => g.date === selectedDate)
  }, [filteredGames, selectedDate])

  // 선택 날짜에 예매 오픈되는 경기
  const ticketOpenGamesOnSelectedDate = useMemo(() => {
    if (ticketPolicies.length === 0) return []
    return filteredGames.filter((g) => {
      const info = getTicketOpenInfo(g, ticketPolicies)
      return info?.openDate === selectedDate
    })
  }, [filteredGames, selectedDate, ticketPolicies])

  function handleDateSelect(date: string) {
    setSelectedDate(date)
  }

  function handleMonthChange(month: Date) {
    setCurrentMonth(month)
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
          <span className="app-header__title">⚾ 직관갈래</span>
          <span className="app-header__subtitle">2026 KBO 경기 일정 & 예매</span>
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
          <button
            className="app-header__icon-btn"
            onClick={() => setShowSettings(true)}
            aria-label="설정"
          >
            ⚙️
          </button>
        </div>
      </header>

      <div className="app-content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--toss-gray-500)', fontSize: '14px' }}>
            경기 일정을 불러오는 중...
          </div>
        ) : (
          <>
            {/* 순위 배너 */}
            <StandingsBanner
              standings={standings}
              myTeam={myTeam}
              onTap={() => setShowStandings(true)}
            />

            {/* Team filter */}
            <TeamFilter
              viewTeams={viewTeams}
              myTeam={myTeam}
              onTeamChange={handleTeamChange}
              viewStadiums={viewStadiums}
              onStadiumChange={handleStadiumChange}
            />

            {/* Calendar */}
            <Calendar
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              gameDates={gameDatesInMonth}
              ticketOpenDates={ticketOpenDatesInMonth}
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
              ticketOpenGames={ticketOpenGamesOnSelectedDate}
              ticketPolicies={ticketPolicies}
            />

            {/* 배너 광고 */}
            <BannerAd />
          </>
        )}
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

      {showStandings && (
        <StandingsSheet
          standings={standings}
          myTeam={myTeam}
          onClose={() => setShowStandings(false)}
        />
      )}

      {showSettings && (
        <SettingsSheet
          myTeam={myTeam}
          onChangeTeam={handleSelectMyTeam}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
