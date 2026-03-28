import type { AlertSettingsData } from '../types'
import './AlertSettings.css'

interface AlertSettingsProps {
  settings: AlertSettingsData
  onClose: () => void
  onChange: (settings: AlertSettingsData) => void
}

const TIMING_OPTIONS = ['1일 전', '1시간 전', '10분 전']

export default function AlertSettings({ settings, onClose, onChange }: AlertSettingsProps) {
  function handleToggleEnabled() {
    onChange({ ...settings, enabled: !settings.enabled })
  }

  function handleToggleTiming(timing: string) {
    const current = settings.timings
    let next: string[]
    if (current.includes(timing)) {
      // Must keep at least 1 selected
      if (current.length === 1) return
      next = current.filter((t) => t !== timing)
    } else {
      next = [...current, timing]
    }
    onChange({ ...settings, timings: next })
  }

  function handleSave() {
    onClose()
  }

  return (
    <div className="alert-settings-overlay" role="dialog" aria-modal="true" aria-label="경기 알림 설정">
      <div className="alert-settings-backdrop" onClick={onClose} aria-hidden="true" />

      <div className="alert-settings-sheet">
        <div className="alert-settings-sheet__handle" />

        <div className="alert-settings-sheet__header">
          <span className="alert-settings-sheet__title">경기 알림 설정</span>
          <button
            className="alert-settings-sheet__close-btn"
            onClick={onClose}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="alert-settings-sheet__body">
          {/* Toggle row */}
          <div className="alert-settings__toggle-row">
            <div className="alert-settings__toggle-label">
              <span className="alert-settings__toggle-title">알림 받기</span>
              <span className="alert-settings__toggle-desc">
                내 구단 경기 시작 전에 알려드려요
              </span>
            </div>
            <label className="toggle-switch" aria-label="알림 켜기/끄기">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={handleToggleEnabled}
              />
              <span className="toggle-switch__track" />
            </label>
          </div>

          {/* Timing chips — only shown when enabled */}
          {settings.enabled && (
            <div className="alert-settings__timing-section">
              <div className="alert-settings__timing-title">알림 시간</div>
              <div className="alert-settings__timing-chips">
                {TIMING_OPTIONS.map((timing) => {
                  const isActive = settings.timings.includes(timing)
                  return (
                    <button
                      key={timing}
                      className={`alert-settings__timing-chip${isActive ? ' alert-settings__timing-chip--active' : ''}`}
                      onClick={() => handleToggleTiming(timing)}
                      aria-pressed={isActive}
                    >
                      {timing}
                    </button>
                  )
                })}
              </div>
              <p className="alert-settings__timing-hint">최소 1개 이상 선택해야 해요</p>
            </div>
          )}

          {/* Save button */}
          <button className="alert-settings__save-btn" onClick={handleSave}>
            저장하기
          </button>
        </div>
      </div>
    </div>
  )
}
