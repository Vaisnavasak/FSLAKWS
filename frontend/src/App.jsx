import { Routes, Route } from 'react-router-dom'
import SignIn from './pages/SignIn'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import KeywordSearch from './pages/KeywordSearch'
import Results from './pages/Results'
import History from './pages/History'
import AdminPanel from './pages/AdminPanel'

function App() {
  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/keyword-search" element={<KeywordSearch />} />
      <Route path="/results" element={<Results />} />
      <Route path="/history" element={<History />} />
      <Route path="/admin" element={<AdminPanel />} />
    </Routes>
  )
}

export default App