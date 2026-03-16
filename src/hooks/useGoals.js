import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const LS_KEY = 'loco_goals_cache'

const DEMO_GOALS = [
  {
    id: '1',
    title: 'Run 5K without stopping',
    progress: 3.2,
    target: 5,
    unit: 'km',
    due: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    status: 'active',
    created_at: new Date().toISOString(),
    user_id: 'demo',
  },
  {
    id: '2',
    title: 'Read 12 books this year',
    progress: 4,
    target: 12,
    unit: 'books',
    due: new Date('2026-12-31').toISOString().split('T')[0],
    status: 'active',
    created_at: new Date().toISOString(),
    user_id: 'demo',
  },
  {
    id: '3',
    title: 'Launch Loco MVP',
    progress: 100,
    target: 100,
    unit: '%',
    due: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    status: 'done',
    created_at: new Date().toISOString(),
    user_id: 'demo',
  },
]

export function useGoals({ userId, isDemoMode }) {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchGoals = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)

    if (isDemoMode) {
      const cached = localStorage.getItem(LS_KEY)
      setGoals(cached ? JSON.parse(cached) : DEMO_GOALS)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setGoals(data)
      localStorage.setItem(LS_KEY, JSON.stringify(data))
    } catch (err) {
      console.error('[Goals] Fetch error:', err.message)
      const cached = localStorage.getItem(LS_KEY)
      if (cached) setGoals(JSON.parse(cached))
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId, isDemoMode])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  // Schedule due-date notifications
  useEffect(() => {
    if (!('Notification' in window) || goals.length === 0) return

    const scheduleReminders = async () => {
      if (Notification.permission === 'default') {
        await Notification.requestPermission()
      }

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]

      goals.forEach((g) => {
        if (g.due === tomorrowStr && g.status === 'active') {
          new Notification('⏰ Goal Due Tomorrow — Loco', {
            body: `"${g.title}" is due tomorrow! You're at ${g.progress}/${g.target} ${g.unit}.`,
            icon: '/icons/icon-192.png',
          })
        }
      })
    }

    scheduleReminders()
  }, [goals])

  const addGoal = async ({ title, target, unit, due }) => {
    const newGoal = {
      id: crypto.randomUUID(),
      title,
      progress: 0,
      target: Number(target),
      unit: unit || '%',
      due: due || null,
      status: 'active',
      created_at: new Date().toISOString(),
      user_id: userId,
    }

    if (isDemoMode) {
      const updated = [newGoal, ...goals]
      setGoals(updated)
      localStorage.setItem(LS_KEY, JSON.stringify(updated))
      return newGoal
    }

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert({ title, target: Number(target), unit: unit || '%', due: due || null, user_id: userId })
        .select()
        .single()

      if (error) throw error

      const updated = [data, ...goals]
      setGoals(updated)
      localStorage.setItem(LS_KEY, JSON.stringify(updated))
      return data
    } catch (err) {
      console.error('[Goals] Add error:', err.message)
      throw err
    }
  }

  const updateGoalProgress = async (id, progress) => {
    const goal = goals.find((g) => g.id === id)
    if (!goal) return

    const newStatus =
      Number(progress) >= Number(goal.target) ? 'done' : goal.status === 'done' ? 'active' : goal.status

    const changes = {
      progress: Number(progress),
      status: newStatus,
    }

    const updated = goals.map((g) => (g.id === id ? { ...g, ...changes } : g))
    setGoals(updated)
    localStorage.setItem(LS_KEY, JSON.stringify(updated))

    if (isDemoMode) return

    try {
      const { error } = await supabase.from('goals').update(changes).eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('[Goals] Update progress error:', err.message)
      throw err
    }
  }

  const updateGoalStatus = async (id, status) => {
    const updated = goals.map((g) => (g.id === id ? { ...g, status } : g))
    setGoals(updated)
    localStorage.setItem(LS_KEY, JSON.stringify(updated))

    if (isDemoMode) return

    try {
      const { error } = await supabase.from('goals').update({ status }).eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('[Goals] Status error:', err.message)
      throw err
    }
  }

  const deleteGoal = async (id) => {
    const updated = goals.filter((g) => g.id !== id)
    setGoals(updated)
    localStorage.setItem(LS_KEY, JSON.stringify(updated))

    if (isDemoMode) return

    try {
      const { error } = await supabase.from('goals').delete().eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('[Goals] Delete error:', err.message)
      throw err
    }
  }

  return { goals, loading, error, fetchGoals, addGoal, updateGoalProgress, updateGoalStatus, deleteGoal }
}
