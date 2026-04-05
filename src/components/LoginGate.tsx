import './LoginGate.css'

interface LoginGateProps {
  onLogin: () => void
  loading: boolean
}

export default function LoginGate({ onLogin, loading }: LoginGateProps) {
  return (
    <div className="login-gate">
      <div className="login-gate__content">
        <span className="login-gate__icon">🔐</span>
        <h2 className="login-gate__title">로그인이 필요해요</h2>
        <p className="login-gate__desc">
          직관 기록을 저장하고 관리하려면<br />
          토스 로그인이 필요합니다
        </p>
        <button
          className="login-gate__btn"
          onClick={onLogin}
          disabled={loading}
        >
          {loading ? '로그인 중...' : '토스로 로그인하기'}
        </button>
      </div>
    </div>
  )
}
