import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const LS_KEY = 'loco_monthly_budgets'

export function useMonthlyBudget({ userId, isDemoMode } = {}) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [budget, setBudget] = useState(0)
  const [loading, setLoading] = useState(true)

  const lsGet = () => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') } catch { return {} }
  }
  const lsKey = (y, m) => `${y}-${m}`

  const fetchBudget = useCallback(async (y, m) => {
    setLoading(true)
    if (isDemoMode) {
      const store = lsGet()
      setBudget(Number(store[lsKey(y, m)] || 0))
      setLoading(false)
      return
    }
    if (!userId) { setLoading(false); return }
    try {
      const { data } = await supabase
        .from('monthly_budgets')
        .select('budget')
        .eq('user_id', userId)
        .eq('year', y)
        .eq('month', m)
        .maybeSingle()
      setBudget(Number(data?.budget || 0))
    } catch (e) {
      console.error('[Budget] fetch:', e.message)
    } finally {
      setLoading(false)
    }
  }, [userId, isDemoMode])

  useEffect(() => { fetchBudget(year, month) }, [fetchBudget, year, month])

  const saveBudget = useCallback(async (amount, y = year, m = month) => {
    const val = Number(amount) || 0
    setBudget(val)
    if (isDemoMode) {
      const store = lsGet()
      store[lsKey(y, m)] = val
      localStorage.setItem(LS_KEY, JSON.stringify(store))
      return
    }
    if (!userId) return
    try {
      await supabase.from('monthly_budgets').upsert(
        { user_id: userId, year: y, month: m, budget: val },
        { onConflict: 'user_id,year,month' }
      )
    } catch (e) {
      console.error('[Budget] save:', e.message)
    }
  }, [userId, isDemoMode, year, month])

  return { budget, loading, year, month, setYear, setMonth, saveBudget }
}
