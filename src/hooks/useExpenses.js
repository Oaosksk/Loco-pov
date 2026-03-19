import { useState, useEffect, useCallback } from 'react'

const LS_KEY = 'loco_expenses'

function load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || [] } catch { return [] }
}
function save(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data))
}

export function useExpenses() {
  const [expenses, setExpenses] = useState(load)

  const persist = useCallback((data) => {
    setExpenses(data)
    save(data)
  }, [])

  const addExpense = useCallback((fields) => {
    const item = {
      id: crypto.randomUUID(),
      amount: Number(fields.amount),
      category: fields.category || 'Other',
      description: fields.description || '',
      date: fields.date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    }
    persist([item, ...expenses])
    return item
  }, [expenses, persist])

  const deleteExpense = useCallback((id) => {
    persist(expenses.filter(e => e.id !== id))
  }, [expenses, persist])

  const getMonthTotal = useCallback(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    return expenses
      .filter(e => {
        const d = new Date(e.date)
        return d.getFullYear() === year && d.getMonth() === month
      })
      .reduce((sum, e) => sum + e.amount, 0)
  }, [expenses])

  return { expenses, addExpense, deleteExpense, getMonthTotal }
}
