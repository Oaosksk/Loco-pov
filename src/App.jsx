import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useDarkMode } from './hooks/useDarkMode'
import { AuthScreen } from './components/AuthScreen'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Notes } from './pages/Notes'
import { Goals } from './pages/Goals'
import { Expenses } from './pages/Expenses'
import { Health } from './pages/Health'
import { AI } from './pages/AI'
import { Settings } from './pages/Settings'

// ── Loading screen ────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{ minHeight: '100svh', background: '#0D1117', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2rem', fontWeight: 700, color: '#E6EDF3', display: 'block', marginBottom: '0.5rem' }}>
          Loco
        </span>
        <p style={{ color: '#8B949E', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Loading…
        </p>
      </div>
    </div>
  )
}

// ── Main app with layout ─────────────────────────────
function AppInner({ user, isDemoMode, onSignOut, isDark, toggleDark }) {
  return (
    <BrowserRouter>
      <Layout
        user={user}
        isDark={isDark}
        onToggleDark={toggleDark}
        onSignOut={onSignOut}
        isDemoMode={isDemoMode}
      >
        <Routes>
          <Route path="/"          element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notes"     element={<Notes userId={user?.id} isDemoMode={isDemoMode} />} />
          <Route path="/goals"     element={<Goals userId={user?.id} isDemoMode={isDemoMode} />} />
          <Route path="/expenses"  element={<Expenses />} />
          <Route path="/health"    element={<Health />} />
          <Route path="/ai"        element={<AI user={user} notes={[]} goals={[]} />} />
          <Route path="/settings"  element={<Settings />} />
          <Route path="*"          element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

// ── App root — useDarkMode lives HERE so it applies everywhere ──
export default function App() {
  // dark mode MUST be at root so AuthScreen & LoadingScreen get dark bg too
  const { isDark, toggle: toggleDark } = useDarkMode()
  const { user, session, loading, isDemoMode, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut } = useAuth()

  if (loading) return <LoadingScreen />

  if (!user) {
    return (
      <AuthScreen
        onSignIn={signInWithGoogle}
        onEmailSignIn={signInWithEmail}
        onEmailSignUp={signUpWithEmail}
        loading={false}
      />
    )
  }

  return (
    <AppInner
      user={user}
      session={session}
      isDemoMode={isDemoMode}
      onSignOut={signOut}
      isDark={isDark}
      toggleDark={toggleDark}
    />
  )
}
