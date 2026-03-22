import React, { useState, useMemo } from 'react'
import { useGoals } from '../hooks/useGoals'
import { SearchBar } from '../components/ui/SearchBar'
import { Button } from '../components/ui/Button'
import { Sheet } from '../components/ui/Sheet'
import {
  Plus, Trash2, Pause, Play, Sparkles,
  TrendingUp, CheckCircle2, Clock, ChevronDown, ChevronUp,
} from 'lucide-react'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(str) {
  if (!str) return null
  const d = new Date(str + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function isOverdue(dueStr, status) {
  if (!dueStr || status === 'completed') return false
  return new Date(dueStr + 'T00:00:00') < new Date()
}

function pctOf(progress, target) {
  if (!target || target === 0) return 0
  return Math.min(100, Math.round((progress / target) * 100))
}

// ─── Task row inside a goal card ─────────────────────────────────────────────

function TaskRow({ task, goalId, onToggle, disabled }) {
  const [busy, setBusy] = useState(false)

  const handleToggle = async () => {
    setBusy(true)
    await onToggle(task.id, goalId)
    setBusy(false)
  }

  return (
    <label
      className={`flex items-start gap-3 py-2 cursor-pointer group select-none ${
        disabled ? 'pointer-events-none' : ''
      }`}
    >
      {/* Custom checkbox */}
      <span
        onClick={handleToggle}
        className={`mt-0.5 w-[18px] h-[18px] flex-shrink-0 rounded border-2 flex items-center justify-center transition-all duration-150 ${
          task.done
            ? 'bg-primary border-primary'
            : 'border-border-light dark:border-[#444] group-hover:border-primary/60'
        } ${busy ? 'opacity-50' : ''}`}
      >
        {task.done && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>

      {/* Label */}
      <span
        className={`text-sm leading-snug flex-1 transition-all duration-150 ${
          task.done
            ? 'line-through text-muted-light dark:text-muted-dark'
            : 'text-text-light dark:text-text-dark'
        }`}
        onClick={handleToggle}
      >
        {task.title}
      </span>
    </label>
  )
}

// ─── Goal card ───────────────────────────────────────────────────────────────

function GoalCard({ goal, onToggleTask, onUpdateProgress, onStatus, onDelete, apiKey }) {
  const [saving, setSaving] = useState(false)
  const [inputVal, setInputVal] = useState(String(goal.progress))
  const [suggesting, setSuggesting] = useState(false)
  const [steps, setSteps] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [tasksExpanded, setTasksExpanded] = useState(true)

  const hasTasks = (goal.goal_tasks || []).length > 0
  const tasks = goal.goal_tasks || []
  const pct = pctOf(goal.progress, goal.target)
  const isCompleted = goal.status === 'completed'
  const overdue = isOverdue(goal.due, goal.status)

  const handleSuggest = async () => {
    if (!apiKey) { setSteps('⚠️ Set your Groq API key in Settings first.'); return }
    setSuggesting(true); setSteps('')
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

  const handleManualUpdate = async () => {
    setSaving(true)
    await onUpdateProgress(goal.id, inputVal)
    setSaving(false)
  }

  return (
    <div className={`card p-5 flex flex-col gap-4 group transition-opacity ${isCompleted ? 'opacity-75' : ''}`}>

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {isCompleted && <span className="text-lg">🎉</span>}
            <h3
              className={`font-bold font-serif text-text-light dark:text-text-dark leading-tight ${
                isCompleted ? 'line-through text-muted-light dark:text-muted-dark' : ''
              }`}
            >
              {goal.title}
            </h3>
            {overdue && (
              <span className="tag">
                Overdue
              </span>
            )}
            {goal.status === 'paused' && (
              <span className="tag">
                Paused
              </span>
            )}
          </div>
          {goal.due && (
            <p className="text-xs text-muted-light dark:text-muted-dark mt-0.5">
              Due {formatDate(goal.due)}
            </p>
          )}
        </div>

        {/* Action buttons — visible on hover */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={handleSuggest} className="btn-icon" title="AI Next Steps" disabled={suggesting}>
            <Sparkles size={14} className={suggesting ? 'animate-pulse text-primary' : ''} />
          </button>
          <button
            onClick={() => onStatus(goal.id, goal.status === 'paused' ? 'active' : 'paused')}
            className="btn-icon"
            title={goal.status === 'paused' ? 'Resume' : 'Pause'}
            disabled={isCompleted}
          >
            {goal.status === 'paused' ? <Play size={14} /> : <Pause size={14} />}
          </button>
          <button
            onClick={() => confirmDelete ? onDelete(goal.id) : setConfirmDelete(true)}
            onBlur={() => setConfirmDelete(false)}
            className={`btn-icon ${confirmDelete ? 'text-red-500' : ''}`}
            title={confirmDelete ? 'Click again to delete' : 'Delete'}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* ── Task checklist ──────────────────────────────── */}
      {hasTasks && (
        <div>
          {/* Collapsible header */}
          <button
            onClick={() => setTasksExpanded(v => !v)}
            className="flex items-center gap-1 text-xs font-semibold text-muted-light dark:text-muted-dark mb-1 hover:text-text-light dark:hover:text-text-dark transition-colors"
          >
            {tasksExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {tasks.filter(t => t.done).length} / {tasks.length} tasks
          </button>

          {tasksExpanded && (
            <div className="space-y-0 border-l-2 border-border-light dark:border-border-dark pl-3 ml-1">
              {tasks.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  goalId={goal.id}
                  onToggle={onToggleTask}
                  disabled={isCompleted}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Progress bar ────────────────────────────────── */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-light dark:text-muted-dark font-medium">
            {hasTasks
              ? `${goal.progress} / ${goal.target} tasks · ${pct}%`
              : `${goal.progress} / ${goal.target} ${goal.unit} · ${pct}%`}
          </span>
          {isCompleted && (
            <span className="text-[10px] font-medium text-muted-dark border border-border-dark rounded px-1.5 py-0.5" style={{ borderWidth: '0.5px' }}>
              ✓ Done
            </span>
          )}
        </div>
        <div className="progress-track">
          <div
            className="progress-fill transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* ── Manual progress update (only for non-task goals) ── */}
      {!hasTasks && !isCompleted && (
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            max={goal.target}
            step="any"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            className="input w-24 text-center"
          />
          <Button
            variant="primary"
            onClick={handleManualUpdate}
            disabled={saving}
            className="flex-1 justify-center text-xs py-2"
          >
            {saving ? 'Saving…' : 'Update'}
          </Button>
        </div>
      )}

      {/* ── AI next steps ───────────────────────────────── */}
      {(suggesting || steps) && (
        <div className="rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 p-3 text-xs text-text-light dark:text-text-dark leading-relaxed whitespace-pre-line">
          {suggesting
            ? <span className="text-muted-light dark:text-muted-dark animate-pulse">Thinking…</span>
            : steps}
        </div>
      )}
    </div>
  )
}

// ─── Add Goal sheet ──────────────────────────────────────────────────────────

function AddGoalSheet({ open, onClose, onAdd }) {
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState('')
  const [unit, setUnit] = useState('%')
  const [due, setDue] = useState('')
  const [taskMode, setTaskMode] = useState(false)
  const [taskLines, setTaskLines] = useState('')
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setTitle(''); setTarget(''); setUnit('%'); setDue('')
    setTaskMode(false); setTaskLines('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      if (taskMode && taskLines.trim()) {
        // Parse task lines: "1. Task one\n2. Task two" or "- Task one\n- Task two"
        const lines = taskLines
          .split(/\n/)
          .map(l => l.replace(/^\s*(\d+\.|-|\*)\s*/, '').trim())
          .filter(Boolean)

        const tasks = lines.map((t, i) => ({ title: t, done: false, sort_order: i + 1 }))
        await onAdd({ title: title.trim(), tasks, due })
      } else {
        if (!target) return
        await onAdd({ title: title.trim(), target: Number(target), unit, due, tasks: [] })
      }
      reset(); onClose()
    } catch { /* errors logged in hook */ } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onClose={() => { reset(); onClose() }} title="New Goal">
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-1">Goal Title *</label>
          <input
            autoFocus required
            value={title} onChange={e => setTitle(e.target.value)}
            placeholder="What do you want to achieve?"
            className="input"
          />
        </div>

        {/* Toggle between task mode and numeric target */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTaskMode(false)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              !taskMode ? 'bg-primary text-white' : 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark'
            }`}
          >
            📊 Numeric Target
          </button>
          <button
            type="button"
            onClick={() => setTaskMode(true)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              taskMode ? 'bg-primary text-white' : 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark'
            }`}
          >
            ✅ Task Checklist
          </button>
        </div>

        {taskMode ? (
          <div>
            <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-1">
              Tasks — one per line
            </label>
            <textarea
              rows={5}
              value={taskLines}
              onChange={e => setTaskLines(e.target.value)}
              placeholder={"1. Set up Supabase\n2. Build Notes page\n3. Deploy to Vercel"}
              className="input resize-none text-sm leading-relaxed"
            />
            <p className="text-[10px] text-muted-light dark:text-muted-dark mt-1">
              Prefix lines with "1." or "-" or just plain text — all work.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-1">Target *</label>
              <input
                required={!taskMode} type="number" min="1"
                value={target} onChange={e => setTarget(e.target.value)}
                placeholder="e.g. 100" className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-1">Unit</label>
              <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="%, km, books…" className="input" />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-1">Due Date</label>
          <input type="date" value={due} onChange={e => setDue(e.target.value)} className="input" />
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={() => { reset(); onClose() }} className="flex-1 justify-center">Cancel</Button>
          <Button
            variant="primary" type="submit"
            disabled={saving || !title.trim() || (!taskMode && !target) || (taskMode && !taskLines.trim())}
            className="flex-1 justify-center"
          >
            {saving ? 'Creating…' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Sheet>
  )
}

// ─── Main Goals page ─────────────────────────────────────────────────────────

export function Goals({ userId, isDemoMode }) {
  const {
    goals, loading, addGoal, createGoal,
    toggleTask, updateGoalProgress, updateGoalStatus, deleteGoal,
  } = useGoals({ userId, isDemoMode })

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const apiKey = localStorage.getItem('loco_groq_key') || ''

  const filtered = useMemo(() => {
    let list = goals
    if (filterStatus !== 'all') list = list.filter(g => g.status === filterStatus)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(g => g.title.toLowerCase().includes(q))
    }
    return list
  }, [goals, search, filterStatus])

  // Split into active/paused and completed for separate sections
  const activeGoals = filtered.filter(g => g.status !== 'completed')
  const completedGoals = filtered.filter(g => g.status === 'completed')

  // Stats
  const total = goals.length
  const completed = goals.filter(g => g.status === 'completed').length
  const avgPct = total === 0
    ? 0
    : Math.round(goals.reduce((sum, g) => sum + pctOf(g.progress, g.target), 0) / total)

  // Adapter: Add Goal form sends { title, tasks, target, unit, due }
  const handleAdd = ({ title, tasks = [], target, unit, due }) => {
    return createGoal({ title, tasks, target, unit, due })
  }

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-text-light dark:text-text-dark">Goals</h1>
          <p className="text-sm text-muted-light dark:text-muted-dark mt-0.5">
            {total} goal{total !== 1 ? 's' : ''} tracked
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} />
          New Goal
        </Button>
      </div>

      {/* ── Stats ───────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: TrendingUp,  value: total,      label: 'Total',     color: 'text-primary'     },
          { icon: CheckCircle2,value: completed,   label: 'Completed', color: 'text-green-400'   },
          { icon: Clock,       value: `${avgPct}%`,label: 'Avg Progress', color: 'text-cyan-400' },
        ].map(({ icon: Icon, value, label, color }) => (
          <div key={label} className="card p-4 text-center">
            <Icon size={18} className={`${color} mx-auto mb-1`} />
            <p className={`text-xl font-bold font-serif ${color}`}>{value}</p>
            <p className="text-[11px] text-muted-light dark:text-muted-dark font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Search + filter ───────────────────────────── */}
      <div className="space-y-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search goals…" />
        <div className="flex gap-2 flex-wrap">
          {['all', 'active', 'paused'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                filterStatus === s
                  ? 'bg-text-light dark:bg-text-dark text-bg-light dark:text-bg-dark'
                  : 'text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Goals list ─────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-44 bg-border-light dark:bg-border-dark rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-4xl mb-3 block">🎯</span>
          <p className="text-sm text-muted-light dark:text-muted-dark">
            {search ? 'No goals match your search.' : 'No goals yet — set your first!'}
          </p>
          <p className="text-xs text-muted-light dark:text-muted-dark mt-1">
            Try <code className="text-primary">1. Go to gym 2. Sleep early @g</code> in Notes
          </p>
        </div>
      ) : (
        <div className="space-y-8">

          {/* Active / Paused goals */}
          {activeGoals.length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeGoals.map(goal => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onToggleTask={toggleTask}
                    onUpdateProgress={updateGoalProgress}
                    onStatus={updateGoalStatus}
                    onDelete={deleteGoal}
                    apiKey={apiKey}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed goals — separate muted section */}
          {completedGoals.length > 0 && (filterStatus === 'all' || filterStatus === 'completed') && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border-light dark:bg-border-dark" />
                <span className="text-xs font-semibold text-muted-light dark:text-muted-dark">
                  ✅ Completed ({completedGoals.length})
                </span>
                <div className="h-px flex-1 bg-border-light dark:bg-border-dark" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {completedGoals.map(goal => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onToggleTask={toggleTask}
                    onUpdateProgress={updateGoalProgress}
                    onStatus={updateGoalStatus}
                    onDelete={deleteGoal}
                    apiKey={apiKey}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <AddGoalSheet open={showAdd} onClose={() => setShowAdd(false)} onAdd={handleAdd} />
    </div>
  )
}
