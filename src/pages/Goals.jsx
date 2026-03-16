import React, { useState, useMemo } from 'react'
import { useGoals } from '../hooks/useGoals'
import { SearchBar } from '../components/ui/SearchBar'
import { Button } from '../components/ui/Button'
import { Sheet } from '../components/ui/Sheet'
import {
  Plus, Trash2, Pause, Play, Sparkles,
  TrendingUp, CheckCircle2, Clock
} from 'lucide-react'

function formatDate(str) {
  if (!str) return '—'
  const d = new Date(str)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function isOverdue(dueStr) {
  if (!dueStr) return false
  return new Date(dueStr) < new Date()
}

function GoalCard({ goal, onUpdateProgress, onStatus, onDelete, apiKey }) {
  const [inputVal, setInputVal] = useState(String(goal.progress))
  const [saving, setSaving] = useState(false)
  const [suggesting, setSuggesting] = useState(false)
  const [steps, setSteps] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const pct = Math.min(100, Math.round((goal.progress / goal.target) * 100))
  const isDone = goal.status === 'done'
  const overdue = isOverdue(goal.due) && !isDone

  const handleUpdate = async () => {
    setSaving(true)
    try {
      await onUpdateProgress(goal.id, inputVal)
    } finally {
      setSaving(false)
    }
  }

  const handleSuggest = async () => {
    if (!apiKey) {
      setSteps('⚠️ Set a Groq API key in the AI tab first.')
      return
    }
    setSuggesting(true)
    setSteps('')
    try {
      const { suggestGoalSteps } = await import('../lib/groq')
      const result = await suggestGoalSteps({ apiKey, goal })
      setSteps(result)
    } catch (err) {
      setSteps(`Error: ${err.message}`)
    } finally {
      setSuggesting(false)
    }
  }

  return (
    <div className={`card p-5 flex flex-col gap-4 group ${isDone ? 'opacity-80' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-bold font-serif text-text-light dark:text-text-dark ${isDone ? 'line-through' : ''}`}>
              {goal.title}
            </h3>
            {isDone && <span className="text-lg">🎉</span>}
            {overdue && (
              <span className="tag bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                Overdue
              </span>
            )}
          </div>
          <p className="text-xs text-muted-light dark:text-muted-dark mt-0.5">
            Due: {formatDate(goal.due)} · {goal.unit}
          </p>
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={handleSuggest}
            className="btn-icon"
            title="AI Next Steps"
            disabled={suggesting}
          >
            <Sparkles size={15} className={suggesting ? 'animate-pulse text-accent' : ''} />
          </button>
          <button
            onClick={() => onStatus(goal.id, goal.status === 'paused' ? 'active' : 'paused')}
            className="btn-icon"
            title={goal.status === 'paused' ? 'Resume' : 'Pause'}
            disabled={isDone}
          >
            {goal.status === 'paused' ? <Play size={15} /> : <Pause size={15} />}
          </button>
          <button
            onClick={() => confirmDelete ? onDelete(goal.id) : setConfirmDelete(true)}
            className={`btn-icon ${confirmDelete ? 'text-red-500' : ''}`}
            title={confirmDelete ? 'Click again to confirm' : 'Delete'}
            onBlur={() => setConfirmDelete(false)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold text-muted-light dark:text-muted-dark">
          <span>{goal.progress} / {goal.target} {goal.unit}</span>
          <span>{pct}%</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Update row */}
      {!isDone && (
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            max={goal.target}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="input w-24 text-center"
          />
          <Button
            variant="primary"
            onClick={handleUpdate}
            disabled={saving}
            className="flex-1 justify-center text-xs py-2"
          >
            {saving ? 'Saving…' : 'Update'}
          </Button>
        </div>
      )}

      {/* AI Steps */}
      {(suggesting || steps) && (
        <div className="rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 p-3 text-xs text-text-light dark:text-text-dark leading-relaxed whitespace-pre-line">
          {suggesting ? (
            <span className="text-muted-light dark:text-muted-dark animate-pulse">Thinking of next steps…</span>
          ) : steps}
        </div>
      )}
    </div>
  )
}

function AddGoalSheet({ open, onClose, onAdd }) {
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState('')
  const [unit, setUnit] = useState('%')
  const [due, setDue] = useState('')
  const [saving, setSaving] = useState(false)

  const reset = () => { setTitle(''); setTarget(''); setUnit('%'); setDue('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !target) return
    setSaving(true)
    try {
      await onAdd({ title: title.trim(), target, unit, due })
      reset()
      onClose()
    } catch {
      /* errors handled in hook */
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onClose={() => { reset(); onClose() }} title="New Goal">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-1">
            Goal Title *
          </label>
          <input
            autoFocus
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you want to achieve?"
            className="input"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-1">
              Target *
            </label>
            <input
              required
              type="number"
              min="1"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. 100"
              className="input"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-1">
              Unit
            </label>
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="%, km, books…"
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-1">
            Due Date
          </label>
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="input"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={() => { reset(); onClose() }} className="flex-1 justify-center">
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={saving || !title.trim() || !target} className="flex-1 justify-center">
            {saving ? 'Saving…' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Sheet>
  )
}

export function Goals({ userId, isDemoMode }) {
  const { goals, loading, addGoal, updateGoalProgress, updateGoalStatus, deleteGoal } = useGoals({ userId, isDemoMode })
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const apiKey = localStorage.getItem('loco_groq_key') || ''

  const filtered = useMemo(() => {
    let list = goals
    if (filterStatus !== 'all') list = list.filter((g) => g.status === filterStatus)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((g) => g.title.toLowerCase().includes(q))
    }
    return list
  }, [goals, search, filterStatus])

  // Stats
  const total = goals.length
  const completed = goals.filter((g) => g.status === 'done').length
  const avgPct =
    total === 0
      ? 0
      : Math.round(goals.reduce((sum, g) => sum + (g.progress / g.target) * 100, 0) / total)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-text-light dark:text-text-dark">Goals</h1>
          <p className="text-sm text-muted-light dark:text-muted-dark mt-0.5">
            {total} goal{total !== 1 ? 's' : ''} tracked
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} />
          New Goal
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: TrendingUp, value: total, label: 'Total', color: 'text-primary' },
          { icon: CheckCircle2, value: completed, label: 'Completed', color: 'text-green-600' },
          { icon: Clock, value: `${avgPct}%`, label: 'Avg Progress', color: 'text-accent' },
        ].map(({ icon: Icon, value, label, color }) => (
          <div key={label} className="card p-4 text-center">
            <Icon size={20} className={`${color} mx-auto mb-1`} />
            <p className={`text-xl font-bold font-serif ${color}`}>{value}</p>
            <p className="text-xs text-muted-light dark:text-muted-dark font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Search + status filter */}
      <div className="space-y-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search goals…" />
        <div className="flex gap-2">
          {['all', 'active', 'done', 'paused'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all duration-200 ${
                filterStatus === s
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:border-primary hover:text-primary'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Goals list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-border-light dark:bg-border-dark rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl mb-4 block">🎯</span>
          <p className="text-muted-light dark:text-muted-dark font-medium">
            {search ? 'No goals match your search.' : 'No goals yet. Set your first!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onUpdateProgress={updateGoalProgress}
              onStatus={updateGoalStatus}
              onDelete={deleteGoal}
              apiKey={apiKey}
            />
          ))}
        </div>
      )}

      <AddGoalSheet open={showAdd} onClose={() => setShowAdd(false)} onAdd={addGoal} />
    </div>
  )
}
