import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const LS_CACHE = 'loco_subscriptions_cache'

export function useSubscriptions({ userId, isDemoMode } = {}) {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSubscriptions = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    if (isDemoMode) {
      const cached = localStorage.getItem(LS_CACHE)
      if (cached) {
        setSubscriptions(JSON.parse(cached))
      } else {
        const demo = [
          { id: 's1', name: 'Netflix', amount: 649, cycle: 'monthly', next_due: '2026-04-15', remind_days_before: 3, created_at: new Date().toISOString() },
          { id: 's2', name: 'Spotify', amount: 119, cycle: 'monthly', next_due: '2026-04-01', remind_days_before: 2, created_at: new Date().toISOString() },
          { id: 's3', name: 'iCloud Storage', amount: 75, cycle: 'monthly', next_due: '2026-04-10', remind_days_before: 1, created_at: new Date().toISOString() },
          { id: 's4', name: 'YouTube Premium', amount: 149, cycle: 'monthly', next_due: '2026-04-20', remind_days_before: 3, created_at: new Date().toISOString() },
        ]
        setSubscriptions(demo)
        localStorage.setItem(LS_CACHE, JSON.stringify(demo))
      }
      setLoading(false)
      return
    }

    try {
      const { data, error: fetchErr } = await supabase
        .from('subscriptions')
        .select('*')
        .order('next_due', { ascending: true })

      if (fetchErr) throw fetchErr

      setSubscriptions(data || [])
      localStorage.setItem(LS_CACHE, JSON.stringify(data || []))
    } catch (err) {
      console.error('[Subscriptions] Fetch error:', err.message)
      const cached = localStorage.getItem(LS_CACHE)
      if (cached) setSubscriptions(JSON.parse(cached))
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId, isDemoMode])

  useEffect(() => {
    fetchSubscriptions()
  }, [fetchSubscriptions])

  const addSubscription = useCallback(async ({ name, amount, cycle, next_due, remind_days_before }) => {
    const newSub = {
      id: crypto.randomUUID(),
      name: name || 'Subscription',
      amount: Number(amount) || 0,
      cycle: cycle || 'monthly',
      next_due: next_due || calculateNextDue(cycle || 'monthly'),
      remind_days_before: remind_days_before ?? 3,
      created_at: new Date().toISOString(),
      user_id: userId,
    }

    const updated = [newSub, ...subscriptions]
    setSubscriptions(updated)
    localStorage.setItem(LS_CACHE, JSON.stringify(updated))

    if (isDemoMode) return newSub

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          name: newSub.name,
          amount: newSub.amount,
          cycle: newSub.cycle,
          next_due: newSub.next_due,
          remind_days_before: newSub.remind_days_before,
        })
        .select()
        .single()

      if (error) throw error
      return data || newSub
    } catch (err) {
      console.error('[Subscriptions] Add error:', err.message)
      return newSub
    }
  }, [userId, isDemoMode, subscriptions])

  const deleteSubscription = useCallback(async (id) => {
    const updated = subscriptions.filter(s => s.id !== id)
    setSubscriptions(updated)
    localStorage.setItem(LS_CACHE, JSON.stringify(updated))

    if (isDemoMode) return

    try {
      const { error } = await supabase.from('subscriptions').delete().eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('[Subscriptions] Delete error:', err.message)
    }
  }, [subscriptions, isDemoMode])

  const updateSubscription = useCallback(async (id, changes) => {
    const updated = subscriptions.map(s => s.id === id ? { ...s, ...changes } : s)
    setSubscriptions(updated)
    localStorage.setItem(LS_CACHE, JSON.stringify(updated))

    if (isDemoMode) return

    try {
      const { error } = await supabase.from('subscriptions').update(changes).eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('[Subscriptions] Update error:', err.message)
    }
  }, [subscriptions, isDemoMode])

  // Computed
  const getMonthlyTotal = useCallback(() => {
    return subscriptions.reduce((sum, s) => {
      switch (s.cycle) {
        case 'weekly': return sum + (s.amount * 4.33)
        case 'monthly': return sum + s.amount
        case 'quarterly': return sum + (s.amount / 3)
        case 'yearly': return sum + (s.amount / 12)
        default: return sum + s.amount
      }
    }, 0)
  }, [subscriptions])

  const getDaysUntilRenewal = useCallback((nextDue) => {
    if (!nextDue) return null
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const due = new Date(nextDue)
    due.setHours(0, 0, 0, 0)
    return Math.ceil((due - now) / 86400000)
  }, [])

  return {
    subscriptions,
    loading,
    error,
    fetchSubscriptions,
    addSubscription,
    deleteSubscription,
    updateSubscription,
    getMonthlyTotal,
    getDaysUntilRenewal,
  }
}

function calculateNextDue(cycle) {
  const now = new Date()
  switch (cycle) {
    case 'weekly':
      now.setDate(now.getDate() + 7)
      break
    case 'monthly':
      now.setMonth(now.getMonth() + 1)
      break
    case 'quarterly':
      now.setMonth(now.getMonth() + 3)
      break
    case 'yearly':
      now.setFullYear(now.getFullYear() + 1)
      break
    default:
      now.setMonth(now.getMonth() + 1)
  }
  return now.toISOString().split('T')[0]
}
