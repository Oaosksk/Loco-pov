import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  BookOpen, Target, HardDrive, Brain, Zap,
  Sun, Moon, LogOut, User
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/notes',  label: 'Notes',  icon: BookOpen },
  { to: '/goals',  label: 'Goals',  icon: Target   },
  { to: '/drive',  label: 'Drive',  icon: HardDrive },
  { to: '/ai',     label: 'AI',     icon: Brain    },
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

// Desktop sidebar
function Sidebar({ user, isDark, onToggleDark, onSignOut, isDemoMode }) {
  return (
    <aside className="hidden md:flex flex-col w-[220px] min-h-screen flex-shrink-0
                      bg-primary shadow-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-6">
        <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
          <Zap size={16} className="text-white" />
        </div>
        <span className="text-xl font-bold text-white font-serif">Loco</span>
        {isDemoMode && (
          <span className="ml-auto text-[10px] font-semibold text-accent bg-accent/20 px-2 py-0.5 rounded-full">
            DEMO
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5 space-y-1">
        {/* Dark mode */}
        <button
          onClick={onToggleDark}
          className="sidebar-link w-full text-left"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          {isDark ? 'Light mode' : 'Dark mode'}
        </button>

        {/* User */}
        <div className="flex items-center gap-2 px-4 py-2.5">
          <Avatar user={user} />
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">
              {user?.user_metadata?.full_name || user?.email || 'Demo User'}
            </p>
          </div>
          <button
            onClick={onSignOut}
            className="text-white/50 hover:text-white transition-colors"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}

// Mobile top bar + bottom nav
function MobileNav({ user, isDark, onToggleDark, onSignOut, page }) {
  return (
    <>
      {/* Top bar */}
      <header className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3
                         bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-sm
                         border-b border-border-light dark:border-border-dark">
        <div className="flex items-center gap-2 mr-auto">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Zap size={14} className="text-white" />
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30
                      bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-sm
                      border-t border-border-light dark:border-border-dark
                      flex items-stretch">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `bottom-nav-item flex-1 ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}

export function Layout({ user, isDark, onToggleDark, onSignOut, isDemoMode, children }) {
  return (
    <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark">
      <Sidebar
        user={user}
        isDark={isDark}
        onToggleDark={onToggleDark}
        onSignOut={onSignOut}
        isDemoMode={isDemoMode}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <MobileNav
          user={user}
          isDark={isDark}
          onToggleDark={onToggleDark}
          onSignOut={onSignOut}
        />

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-5xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
