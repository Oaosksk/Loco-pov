import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const LS_CACHE = 'loco_health_cache'

export function useHealth({ userId, isDemoMode } = {}) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLogs = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    if (isDemoMode) {
      const cached = localStorage.getItem(LS_CACHE)
      if (cached) {
        setLogs(JSON.parse(cached))
      } else {
        const today = new Date().toISOString().split('T')[0]
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        const dayBefore = new Date(Date.now() - 172800000).toISOString().split('T')[0]
        const demo = [
          { id: 'h1', metric: 'workout', value: 45, unit: 'min', note: 'Gym - chest day', date: today, created_at: new Date().toISOString() },
          { id: 'h2', metric: 'water', value: 3, unit: 'L', note: 'Water intake', date: today, created_at: new Date().toISOString() },
          { id: 'h3', metric: 'sleep', value: 7.5, unit: 'hr', note: 'Slept well', date: today, created_at: new Date().toISOString() },
          { id: 'h4', metric: 'workout', value: 30, unit: 'min', note: 'Morning run', date: yesterday, created_at: new Date(Date.now() - 86400000).toISOString() },
          { id: 'h5', metric: 'weight', value: 72.5, unit: 'kg', note: 'Weighed in', date: yesterday, created_at: new Date(Date.now() - 86400000).toISOString() },
          { id: 'h6', metric: 'mood', value: 8, unit: '/10', note: 'Feeling great', date: yesterday, created_at: new Date(Date.now() - 86400000).toISOString() },
          { id: 'h7', metric: 'workout', value: 60, unit: 'min', note: 'Yoga class', date: dayBefore, created_at: new Date(Date.now() - 172800000).toISOString() },
          { id: 'h8', metric: 'steps', value: 8500, unit: 'steps', note: 'Walking', date: dayBefore, created_at: new Date(Date.now() - 172800000).toISOString() },
        ]
        setLogs(demo)
        localStorage.setItem(LS_CACHE, JSON.stringify(demo))
      }
      setLoading(false)
      return
    }

    try {
      const { data, error: fetchErr } = await supabase
        .from('health_logs')
        .select('*')
        .order('date', { ascending: false })
        .limit(200)

      if (fetchErr) throw fetchErr

      setLogs(data || [])
      if (data) localStorage.setItem(LS_CACHE, JSON.stringify(data))
    } catch (err) {
      console.error('[Health] Fetch error:', err.message)
      const cached = localStorage.getItem(LS_CACHE)
      if (cached) setLogs(JSON.parse(cached))
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId, isDemoMode])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const addLog = useCallback(async ({ metric, value, unit, note, date }) => {
    const newLog = {
      id: crypto.randomUUID(),
      metric: metric || 'custom',
      value: value ? Number(value) : null,
      unit: unit || '',
      note: note || '',
      date: date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      user_id: userId,
    }

    const updated = [newLog, ...logs]
    setLogs(updated)
    localStorage.setItem(LS_CACHE, JSON.stringify(updated))

    if (isDemoMode) return newLog

    try {
      const { data, error } = await supabase
        .from('health_logs')
        .insert({
          user_id: userId,
          metric: newLog.metric,
          value: newLog.value,
          unit: newLog.unit,
          note: newLog.note,
          date: newLog.date,
        })
        .select()
        .single()

      if (error) throw error
      return data || newLog
    } catch (err) {
      console.error('[Health] Add error:', err.message)
      return newLog
    }
  }, [userId, isDemoMode, logs])

  const deleteLog = useCallback(async (id) => {
    const updated = logs.filter(l => l.id !== id)
    setLogs(updated)
    localStorage.setItem(LS_CACHE, JSON.stringify(updated))

    if (isDemoMode) return

    try {
      const { error } = await supabase.from('health_logs').delete().eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('[Health] Delete error:', err.message)
    }
  }, [logs, isDemoMode])

  // Computed: streak per metric
  const getStreak = useCallback((metric) => {
    const metricLogs = logs
      .filter(l => l.metric === metric)
      .map(l => l.date)
      .filter((v, i, a) => a.indexOf(v) === i) // unique dates
      .sort((a, b) => b.localeCompare(a)) // newest first

    if (metricLogs.length === 0) return 0

    let streak = 0
    let expectedDate = new Date()
    expectedDate.setHours(0, 0, 0, 0)

    for (const dateStr of metricLogs) {
      const date = new Date(dateStr + 'T00:00:00')
      const diff = Math.round((expectedDate - date) / 86400000)
      if (diff <= 1) {
        streak++
        expectedDate = new Date(date)
        expectedDate.setDate(expectedDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }, [logs])

  // Grouped by date
  const groupedLogs = (() => {
    const groups = {}
    for (const log of logs) {
      if (!groups[log.date]) groups[log.date] = []
      groups[log.date].push(log)
    }
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map(date => ({ date, logs: groups[date] }))
  })()

  // Weekly trend for a metric
  const getWeeklyTrend = useCallback((metric) => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const dayLogs = logs.filter(l => l.metric === metric && l.date === dateStr)
      const total = dayLogs.reduce((sum, l) => sum + (l.value || 0), 0)
      days.push({
        date: dateStr,
        label: d.toLocaleDateString('en-GB', { weekday: 'short' }),
        value: total,
      })
    }
    return days
  }, [logs])

  return {
    logs,
    groupedLogs,
    loading,
    error,
    fetchLogs,
    addLog,
    deleteLog,
    getStreak,
    getWeeklyTrend,
  }
}
