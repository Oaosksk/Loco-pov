import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const LS_KEY = 'loco_goals_cache'

// ─── Demo seed data (includes tasks) ───────────────────────────────────────
const DEMO_GOALS = [
  {
    id: 'g1',
    title: 'Go to PG',
    progress: 0,
    target: 2,
    unit: 'tasks',
    due: null,
    status: 'active',
    created_at: new Date().toISOString(),
    user_id: 'demo',
    goal_tasks: [
      { id: 't1', goal_id: 'g1', title: 'I need to go to PG', done: false, sort_order: 1 },
      { id: 't2', goal_id: 'g1', title: 'I need to complete Running', done: false, sort_order: 2 },
    ],
  },
  {
    id: 'g2',
    title: 'Read 12 books this year',
    progress: 4,
    target: 12,
    unit: 'books',
    due: new Date('2026-12-31').toISOString().split('T')[0],
    status: 'active',
    created_at: new Date().toISOString(),
    user_id: 'demo',
    goal_tasks: [],
  },
  {
    id: 'g3',
    title: 'Launch Loco MVP',
    progress: 3,
    target: 3,
    unit: 'tasks',
    due: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    status: 'completed',
    created_at: new Date().toISOString(),
    user_id: 'demo',
    goal_tasks: [
      { id: 't3', goal_id: 'g3', title: 'Set up Supabase', done: true, sort_order: 1 },
      { id: 't4', goal_id: 'g3', title: 'Build Notes page', done: true, sort_order: 2 },
      { id: 't5', goal_id: 'g3', title: 'Deploy to Vercel', done: true, sort_order: 3 },
    ],
  },
]

// ─── Progress helper ────────────────────────────────────────────────────────
function calcProgress(tasks) {
  if (!tasks || tasks.length === 0) return { progress: 0, target: 0 }
  const done = tasks.filter(t => t.done).length
  return { progress: done, target: tasks.length }
}

