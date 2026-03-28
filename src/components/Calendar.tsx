import './Calendar.css'

interface CalendarProps {
  currentMonth: Date
  selectedDate: string
  gameDates: Set<string>
  onDateSelect: (date: string) => void
  onMonthChange: (month: Date) => void
}

const DAY_HEADERS = ['일', '월', '화', '수', '목', '금', '토']

function padTwo(n: number): string {
  return n.toString().padStart(2, '0')
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${padTwo(month)}-${padTwo(day)}`
}

function getTodayKey(): string {
  const d = new Date()
  return formatDateKey(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

export default function Calendar({
  currentMonth,
  selectedDate,
  gameDates,
  onDateSelect,
  onMonthChange,
}: CalendarProps) {
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth() // 0-indexed
  const todayKey = getTodayKey()

  // First day of the month (0=Sun..6=Sat)
  const firstDow = new Date(year, month, 1).getDay()
  // Last date of the month
  const lastDate = new Date(year, month + 1, 0).getDate()
  // Last date of previous month
  const prevLastDate = new Date(year, month, 0).getDate()

  const cells: Array<{ dateKey: string; day: number; outside: boolean }> = []

  // Leading cells from previous month
  for (let i = firstDow - 1; i >= 0; i--) {
    const d = prevLastDate - i
    const prevMonth = month === 0 ? 12 : month
    const prevYear = month === 0 ? year - 1 : year
    cells.push({ dateKey: formatDateKey(prevYear, prevMonth, d), day: d, outside: true })
  }

  // Current month cells
  for (let d = 1; d <= lastDate; d++) {
    cells.push({ dateKey: formatDateKey(year, month + 1, d), day: d, outside: false })
  }

  // Trailing cells to complete the last row
  const remainder = cells.length % 7
  if (remainder !== 0) {
    const trailing = 7 - remainder
    const nextMonth = month === 11 ? 1 : month + 2
    const nextYear = month === 11 ? year + 1 : year
    for (let d = 1; d <= trailing; d++) {
      cells.push({ dateKey: formatDateKey(nextYear, nextMonth, d), day: d, outside: true })
    }
  }

  function handlePrevMonth() {
    const d = new Date(year, month - 1, 1)
    onMonthChange(d)
  }

  function handleNextMonth() {
    const d = new Date(year, month + 1, 1)
    onMonthChange(d)
  }

  return (
    <div className="calendar">
      <div className="calendar__header">
        <button className="calendar__nav-btn" onClick={handlePrevMonth} aria-label="이전 달">
          ‹
        </button>
        <span className="calendar__month-title">
          {year}년 {month + 1}월
        </span>
        <button className="calendar__nav-btn" onClick={handleNextMonth} aria-label="다음 달">
          ›
        </button>
      </div>

      <div className="calendar__grid">
        {DAY_HEADERS.map((h, i) => (
          <div
            key={h}
            className={`calendar__day-header${i === 0 ? ' calendar__day-header--sun' : i === 6 ? ' calendar__day-header--sat' : ''}`}
          >
            {h}
          </div>
        ))}

        {cells.map(({ dateKey, day, outside }, idx) => {
          const colIdx = idx % 7
          const isToday = !outside && dateKey === todayKey
          const isSelected = dateKey === selectedDate
          const hasGame = gameDates.has(dateKey)
          const clickable = !outside && hasGame

          let btnClass = 'calendar__day-btn'
          if (colIdx === 0) btnClass += ' calendar__day-btn--sun'
          if (colIdx === 6) btnClass += ' calendar__day-btn--sat'
          if (outside) btnClass += ' calendar__day-btn--outside'
          if (isToday && !isSelected) btnClass += ' calendar__day-btn--today'
          if (isSelected) btnClass += ' calendar__day-btn--selected'

          return (
            <div key={`${dateKey}-${idx}`} className="calendar__day-cell">
              <button
                className={btnClass}
                disabled={!clickable}
                onClick={clickable ? () => onDateSelect(dateKey) : undefined}
                aria-label={`${dateKey}${hasGame ? ' 경기 있음' : ''}`}
                aria-pressed={isSelected}
              >
                {day}
              </button>
              <div className={`calendar__game-dot${hasGame && !outside ? '' : ' calendar__game-dot--hidden'}`} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
