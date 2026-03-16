import React, { useMemo } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useNotes } from './hooks/useNotes'
import { useGoals } from './hooks/useGoals'
import { useDarkMode } from './hooks/useDarkMode'
import { AuthScreen } from './components/AuthScreen'
import { Layout } from './components/Layout'
import { Notes } from './pages/Notes'
import { Goals } from './pages/Goals'
import { Drive } from './pages/Drive'
import { AI } from './pages/AI'

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-white text-xl font-bold font-serif">L</span>
        </div>
        <p className="text-muted-light dark:text-muted-dark text-sm font-medium">Loading Loco…</p>
      </div>
    </div>
  )
}

function AppInner({ user, session, isDemoMode, onSignOut }) {
  const { isDark, toggle: toggleDark } = useDarkMode()
  const { notes } = useNotes({ userId: user?.id, isDemoMode })
  const { goals } = useGoals({ userId: user?.id, isDemoMode })

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
          <Route path="/" element={<Navigate to="/notes" replace />} />
          <Route path="/notes" element={<Notes userId={user?.id} isDemoMode={isDemoMode} />} />
          <Route path="/goals" element={<Goals userId={user?.id} isDemoMode={isDemoMode} />} />
          <Route path="/drive" element={<Drive session={session} />} />
          <Route path="/ai" element={<AI user={user} notes={notes} goals={goals} />} />
          <Route path="*" element={<Navigate to="/notes" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default function App() {
  const { user, session, loading, isDemoMode, signInWithGoogle, signOut, enterDemoMode } = useAuth()
  const { isDark } = useDarkMode()

  if (loading) return <LoadingScreen />

  if (!user) {
    return (
      <AuthScreen
        onSignIn={signInWithGoogle}
        onDemoMode={enterDemoMode}
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
    />
  )
}
