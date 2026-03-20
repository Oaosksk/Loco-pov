import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// --- Demo-mode sample data ---
const DEMO_USER = {
  id: 'demo',
  email: 'demo@loco.app',
  user_metadata: { full_name: 'Demo User', avatar_url: '' },
}

const REMEMBERED_ACCOUNTS_KEY = 'loco_remembered_accounts'
const LAST_USER_KEY = 'loco_last_user'

// Store remembered account
function rememberAccount(email, name, avatar) {
  try {
    const accounts = JSON.parse(localStorage.getItem(REMEMBERED_ACCOUNTS_KEY) || '[]')
    const existing = accounts.find(acc => acc.email === email)
    
    if (!existing) {
      accounts.unshift({ email, name, avatar, lastUsed: new Date().toISOString() })
      // Keep only last 5 accounts
      if (accounts.length > 5) accounts.pop()
      localStorage.setItem(REMEMBERED_ACCOUNTS_KEY, JSON.stringify(accounts))
    } else {
      // Update last used time and move to front
      existing.lastUsed = new Date().toISOString()
      existing.name = name
      existing.avatar = avatar
      const filtered = accounts.filter(acc => acc.email !== email)
      filtered.unshift(existing)
      localStorage.setItem(REMEMBERED_ACCOUNTS_KEY, JSON.stringify(filtered))
    }
  } catch (err) {
    console.error('[Auth] Remember account error:', err)
  }
}

// Get remembered accounts
export function getRememberedAccounts() {
  try {
    return JSON.parse(localStorage.getItem(REMEMBERED_ACCOUNTS_KEY) || '[]')
  } catch {
    return []
  }
}

// Remove remembered account
export function forgetAccount(email) {
  try {
    const accounts = JSON.parse(localStorage.getItem(REMEMBERED_ACCOUNTS_KEY) || '[]')
    const filtered = accounts.filter(acc => acc.email !== email)
    localStorage.setItem(REMEMBERED_ACCOUNTS_KEY, JSON.stringify(filtered))
  } catch (err) {
    console.error('[Auth] Forget account error:', err)
  }
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

    // Real Supabase auth with persistent session
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('[Auth] getSession error:', error.message)
        setLoading(false)
        return
      }
      
      const currentSession = data.session
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      
      // Remember this account
      if (currentSession?.user) {
        const email = currentSession.user.email
        const name = currentSession.user.user_metadata?.full_name || email
        const avatar = currentSession.user.user_metadata?.avatar_url || ''
        rememberAccount(email, name, avatar)
        localStorage.setItem(LAST_USER_KEY, email)
      }
      
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        // Remember this account on auth change
        if (session?.user) {
          const email = session.user.email
          const name = session.user.user_metadata?.full_name || email
          const avatar = session.user.user_metadata?.avatar_url || ''
          rememberAccount(email, name, avatar)
          localStorage.setItem(LAST_USER_KEY, email)
        }
        
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
          // Enable persistent session
          persistSession: true,
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
    // Don't clear remembered accounts on sign out
    const { error } = await supabase.auth.signOut()
    if (error) console.error('[Auth] Sign-out error:', error.message)
  }

  const enterDemoMode = () => {
    setUser(DEMO_USER)
    setIsDemoMode(true)
  }

  return { user, session, loading, isDemoMode, signInWithGoogle, signOut, enterDemoMode }
}
