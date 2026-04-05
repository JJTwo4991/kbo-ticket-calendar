import { useLocation, useNavigate } from 'react-router-dom'
import './BottomNav.css'

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname

  return (
    <nav className="bottom-nav">
      <button
        className={`bottom-nav__tab${currentPath === '/' ? ' bottom-nav__tab--active' : ''}`}
        onClick={() => navigate('/')}
      >
        <span className="bottom-nav__icon">⚾</span>
        <span className="bottom-nav__label">홈</span>
      </button>
      <button
        className={`bottom-nav__tab${currentPath === '/my-records' ? ' bottom-nav__tab--active' : ''}`}
        onClick={() => navigate('/my-records')}
      >
        <span className="bottom-nav__icon">📖</span>
        <span className="bottom-nav__label">내 직관</span>
      </button>
    </nav>
  )
}
