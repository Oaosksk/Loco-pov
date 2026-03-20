import React, { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, Wallet, Target, Heart, CalendarClock,
  Zap, Sun, Moon, LogOut, MoreVertical, Brain, Settings,
} from 'lucide-react'

// Main bottom nav items
const MAIN_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/notes',     label: 'Notes',     icon: BookOpen         },
  { to: '/goals',     label: 'Goals',     icon: Target           },
]

// Items hidden inside the ⋮ more menu
const MORE_NAV = [
  { to: '/expenses',  label: 'Expenses', icon: Wallet       },
  { to: '/health',    label: 'Health',   icon: Heart        },
  { to: '/ai',        label: 'AI',       icon: Brain        },
  { to: '/settings',  label: 'Settings', icon: Settings     },
]

function Avatar({ user }) {
  const src = user?.user_metadata?.avatar_url
  const name = user?.user_metadata?.full_name || user?.email || 'User'
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center overflow-hidden flex-shrink-0">
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-white text-xs font-bold">{initials}</span>
      )}
    </div>
  )
}

// Top bar + bottom nav
function BottomNav({ user, isDark, onToggleDark, onSignOut }) {
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef(null)
  const navigate = useNavigate()

  // Close popup when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3
                         bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-sm
                         border-b border-border-light dark:border-border-dark">
        <div className="flex items-center gap-2 mr-auto">
          <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Zap size={14} className="text-primary" />
          </div>
          <span className="text-base font-bold font-serif text-text-light dark:text-text-dark">Loco</span>
        </div>
        <button onClick={onToggleDark} className="btn-icon">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button onClick={onSignOut} className="btn-icon" title="Sign out">
          <LogOut size={18} />
        </button>
        <Avatar user={user} />
      </header>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 px-3 pb-3 pt-2
                      bg-surface-light dark:bg-surface-dark
                      border-t border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between gap-1 max-w-lg mx-auto
                        bg-bg-light dark:bg-bg-dark rounded-2xl px-2 py-1.5">

          {/* Main nav items */}
          {MAIN_NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1 px-2 sm:px-3 h-10 rounded-xl text-xs sm:text-sm font-semibold transition-all
                 ${isActive
                   ? 'bg-text-light dark:bg-text-dark text-surface-light dark:text-surface-dark'
                   : 'text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark'}`
              }
            >
              <Icon size={16} />
              <span className="hidden xs:inline sm:inline">{label}</span>
            </NavLink>
          ))}

          {/* ⋮ More button with popup */}
          <div className="relative" ref={moreRef}>
            {/* More popup */}
            {moreOpen && (
              <div className="absolute bottom-12 right-0 w-44
                              bg-surface-light dark:bg-surface-dark
                              border border-border-light dark:border-border-dark
                              rounded-xl shadow-lg overflow-hidden z-50 animate-slide-up">
                {MORE_NAV.map(({ to, label, icon: Icon }) => (
                  <button
                    key={to}
                    onClick={() => { navigate(to); setMoreOpen(false) }}
                    className="w-full flex items-center gap-2.5 px-4 py-3
                               text-sm font-semibold
                               text-text-light dark:text-text-dark
                               hover:bg-bg-light dark:hover:bg-bg-dark transition-colors">
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setMoreOpen(v => !v)}
              className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all
                         ${moreOpen
                           ? 'bg-text-light dark:bg-text-dark text-surface-light dark:text-surface-dark'
                           : 'text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark'}`}>
              <MoreVertical size={20} />
            </button>
          </div>

          <div className="w-px h-6 bg-border-light dark:bg-border-dark" />

          {/* Avatar / sign out */}
          <button
            onClick={onSignOut}
            className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-border-light dark:ring-border-dark">
            <Avatar user={user} />
          </button>

        </div>
      </nav>
    </>
  )
}

export function Layout({ user, isDark, onToggleDark, onSignOut, isDemoMode, children }) {
  return (
    <div className="flex flex-col min-h-screen bg-bg-light dark:bg-bg-dark">
      <BottomNav
        user={user}
        isDark={isDark}
        onToggleDark={onToggleDark}
        onSignOut={onSignOut}
      />
      <main className="flex-1 p-3 md:p-8 pb-28 max-w-5xl w-full mx-auto animate-fade-in overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
