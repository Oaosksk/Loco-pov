import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const LS_CACHE = 'loco_expenses_cache'

export function useExpenses({ userId, isDemoMode } = {}) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ─── Fetch expenses ───
  const fetchExpenses = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    if (isDemoMode) {
      const cached = localStorage.getItem(LS_CACHE)
      if (cached) {
        setExpenses(JSON.parse(cached))
      } else {
        const today = new Date().toISOString().split('T')[0]
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        const demo = [
          { id: 'd1', description: 'Petrol', amount: 159, category: 'transport', date: today, created_at: new Date().toISOString() },
          { id: 'd2', description: 'Coffee', amount: 80, category: 'food', date: today, created_at: new Date().toISOString() },
          { id: 'd3', description: 'Lunch', amount: 250, category: 'food', date: yesterday, created_at: new Date(Date.now() - 86400000).toISOString() },
          { id: 'd4', description: 'Bus ticket', amount: 45, category: 'transport', date: yesterday, created_at: new Date(Date.now() - 86400000).toISOString() },
          { id: 'd5', description: 'Groceries', amount: 820, category: 'food', date: new Date(Date.now() - 172800000).toISOString().split('T')[0], created_at: new Date(Date.now() - 172800000).toISOString() },
          { id: 'd6', description: 'Haircut', amount: 200, category: 'personal', date: new Date(Date.now() - 259200000).toISOString().split('T')[0], created_at: new Date(Date.now() - 259200000).toISOString() },
        ]
        setExpenses(demo)
        localStorage.setItem(LS_CACHE, JSON.stringify(demo))
      }
      setLoading(false)
      return
    }

    try {
      const { data, error: fetchErr } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false })
        .limit(500)

      if (fetchErr) throw fetchErr

      setExpenses(data || [])
      if (data) localStorage.setItem(LS_CACHE, JSON.stringify(data))
    } catch (err) {
      console.error('[Expenses] Fetch error:', err.message)
      const cached = localStorage.getItem(LS_CACHE)
      if (cached) setExpenses(JSON.parse(cached))
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId, isDemoMode])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  // ─── Add expense ───
  const addExpense = useCallback(async ({ description, amount, category, date }) => {
    const newExpense = {
      id: crypto.randomUUID(),
      description: description || 'Expense',
      amount: Number(amount) || 0,
      category: category || 'other',
      date: date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      user_id: userId,
    }

    const updated = [newExpense, ...expenses]
    setExpenses(updated)
    localStorage.setItem(LS_CACHE, JSON.stringify(updated))

    if (isDemoMode) return newExpense

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          user_id: userId,
          description: newExpense.description,
          amount: newExpense.amount,
          category: newExpense.category,
          date: newExpense.date,
        })
        .select()
        .single()

      if (error) throw error
      return data || newExpense
    } catch (err) {
      console.error('[Expenses] Add error:', err.message)
      return newExpense
    }
  }, [userId, isDemoMode, expenses])

  // ─── Delete expense ───
  const deleteExpense = useCallback(async (id) => {
    const updated = expenses.filter(e => e.id !== id)
    setExpenses(updated)
    localStorage.setItem(LS_CACHE, JSON.stringify(updated))

    if (isDemoMode) return

    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('[Expenses] Delete error:', err.message)
    }
  }, [expenses, isDemoMode])

  // ─── Computed totals ───
  const getMonthTotal = useCallback(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    return expenses
      .filter(e => {
        const d = new Date(e.date)
        return d.getFullYear() === year && d.getMonth() === month
      })
      .reduce((sum, e) => sum + (e.amount || 0), 0)
  }, [expenses])

  const getWeekTotal = useCallback(() => {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))
    weekStart.setHours(0, 0, 0, 0)
    
    return expenses
      .filter(e => new Date(e.date) >= weekStart)
      .reduce((sum, e) => sum + (e.amount || 0), 0)
  }, [expenses])

  const getCategoryBreakdown = useCallback(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const monthExpenses = expenses.filter(e => {
      const d = new Date(e.date)
      return d.getFullYear() === year && d.getMonth() === month
    })

    const breakdown = {}
    for (const exp of monthExpenses) {
      const cat = exp.category || 'other'
      breakdown[cat] = (breakdown[cat] || 0) + (exp.amount || 0)
    }

    return Object.entries(breakdown)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total)
  }, [expenses])

  return {
    expenses,
    loading,
    error,
    fetchExpenses,
    addExpense,
    deleteExpense,
    getMonthTotal,
    getWeekTotal,
    getCategoryBreakdown,
  }
}
