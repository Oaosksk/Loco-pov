import { useState, useCallback } from 'react'

const LS_KEY = 'loco_weekly_goals'

function load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || [] } catch { return [] }
}
function save(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data))
}

function getWeekDates() {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  
  const dates = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

export function useWeeklyGoals() {
  const [weeklyGoals, setWeeklyGoals] = useState(load)

  const persist = useCallback((data) => {
    setWeeklyGoals(data)
    save(data)
  }, [])

  const addWeeklyGoal = useCallback((title) => {
    const weekDates = getWeekDates()
    const item = {
      id: crypto.randomUUID(),
      title,
      progress: weekDates.reduce((acc, date) => ({ ...acc, [date]: 0 }), {}),
      created_at: new Date().toISOString(),
    }
    persist([...weeklyGoals, item])
    return item
  }, [weeklyGoals, persist])

  const updateProgress = useCallback((id, date, value) => {
    persist(weeklyGoals.map(g => 
      g.id === id ? { ...g, progress: { ...g.progress, [date]: Number(value) } } : g
    ))
  }, [weeklyGoals, persist])

  const deleteWeeklyGoal = useCallback((id) => {
    persist(weeklyGoals.filter(g => g.id !== id))
  }, [weeklyGoals, persist])

  return { weeklyGoals, addWeeklyGoal, updateProgress, deleteWeeklyGoal, getWeekDates }
}
