import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// --- Demo-mode sample data ---
const DEMO_USER = {
  id: 'demo',
  email: 'demo@loco.app',
  user_metadata: { full_name: 'Demo User', avatar_url: '' },
}

export function useAuth() {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    // Check if running without real Supabase creds
    const url = import.meta.env.VITE_SUPABASE_URL
    const missingConfig = !url || url === 'your_supabase_project_url'

    if (missingConfig) {
      // Auto-enter demo mode
      setUser(DEMO_USER)
      setIsDemoMode(true)
      setLoading(false)
      return
    }

    // Real Supabase auth
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('[Auth] getSession error:', error.message)
        setLoading(false)
        return
      }
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/drive.readonly',
          redirectTo: window.location.href,
        },
      })
      if (error) throw error
    } catch (err) {
      console.error('[Auth] Sign-in error:', err.message)
      throw err
    }
  }

  const signOut = async () => {
    if (isDemoMode) {
      setUser(null)
      setIsDemoMode(false)
      return
    }
    const { error } = await supabase.auth.signOut()
    if (error) console.error('[Auth] Sign-out error:', error.message)
  }

  const enterDemoMode = () => {
    setUser(DEMO_USER)
    setIsDemoMode(true)
  }

  return { user, session, loading, isDemoMode, signInWithGoogle, signOut, enterDemoMode }
}
