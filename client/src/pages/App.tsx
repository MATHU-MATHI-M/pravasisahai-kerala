import React, { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { clearSession, readSession } from '../api'
import { FiSun, FiMoon } from 'react-icons/fi'
import './App.css'

export default function App() {
  const loc = useLocation()
  const nav = useNavigate()
  const { token, health_id } = readSession()

  const [theme, setTheme] = useState<string>(() => localStorage.getItem('theme') || 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'))

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header>
        <h2>
          <Link to="/" style={{ color: 'var(--header-text)' }}>Pravasahai</Link>
        </h2>
        <nav>
          {!token && <>
            <Link to="/register" className={loc.pathname==='/register'?'active':''}>Register Migrant</Link>
            <Link to="/login" className={loc.pathname==='/login'?'active':''}>Login</Link>
          </>}
          {token && (
            <>
              <Link to={`/dashboard/${health_id}`} className={loc.pathname.startsWith('/dashboard')?'active':''}>Dashboard</Link>
              <Link to="/ngo-scanner" className={loc.pathname==='/ngo-scanner'?'active':''}>NGO Scanner</Link>
              <Link to="/government-scanner" className={loc.pathname==='/government-scanner'?'active':''}>Government Scanner</Link>
            </>
          )}
        </nav>
        <div className="header-actions">
          <button
            onClick={toggleTheme}
            aria-label={theme==='light' ? 'Switch to dark mode' : 'Switch to light mode'}
            title={theme==='light' ? 'Dark mode' : 'Light mode'}
            style={{ background: 'transparent', color: 'var(--header-text)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '8px 10px' }}
          >
            {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
          </button>
          {token && (
            <button onClick={() => { clearSession(); nav('/login') }}>Logout</button>
          )}
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer>
        <div className="footer-links">
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/help">Help Center</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
        <div className="footer-copy">© 2025 Pravasahai. All rights reserved.</div>
      </footer>
    </div>
  )
}
