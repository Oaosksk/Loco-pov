import React, { useState, useMemo } from 'react'
import { useExpenses } from '../hooks/useExpenses'
import { useReminders } from '../hooks/useReminders'
import { useWeeklyGoals } from '../hooks/useWeeklyGoals'
import { Button } from '../components/ui/Button'
import { Sheet } from '../components/ui/Sheet'
import { Plus, Trash2, Bell, Download, Calendar } from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

function ExpenseCard({ total }) {
  const level = total < 500 ? 'Low' : total < 1500 ? 'Moderate' : 'High'
  const color = level === 'Low' ? 'text-green-600' : level === 'Moderate' ? 'text-yellow-600' : 'text-red-600'
  const bg = level === 'Low' ? 'bg-green-100 dark:bg-green-900/30' : level === 'Moderate' ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-red-100 dark:bg-red-900/30'

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-muted-light dark:text-muted-dark mb-3">Monthly Expenses</h3>
      <div className="text-3xl font-bold font-serif text-text-light dark:text-text-dark mb-2">
        ${total.toFixed(2)}
      </div>
      <span className={`tag ${bg} ${color} text-xs font-semibold`}>{level}</span>
    </div>
  )
}

function ReminderCard({ reminders, onAdd, onToggle, onDelete, view, setView }) {
  const [showAdd, setShowAdd] = useState(false)
  const today = new Date().toISOString().split('T')[0]
  
  const filtered = useMemo(() => {
    const now = new Date()
    if (view === 'day') {
      return reminders.filter(r => r.datetime?.startsWith(today))
    } else if (view === 'week') {
      const weekEnd = new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0]
      return reminders.filter(r => r.datetime >= today && r.datetime <= weekEnd)
    }
    return reminders.filter(r => {
      const month = now.getMonth()
      const year = now.getFullYear()
      const d = new Date(r.datetime)
      return d.getMonth() === month && d.getFullYear() === year
    })
  }, [reminders, view, today])

  const important = filtered.filter(r => r.important && !r.done)

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-muted-light dark:text-muted-dark">Reminders</h3>
        <Button variant="ghost" size="sm" onClick={() => setShowAdd(true)}>
          <Plus size={14} />
        </Button>
      </div>
      <div className="flex gap-2 mb-3">
        {['day', 'week', 'month'].map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
              view === v ? 'bg-primary text-white' : 'bg-surface-light dark:bg-surface-dark text-muted-light dark:text-muted-dark'
            }`}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="text-2xl font-bold font-serif text-text-light dark:text-text-dark mb-1">
        {filtered.length}
      </div>
      <p className="text-xs text-muted-light dark:text-muted-dark">
        {important.length} important
      </p>
      <AddReminderSheet open={showAdd} onClose={() => setShowAdd(false)} onAdd={onAdd} />
    </div>
  )
}

function AddReminderSheet({ open, onClose, onAdd }) {
  const [title, setTitle] = useState('')
  const [datetime, setDatetime] = useState('')
  const [note, setNote] = useState('')
  const [important, setImportant] = useState(false)

  const reset = () => { setTitle(''); setDatetime(''); setNote(''); setImportant(false) }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !datetime) return
    onAdd({ title: title.trim(), datetime, note, important })
    reset()
    onClose()
  }

  return (
    <Sheet open={open} onClose={() => { reset(); onClose() }} title="New Reminder">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-1">Title *</label>
          <input autoFocus required value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-1">Date & Time *</label>
          <input required type="datetime-local" value={datetime} onChange={(e) => setDatetime(e.target.value)} className="input" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-1">Note</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} className="input" rows={3} />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={important} onChange={(e) => setImportant(e.target.checked)} className="w-4 h-4" />
          <span className="text-sm text-text-light dark:text-text-dark">Mark as important</span>
        </label>
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={() => { reset(); onClose() }} className="flex-1 justify-center">Cancel</Button>
          <Button variant="primary" type="submit" className="flex-1 justify-center">Create</Button>
        </div>
      </form>
    </Sheet>
  )
}

function WeeklyGoalsTable({ weeklyGoals, weekDates, onUpdate, onDelete, onExport }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  
  const dayTotals = useMemo(() => {
    return weekDates.map(date => {
      const total = weeklyGoals.reduce((sum, g) => sum + (g.progress[date] || 0), 0)
      const max = weeklyGoals.length * 100
      return max > 0 ? Math.round((total / max) * 100) : 0
    })
  }, [weeklyGoals, weekDates])

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold font-serif text-text-light dark:text-text-dark">Weekly Goals</h3>
        <Button variant="ghost" size="sm" onClick={onExport}>
          <Download size={14} />
          Export
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-light dark:border-border-dark">
              <th className="text-left py-2 px-3 font-semibold text-text-light dark:text-text-dark">Goals</th>
              {days.map((day, i) => (
                <th key={i} className="text-center py-2 px-2 font-semibold text-text-light dark:text-text-dark">{day}</th>
              ))}
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {weeklyGoals.map(goal => (
              <tr key={goal.id} className="border-b border-border-light dark:border-border-dark">
                <td className="py-2 px-3 text-text-light dark:text-text-dark">{goal.title}</td>
                {weekDates.map((date, i) => (
                  <td key={i} className="py-2 px-2 text-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={goal.progress[date] || 0}
                      onChange={(e) => onUpdate(goal.id, date, e.target.value)}
                      className="w-14 text-center input py-1 text-xs"
                    />
                  </td>
                ))}
                <td className="py-2 px-2">
                  <button onClick={() => onDelete(goal.id)} className="btn-icon text-red-500">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border-light dark:border-border-dark font-bold">
              <td className="py-2 px-3 text-text-light dark:text-text-dark">Daily %</td>
              {dayTotals.map((pct, i) => (
                <td key={i} className="py-2 px-2 text-center text-primary">{pct}%</td>
              ))}
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

function ReminderList({ reminders, onToggle, onDelete }) {
  const today = new Date().toISOString().split('T')[0]
  const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  const weekReminders = reminders.filter(r => r.datetime >= today && r.datetime <= weekEnd)
  const important = weekReminders.filter(r => r.important && !r.done)

  return (
    <div className="card p-5">
      <h3 className="text-lg font-bold font-serif text-text-light dark:text-text-dark mb-4">Week Reminders</h3>
      <div className="space-y-3">
        {important.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">⭐ Important</h4>
            {important.map(r => (
              <ReminderItem key={r.id} reminder={r} onToggle={onToggle} onDelete={onDelete} />
            ))}
          </div>
        )}
        <div>
          <h4 className="text-xs font-semibold text-muted-light dark:text-muted-dark mb-2">All Reminders</h4>
          {weekReminders.length === 0 ? (
            <p className="text-sm text-muted-light dark:text-muted-dark">No reminders this week</p>
          ) : (
            weekReminders.map(r => <ReminderItem key={r.id} reminder={r} onToggle={onToggle} onDelete={onDelete} />)
          )}
        </div>
      </div>
    </div>
  )
}

function ReminderItem({ reminder, onToggle, onDelete }) {
  const dt = new Date(reminder.datetime)
  const formatted = dt.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg bg-surface-light dark:bg-surface-dark mb-2 ${reminder.done ? 'opacity-50' : ''}`}>
      <input
        type="checkbox"
        checked={reminder.done}
        onChange={() => onToggle(reminder.id)}
        className="mt-1 w-4 h-4"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-semibold text-text-light dark:text-text-dark ${reminder.done ? 'line-through' : ''}`}>
            {reminder.title}
          </p>
          {reminder.important && !reminder.done && <span className="text-red-500">⭐</span>}
        </div>
        <p className="text-xs text-muted-light dark:text-muted-dark">{formatted}</p>
        {reminder.note && <p className="text-xs text-muted-light dark:text-muted-dark mt-1">{reminder.note}</p>}
      </div>
      <button onClick={() => onDelete(reminder.id)} className="btn-icon text-red-500">
        <Trash2 size={14} />
      </button>
    </div>
  )
}

function AddGoalSheet({ open, onClose, onAdd }) {
  const [title, setTitle] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    onAdd(title.trim())
    setTitle('')
    onClose()
  }

  return (
    <Sheet open={open} onClose={() => { setTitle(''); onClose() }} title="New Weekly Goal">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-1">Goal Title *</label>
          <input autoFocus required value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="e.g., Exercise, Study, Work on project" />
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={() => { setTitle(''); onClose() }} className="flex-1 justify-center">Cancel</Button>
          <Button variant="primary" type="submit" className="flex-1 justify-center">Create</Button>
        </div>
      </form>
    </Sheet>
  )
}

export function Dashboard() {
  const { getMonthTotal } = useExpenses()
  const { reminders, addReminder, toggleDone, deleteReminder } = useReminders()
  const { weeklyGoals, addWeeklyGoal, updateProgress, deleteWeeklyGoal, getWeekDates } = useWeeklyGoals()
  const [reminderView, setReminderView] = useState('day')
  const [showGoals, setShowGoals] = useState(true)
  const [showAddGoal, setShowAddGoal] = useState(false)

  const weekDates = getWeekDates()
  const monthTotal = getMonthTotal()

  const exportData = (format) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const data = weeklyGoals.map(g => {
      const row = { Goal: g.title }
      weekDates.forEach((date, i) => {
        row[days[i]] = `${g.progress[date] || 0}%`
      })
      return row
    })

    const dayTotals = { Goal: 'Daily %' }
    weekDates.forEach((date, i) => {
      const total = weeklyGoals.reduce((sum, g) => sum + (g.progress[date] || 0), 0)
      const max = weeklyGoals.length * 100
      dayTotals[days[i]] = max > 0 ? `${Math.round((total / max) * 100)}%` : '0%'
    })
    data.push(dayTotals)

    if (format === 'excel') {
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Weekly Goals')
      XLSX.writeFile(wb, `weekly-goals-${new Date().toISOString().split('T')[0]}.xlsx`)
    } else {
      const doc = new jsPDF()
      doc.text('Weekly Goals Report', 14, 15)
      doc.autoTable({
        head: [['Goal', ...days]],
        body: data.map(row => [row.Goal, ...days.map(d => row[d])]),
        startY: 25,
      })
      doc.save(`weekly-goals-${new Date().toISOString().split('T')[0]}.pdf`)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-serif text-text-light dark:text-text-dark">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ExpenseCard total={monthTotal} />
        <ReminderCard 
          reminders={reminders} 
          onAdd={addReminder} 
          onToggle={toggleDone} 
          onDelete={deleteReminder}
          view={reminderView}
          setView={setReminderView}
        />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-primary" />
            <span className="text-sm font-semibold text-text-light dark:text-text-dark">
              {showGoals ? 'Weekly Schedule' : 'Reminders'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {showGoals && (
              <Button variant="ghost" size="sm" onClick={() => setShowAddGoal(true)}>
                <Plus size={14} />
                Add Goal
              </Button>
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-muted-light dark:text-muted-dark">Show Reminders</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={!showGoals}
                  onChange={() => setShowGoals(!showGoals)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-light dark:bg-surface-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </div>
            </label>
          </div>
        </div>

        {showGoals ? (
          <WeeklyGoalsTable 
            weeklyGoals={weeklyGoals} 
            weekDates={weekDates} 
            onUpdate={updateProgress} 
            onDelete={deleteWeeklyGoal}
            onExport={() => {
              const choice = confirm('Export as Excel? (Cancel for PDF)')
              exportData(choice ? 'excel' : 'pdf')
            }}
          />
        ) : (
          <ReminderList reminders={reminders} onToggle={toggleDone} onDelete={deleteReminder} />
        )}
      </div>

      <AddGoalSheet open={showAddGoal} onClose={() => setShowAddGoal(false)} onAdd={addWeeklyGoal} />
    </div>
  )
}
