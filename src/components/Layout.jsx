import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  BookOpen, Target, HardDrive, Brain, Zap,
  Sun, Moon, LogOut, PanelLeft, X
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
                      bg-surface-dark shadow-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-6">
        <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
          <Zap size={16} className="text-primary" />
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

// Floating sidebar
function FloatingSidebar({ onClose, open }) {
  return (
    <aside className={`fixed top-1/2 left-4 -translate-y-1/2 z-50 w-56 flex flex-col
                      bg-surface-dark rounded-xl shadow-card-dark border border-border-dark
                      overflow-hidden transition-all duration-300
                      ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>

      {/* Nav only */}
      <nav className="px-2 py-3 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors
               ${isActive ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white hover:bg-white/10'}`
            }
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Cancel button */}
      <div className="px-2 pb-3 pt-1 border-t border-border-dark">
        <button
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                     text-sm font-semibold text-white/50 hover:text-white hover:bg-white/10 transition-colors">
          <X size={15} />
          Cancel
        </button>
      </div>
    </aside>
  )
}

// Top bar + bottom nav
function BottomNav({ user, isDark, onToggleDark, onSignOut, onToggleSidebar, sidebarOpen }) {
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

      {/* Bottom navigation — hidden when sidebar open */}
      <nav className={`fixed bottom-0 left-0 right-0 z-30 px-3 pb-3 pt-2
                      bg-surface-light dark:bg-surface-dark
                      border-t border-border-light dark:border-border-dark
                      transition-all duration-300
                      ${sidebarOpen ? 'opacity-0 translate-y-full pointer-events-none' : 'opacity-100 translate-y-0'}`}>
        <div className="flex items-center justify-between gap-1 max-w-lg mx-auto
                        bg-bg-light dark:bg-bg-dark rounded-2xl px-2 py-1.5">

          {/* Toggle sidebar icon */}
          <button
            onClick={onToggleSidebar}
            className="flex items-center justify-center w-10 h-10 rounded-xl transition-colors
                       text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark">
            <PanelLeft size={20} />
          </button>

          <div className="w-px h-6 bg-border-light dark:bg-border-dark" />

          {/* Nav items */}
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 h-10 rounded-xl text-sm font-semibold transition-all
                 ${isActive
                   ? 'bg-text-light dark:bg-text-dark text-surface-light dark:text-surface-dark'
                   : 'text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark'}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}

          <div className="w-px h-6 bg-border-light dark:bg-border-dark" />

          {/* Avatar */}
          <button onClick={onSignOut}
            className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-border-light dark:ring-border-dark">
            <Avatar user={user} />
          </button>

        </div>
      </nav>
    </>
  )
}

export function Layout({ user, isDark, onToggleDark, onSignOut, isDemoMode, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-bg-light dark:bg-bg-dark">
      <FloatingSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <BottomNav
        user={user}
        isDark={isDark}
        onToggleDark={onToggleDark}
        onSignOut={onSignOut}
        onToggleSidebar={() => setSidebarOpen(v => !v)}
        sidebarOpen={sidebarOpen}
      />
      <main className="flex-1 p-4 md:p-8 pb-28 max-w-5xl w-full mx-auto animate-fade-in">
        {children}
      </main>
    </div>
  )
}
