import React, { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {LayoutDashboard, BookOpen, Target, Wallet, Heart, Brain, Settings, LogOut, MoreVertical, HardDrive, AlarmClock} from 'lucide-react'

const MAIN_NAV = [
  { to: '/notes', label: 'Notes', icon: BookOpen},
  { to: '/goals', label: 'Goals', icon: Target},
  { to: '/alarm', label: 'Remainder', icon: AlarmClock},
  { to: '/expenses', label: 'Expenses', icon: Wallet},
]

const MORE_NAV = [
  { to: '/drive', label: 'Drive', icon: HardDrive},
  { to: '/health', label: 'Health', icon: Heart},
  { to: '/ai', label: 'AI', icon: Brain},
  { to: '/settings', label: 'Settings', icon: Settings},
]

const BG = '#0D1117'
const SURFACE = '#161B22'
const BORDER = '#21262D'
const TEXT = '#E6EDF3'
const MUTED = '#8B949E'

function Avatar({ user }) {
  const src  = user?.user_metadata?.avatar_url
  const name = user?.user_metadata?.full_name || user?.email || 'U'
  const init = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%',
      background: SURFACE, border: `0.5px solid ${BORDER}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', flexShrink: 0,
    }}>
      {src
        ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ color: MUTED, fontSize: 10, fontWeight: 500 }}>{init}</span>}
    </div>
  )
}

export function Layout({ user, isDark, onToggleDark, onSignOut, children }) {
  const [moreOpen, setMoreOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const moreRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)')
    const updateState = () => setIsMobile(mediaQuery.matches)

    updateState()
    mediaQuery.addEventListener('change', updateState)
    return () => mediaQuery.removeEventListener('change', updateState)
  }, [])

  useEffect(() => {
    const handler = e => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div style={{ minHeight: '100svh', background: BG, color: TEXT, fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', height: 48,
        background: `${SURFACE}cc`, backdropFilter: 'blur(12px)',
        borderBottom: `0.5px solid ${BORDER}`,
      }}>
        <img src="/icons/icon-512.png" alt="Logo" 
        style={ { width: 24, height: 24, borderRadius: 6 } }
        />
        <span style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: '1.1rem', fontWeight: 700, color: TEXT,
          letterSpacing: '-0.01em', marginRight: 'auto',
        }}>
          Loco
        </span>

        <button onClick={onSignOut} className="btn-icon" title="Sign out">
          <LogOut size={15} />
        </button>
        <Avatar user={user} />
      </header>

      <main style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px 120px', animationName: 'fadeIn', animationDuration: '0.2s' }}>
        {children}
      </main>

      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30, padding: '0 16px 20px' }}>
        <div style={{
          width: '100%', maxWidth: 480, margin: '0 auto',
          background: SURFACE,
          border: `0.5px solid ${BORDER}`,
          borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'space-around' : 'flex-start',
          padding: '6px 8px', gap: isMobile ? 0 : 4,
        }}>

          {MAIN_NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobile ? 0 : 6,
                flex: isMobile ? 1 : 'none',
                padding: '8px 12px', borderRadius: 10,
                fontSize: '0.875rem', fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
                textDecoration: 'none', flexShrink: 0, transition: 'all 0.15s',
                background: isActive ? TEXT : 'transparent',
                color: isActive ? BG : MUTED,
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                  {!isMobile && <span>{label}</span>}
                </>
              )}
            </NavLink>
          ))}

          <div style={{ flex: 1 }} />

          <div style={{ position: 'relative' }} ref={moreRef}>
            {moreOpen && (
              <div style={{
                position: 'absolute', bottom: 48, right: 0, width: 160,
                background: SURFACE, border: `0.5px solid ${BORDER}`,
                borderRadius: 12, overflow: 'hidden', zIndex: 50,
                animation: 'slideUp 0.2s ease-out',
              }}>
                {MORE_NAV.map(({ to, label, icon: Icon }) => (
                  <button
                    key={to}
                    onClick={() => { navigate(to); setMoreOpen(false) }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '12px 16px', background: 'none', border: 'none',
                      color: TEXT, fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif",
                      cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = BG}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <Icon size={15} style={{ color: MUTED }} />
                    {label}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setMoreOpen(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, borderRadius: 10,
                background: moreOpen ? TEXT : 'transparent',
                color: moreOpen ? BG : MUTED,
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <MoreVertical size={16} />
            </button>
          </div>
        </div>
      </nav>
    </div>
  )
}









