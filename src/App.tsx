import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import MyRecordsPage from './pages/MyRecordsPage'
import BottomNav from './components/BottomNav'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/my-records" element={<MyRecordsPage />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