export function useGoals({ userId, isDemoMode }) {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ─── Fetch goals + their tasks ─────────────────────────────────────────
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
      // Try to fetch goals with joined tasks.
      // Falls back to goals-only if goal_tasks relationship isn't ready yet.
      let goalsData = []

      const { data: withTasks, error: withTasksErr } = await supabase
        .from('goals')
        .select('*, goal_tasks(*)')
        .order('created_at', { ascending: false })

      if (withTasksErr) {
        // Relationship may not exist yet — fall back to goals only
        console.warn('[Goals] goal_tasks join failed, falling back:', withTasksErr.message)
        const { data: goalsOnly, error: goalsErr } = await supabase
          .from('goals')
          .select('*')
          .order('created_at', { ascending: false })

        if (goalsErr) throw goalsErr
        goalsData = (goalsOnly || []).map(g => ({ ...g, goal_tasks: [] }))
      } else {
        goalsData = (withTasks || []).map(g => ({
          ...g,
          goal_tasks: (g.goal_tasks || []).sort((a, b) => a.sort_order - b.sort_order),
        }))
      }

      // Only overwrite cache when Supabase actually responds with data
      setGoals(goalsData)
      // localStorage.setItem(LS_KEY, JSON.stringify(goalsData))
    } catch (err) {
      console.error('[Goals] Fetch error:', err.message)
      // const cached = localStorage.getItem(LS_KEY)
      // if (cached) setGoals(JSON.parse(cached))
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId, isDemoMode])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  // Due-date browser notifications
  useEffect(() => {
    if (!('Notification' in window) || goals.length === 0) return
    const schedule = async () => {
      if (Notification.permission === 'default') await Notification.requestPermission()
      const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0]
      goals.forEach(g => {
        if (g.due === tomorrowStr && g.status === 'active') {
          new Notification('⏰ Goal Due Tomorrow — Loco', {
            body: `"${g.title}" is due tomorrow! ${g.progress}/${g.target} tasks done.`,
            icon: '/icons/icon-192.png',
          })
        }
      })
    }
    schedule()
  }, [goals])

  // ─── Create goal (with tasks from parseEntry) ──────────────────────────
  const createGoal = useCallback(async ({ title, tasks = [], target, unit, due } = {}) => {
    // Resolve target: prefer explicit, else task count, else default 100
    const resolvedTarget = target != null ? Number(target) : tasks.length > 0 ? tasks.length : 100
    const resolvedUnit = tasks.length > 0 ? 'tasks' : (unit || '%')

    const newGoal = {
      id: crypto.randomUUID(),
      title: title || 'New Goal',
      progress: 0,
      target: resolvedTarget,
      unit: resolvedUnit,
      due: due || null,
      status: 'active',
      created_at: new Date().toISOString(),
      user_id: userId,
      goal_tasks: tasks.map((t, i) => ({
        id: crypto.randomUUID(),
        goal_id: null, // filled after DB insert
        title: t.title,
        done: t.done || false,
        sort_order: t.sort_order ?? i + 1,
      })),
    }

    // Optimistic update
    const updated = [newGoal, ...goals]
    setGoals(updated)
    // localStorage.setItem(LS_KEY, JSON.stringify(updated))

    if (isDemoMode) return newGoal

    try {
      // 1. Insert the goal row
      const { data: goalData, error: goalErr } = await supabase
        .from('goals')
        .insert({
          user_id: userId,
          title: newGoal.title,
          progress: 0,
          target: resolvedTarget,
          unit: resolvedUnit,
          due: newGoal.due,
          status: 'active',
        })
        .select()
        .single()

      if (goalErr) throw goalErr

      const goalId = goalData.id

      // 2. Insert all tasks if any
      if (tasks.length > 0) {
        const taskRows = tasks.map((t, i) => ({
          goal_id: goalId,
          user_id: userId,
          title: t.title,
          done: false,
          sort_order: t.sort_order ?? i + 1,
        }))

        const { data: taskData, error: taskErr } = await supabase
          .from('goal_tasks')
          .insert(taskRows)
          .select()

        if (taskErr) throw taskErr

        const fullGoal = {
          ...goalData,
          goal_tasks: taskData.sort((a, b) => a.sort_order - b.sort_order),
        }

        // Replace the optimistic entry with server data
        setGoals(prev => {
          const list = [fullGoal, ...prev.filter(g => g.id !== newGoal.id)]
          // localStorage.setItem(LS_KEY, JSON.stringify(list))
          return list
        })

        return fullGoal
      }

      return { ...goalData, goal_tasks: [] }
    } catch (err) {
      console.error('[Goals] Create error:', err.message)
      throw err
    }
  }, [userId, isDemoMode, goals])

  // Keep addGoal as an alias for backward compatibility with the Add Goal form
  const addGoal = useCallback(({ title, target, unit, due }) => {
    return createGoal({ title, target, unit, due, tasks: [] })
  }, [createGoal])

  // ─── Toggle a single task's done state ────────────────────────────────
  const toggleTask = useCallback(async (taskId, goalId) => {
    // Find goal + task
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return

    const task = (goal.goal_tasks || []).find(t => t.id === taskId)
    if (!task) return

    const newDone = !task.done

    // Update task in local state
    const updatedTasks = goal.goal_tasks.map(t =>
      t.id === taskId ? { ...t, done: newDone } : t
    )

    // Recalculate progress
    const doneTasks = updatedTasks.filter(t => t.done).length
    const totalTasks = updatedTasks.length
    const newProgress = doneTasks     // progress = count of done tasks
    const newStatus = doneTasks === totalTasks && totalTasks > 0 ? 'completed' : 'active'

    const updatedGoal = {
      ...goal,
      goal_tasks: updatedTasks,
      progress: newProgress,
      status: newStatus,
    }

    const updatedGoals = goals.map(g => g.id === goalId ? updatedGoal : g)
    setGoals(updatedGoals)
    // localStorage.setItem(LS_KEY, JSON.stringify(updatedGoals))

    if (isDemoMode) return

    try {
      // Update the task row
      const { error: taskErr } = await supabase
        .from('goal_tasks')
        .update({ done: newDone })
        .eq('id', taskId)

      if (taskErr) throw taskErr

      // Update the goal's progress + status
      const { error: goalErr } = await supabase
        .from('goals')
        .update({ progress: newProgress, status: newStatus })
        .eq('id', goalId)

      if (goalErr) throw goalErr
    } catch (err) {
      console.error('[Goals] Toggle task error:', err.message)
      // Revert optimistic update on failure
      setGoals(goals)
      // localStorage.setItem(LS_KEY, JSON.stringify(goals))
    }
  }, [goals, isDemoMode])

  // ─── Manual progress update (for non-task goals) ──────────────────────
  const updateGoalProgress = useCallback(async (id, progress) => {
    const goal = goals.find(g => g.id === id)
    if (!goal) return

    const newProgress = Number(progress)
    const newStatus = newProgress >= Number(goal.target) ? 'completed' : goal.status === 'completed' ? 'active' : goal.status

    const changes = { progress: newProgress, status: newStatus }
    const updatedGoals = goals.map(g => g.id === id ? { ...g, ...changes } : g)
    setGoals(updatedGoals)
    // localStorage.setItem(LS_KEY, JSON.stringify(updatedGoals))

    if (isDemoMode) return

    try {
      const { error } = await supabase.from('goals').update(changes).eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('[Goals] Update progress error:', err.message)
    }
  }, [goals, isDemoMode])

  // ─── Update status ─────────────────────────────────────────────────────
  const updateGoalStatus = useCallback(async (id, status) => {
    const updatedGoals = goals.map(g => g.id === id ? { ...g, status } : g)
    setGoals(updatedGoals)
    // localStorage.setItem(LS_KEY, JSON.stringify(updatedGoals))

    if (isDemoMode) return

    try {
      const { error } = await supabase.from('goals').update({ status }).eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('[Goals] Status error:', err.message)
    }
  }, [goals, isDemoMode])

  // ─── Delete goal (cascade deletes tasks via FK) ────────────────────────
  const deleteGoal = useCallback(async (id) => {
    const updatedGoals = goals.filter(g => g.id !== id)
    setGoals(updatedGoals)
    // localStorage.setItem(LS_KEY, JSON.stringify(updatedGoals))

    if (isDemoMode) return

    try {
      // goal_tasks will cascade-delete due to ON DELETE CASCADE on goal_id FK
      const { error } = await supabase.from('goals').delete().eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('[Goals] Delete error:', err.message)
    }
  }, [goals, isDemoMode])

  return {
    goals,
    loading,
    error,
    fetchGoals,
    createGoal,    // new: used by Notes → @g route
    addGoal,       // alias: used by the Add Goal form
    toggleTask,    // new: used by GoalCard checkboxes
    updateGoalProgress,
    updateGoalStatus,
    deleteGoal,
  }
}
