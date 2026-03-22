import React, { useState, useMemo } from 'react'
import { useExpenses } from '../hooks/useExpenses'
import { useSubscriptions } from '../hooks/useSubscriptions'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Sheet } from '../components/ui/Sheet'
import {
  Plus, Trash2, Download, Filter, TrendingUp,
  CreditCard, RefreshCw, AlertCircle,
} from 'lucide-react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

const CATEGORY_COLORS = {
  transport:     'border-border-dark text-muted-dark',
  food:          'border-border-dark text-muted-dark',
  shopping:      'border-border-dark text-muted-dark',
  entertainment: 'border-border-dark text-muted-dark',
  health:        'border-border-dark text-muted-dark',
  bills:         'border-border-dark text-muted-dark',
  education:     'border-border-dark text-muted-dark',
  personal:      'border-border-dark text-muted-dark',
  other:         'border-border-dark text-muted-dark',
}

const CATEGORY_EMOJIS = {
  transport: '🚗',
  food: '🍕',
  shopping: '🛍️',
  entertainment: '🎬',
  health: '💊',
  bills: '📄',
  education: '📚',
  personal: '💇',
  other: '📦',
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function getWeekStart() {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now)
  monday.setDate(diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function getMonthStart() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

// ─── Add Expense Sheet ───
function AddExpenseSheet({ open, onClose, onAdd }) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('other')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const reset = () => {
    setDescription('')
    setAmount('')
    setCategory('other')
    setDate(new Date().toISOString().split('T')[0])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!description.trim() || !amount) return
    onAdd({ description: description.trim(), amount: Number(amount), category, date })
    reset()
    onClose()
  }

  return (
    <Sheet open={open} onClose={() => { reset(); onClose() }} title="Add Expense">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-1">Description *</label>
          <input autoFocus required value={description} onChange={e => setDescription(e.target.value)} className="input" placeholder="e.g., Petrol" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-1">Amount (₹) *</label>
            <input required type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="input" placeholder="0" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(CATEGORY_COLORS).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                  category === cat
                    ? 'bg-primary text-white ring-2 ring-primary/30'
                    : 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark'
                }`}
              >
                {CATEGORY_EMOJIS[cat]} {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={() => { reset(); onClose() }} className="flex-1 justify-center">Cancel</Button>
          <Button variant="primary" type="submit" disabled={!description.trim() || !amount} className="flex-1 justify-center">Add</Button>
        </div>
      </form>
    </Sheet>
  )
}

// ─── Add Subscription Sheet ───
function AddSubSheet({ open, onClose, onAdd }) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [cycle, setCycle] = useState('monthly')
  const [nextDue, setNextDue] = useState('')
  const [remindDays, setRemindDays] = useState('3')

  const reset = () => {
    setName(''); setAmount(''); setCycle('monthly'); setNextDue(''); setRemindDays('3')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !amount) return
    onAdd({
      name: name.trim(),
      amount: Number(amount),
      cycle,
      next_due: nextDue || undefined,
      remind_days_before: Number(remindDays),
    })
    reset()
    onClose()
  }

  return (
    <Sheet open={open} onClose={() => { reset(); onClose() }} title="Add Subscription">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-1">Name *</label>
          <input autoFocus required value={name} onChange={e => setName(e.target.value)} className="input" placeholder="e.g., Netflix" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-1">Amount (₹) *</label>
            <input required type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} className="input" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-1">Cycle</label>
            <select value={cycle} onChange={e => setCycle(e.target.value)} className="input">
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-1">Next Due</label>
            <input type="date" value={nextDue} onChange={e => setNextDue(e.target.value)} className="input" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-1">Remind Days Before</label>
            <input type="number" min="0" value={remindDays} onChange={e => setRemindDays(e.target.value)} className="input" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={() => { reset(); onClose() }} className="flex-1 justify-center">Cancel</Button>
          <Button variant="primary" type="submit" disabled={!name.trim() || !amount} className="flex-1 justify-center">Add</Button>
        </div>
      </form>
    </Sheet>
  )
}

export function Expenses() {
  const { user, isDemoMode } = useAuth()
  const { expenses, loading, addExpense, deleteExpense, getMonthTotal, getWeekTotal, getCategoryBreakdown } = useExpenses({ userId: user?.id, isDemoMode })
  const { subscriptions, addSubscription, deleteSubscription, getMonthlyTotal, getDaysUntilRenewal } = useSubscriptions({ userId: user?.id, isDemoMode })

  const [filter, setFilter] = useState('month')
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showAddSub, setShowAddSub] = useState(false)
  const [activeTab, setActiveTab] = useState('expenses') // 'expenses' | 'subscriptions'

  const monthTotal = getMonthTotal()
  const weekTotal = getWeekTotal()
  const categoryBreakdown = getCategoryBreakdown()
  const subMonthlyTotal = getMonthlyTotal()

  // Filter expenses
  const filtered = useMemo(() => {
    const now = new Date()
    const today = now.toISOString().split('T')[0]

    return expenses.filter(e => {
      if (filter === 'day') return e.date === today
      if (filter === 'week') return new Date(e.date) >= getWeekStart()
      if (filter === 'month') return new Date(e.date) >= getMonthStart()
      return true
    })
  }, [expenses, filter])

  const filteredTotal = filtered.reduce((sum, e) => sum + (e.amount || 0), 0)

  // Export functions
  const exportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('Loco — Expense Report', 14, 15)
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 14, 22)
    doc.text(`Total: ₹${filteredTotal.toLocaleString('en-IN')}`, 14, 28)

    doc.autoTable({
      head: [['Date', 'Description', 'Amount (₹)', 'Category']],
      body: filtered.map(e => [
        formatDate(e.date),
        e.description,
        `₹${e.amount?.toLocaleString('en-IN')}`,
        e.category,
      ]),
      startY: 35,
      theme: 'striped',
    })

    doc.save(`loco-expenses-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const exportExcel = () => {
    const data = filtered.map(e => ({
      Date: e.date,
      Description: e.description,
      'Amount (₹)': e.amount,
      Category: e.category,
    }))
    data.push({ Date: '', Description: 'TOTAL', 'Amount (₹)': filteredTotal, Category: '' })

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses')
    XLSX.writeFile(wb, `loco-expenses-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-text-light dark:text-text-dark">Expenses</h1>
          <p className="text-sm text-muted-light dark:text-muted-dark mt-0.5">
            {expenses.length} transaction{expenses.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative group">
            <Button variant="ghost" size="sm">
              <Download size={14} />
              Export
            </Button>
            <div className="absolute right-0 mt-1 w-36 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-lg overflow-hidden z-50 hidden group-hover:block">
              <button onClick={exportPDF} className="w-full px-4 py-2.5 text-sm text-left hover:bg-bg-light dark:hover:bg-bg-dark text-text-light dark:text-text-dark">📄 PDF</button>
              <button onClick={exportExcel} className="w-full px-4 py-2.5 text-sm text-left hover:bg-bg-light dark:hover:bg-bg-dark text-text-light dark:text-text-dark">📊 Excel</button>
            </div>
          </div>
          <Button variant="primary" onClick={() => activeTab === 'expenses' ? setShowAddExpense(true) : setShowAddSub(true)}>
            <Plus size={16} />
            Add
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <p className="text-xs text-muted-light dark:text-muted-dark font-semibold mb-1">This Week</p>
          <p className="text-lg font-bold font-serif text-text-light dark:text-text-dark">₹{weekTotal.toLocaleString('en-IN')}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-muted-light dark:text-muted-dark font-semibold mb-1">This Month</p>
          <p className="text-lg font-bold font-serif text-primary">₹{monthTotal.toLocaleString('en-IN')}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-muted-light dark:text-muted-dark font-semibold mb-1">Subscriptions</p>
          <p className="text-lg font-bold font-serif text-orange-400">₹{Math.round(subMonthlyTotal).toLocaleString('en-IN')}/mo</p>
        </div>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'expenses'
              ? 'bg-primary text-white'
              : 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark'
          }`}
        >
          💰 Expenses
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'subscriptions'
              ? 'bg-primary text-white'
              : 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark'
          }`}
        >
          🔄 Subscriptions ({subscriptions.length})
        </button>
      </div>

      {/* ─── Expenses Tab ─── */}
      {activeTab === 'expenses' && (
        <>
          {/* Filters */}
          <div className="flex gap-2">
            {['day', 'week', 'month', 'all'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                  filter === f
                    ? 'bg-primary text-white'
                    : 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:border-primary'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Category breakdown */}
          {categoryBreakdown.length > 0 && (
            <div className="card p-4">
              <h3 className="text-xs font-semibold text-muted-light dark:text-muted-dark mb-3">Category Breakdown (This Month)</h3>
              <div className="space-y-2">
                {categoryBreakdown.map(({ category, total }) => {
                  const pct = monthTotal > 0 ? Math.round((total / monthTotal) * 100) : 0
                  return (
                    <div key={category} className="flex items-center gap-3">
                      <span className="text-sm w-6">{CATEGORY_EMOJIS[category] || '📦'}</span>
                      <span className="text-xs font-semibold text-text-light dark:text-text-dark capitalize w-24">{category}</span>
                      <div className="flex-1 h-2 rounded-full bg-border-light dark:bg-border-dark overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-text-light dark:text-text-dark w-20 text-right">₹{total.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-muted-light dark:text-muted-dark w-10 text-right">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Expenses table */}
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 bg-border-light dark:bg-border-dark rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-5xl mb-4 block">💰</span>
              <p className="text-muted-light dark:text-muted-dark font-medium">No expenses for this period.</p>
              <p className="text-xs text-muted-light dark:text-muted-dark mt-1">
                Log expenses from Notes with <code className="text-primary">@e</code> or add manually.
              </p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-light dark:border-border-dark">
                      <th className="text-left py-3 px-4 font-semibold text-muted-light dark:text-muted-dark text-xs">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-light dark:text-muted-dark text-xs">Description</th>
                      <th className="text-right py-3 px-4 font-semibold text-muted-light dark:text-muted-dark text-xs">Amount (₹)</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-light dark:text-muted-dark text-xs">Category</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(exp => (
                      <tr key={exp.id} className="border-b border-border-light dark:border-border-dark hover:bg-bg-light dark:hover:bg-[#0a0a0a] transition-colors group">
                        <td className="py-3 px-4 text-xs text-muted-light dark:text-muted-dark">{formatDate(exp.date)}</td>
                        <td className="py-3 px-4 text-text-light dark:text-text-dark font-medium">{exp.description}</td>
                        <td className="py-3 px-4 text-right font-bold text-text-light dark:text-text-dark">₹{exp.amount?.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${CATEGORY_COLORS[exp.category] || CATEGORY_COLORS.other}`}>
                            {CATEGORY_EMOJIS[exp.category] || '📦'} {exp.category}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <button
                            onClick={() => deleteExpense(exp.id)}
                            className="btn-icon opacity-0 group-hover:opacity-100 text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border-light dark:border-border-dark">
                      <td className="py-3 px-4"></td>
                      <td className="py-3 px-4 font-bold text-text-light dark:text-text-dark">Total</td>
                      <td className="py-3 px-4 text-right font-bold text-primary text-lg">₹{filteredTotal.toLocaleString('en-IN')}</td>
                      <td colSpan="2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── Subscriptions Tab ─── */}
      {activeTab === 'subscriptions' && (
        <>
          {subscriptions.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-5xl mb-4 block">🔄</span>
              <p className="text-muted-light dark:text-muted-dark font-medium">No subscriptions tracked.</p>
              <p className="text-xs text-muted-light dark:text-muted-dark mt-1">
                Add from Notes with <code className="text-primary">netflix 649 @sub monthly</code>
              </p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-light dark:border-border-dark">
                      <th className="text-left py-3 px-4 font-semibold text-muted-light dark:text-muted-dark text-xs">Name</th>
                      <th className="text-right py-3 px-4 font-semibold text-muted-light dark:text-muted-dark text-xs">Amount (₹)</th>
                      <th className="text-center py-3 px-4 font-semibold text-muted-light dark:text-muted-dark text-xs">Cycle</th>
                      <th className="text-center py-3 px-4 font-semibold text-muted-light dark:text-muted-dark text-xs">Next Due</th>
                      <th className="text-center py-3 px-4 font-semibold text-muted-light dark:text-muted-dark text-xs">Days Left</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map(sub => {
                      const daysLeft = getDaysUntilRenewal(sub.next_due)
                      const isUrgent = daysLeft !== null && daysLeft <= (sub.remind_days_before || 3)
                      return (
                        <tr key={sub.id} className="border-b border-border-light dark:border-border-dark hover:bg-bg-light dark:hover:bg-[#0a0a0a] transition-colors group">
                          <td className="py-3 px-4 text-text-light dark:text-text-dark font-medium">{sub.name}</td>
                          <td className="py-3 px-4 text-right font-bold text-text-light dark:text-text-dark">₹{sub.amount?.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-400 capitalize">
                              {sub.cycle}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-xs text-muted-light dark:text-muted-dark">
                            {sub.next_due ? formatDate(sub.next_due) : '—'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {daysLeft !== null && (
                              <span className={`text-xs font-bold ${isUrgent ? 'text-red-500' : 'text-green-400'}`}>
                                {daysLeft <= 0 ? 'Due!' : `${daysLeft}d`}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            <button
                              onClick={() => deleteSubscription(sub.id)}
                              className="btn-icon opacity-0 group-hover:opacity-100 text-red-500"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border-light dark:border-border-dark">
                      <td className="py-3 px-4 font-bold text-text-light dark:text-text-dark">Monthly Total</td>
                      <td className="py-3 px-4 text-right font-bold text-orange-400 text-lg">₹{Math.round(subMonthlyTotal).toLocaleString('en-IN')}</td>
                      <td colSpan="4"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Sheets */}
      <AddExpenseSheet open={showAddExpense} onClose={() => setShowAddExpense(false)} onAdd={addExpense} />
      <AddSubSheet open={showAddSub} onClose={() => setShowAddSub(false)} onAdd={addSubscription} />
    </div>
  )
}
