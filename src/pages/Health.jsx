import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useHealth } from '../hooks/useHealth'
import { Plus, X, Pencil, Check, ChevronDown } from 'lucide-react'

// ── Metric config ────────────────────────────────────────────────────────────
const METRICS = [
  { key: 'workout',  emoji: '🏋️', label: 'Workout',  unit: 'min',   defaultVal: 30  },
  { key: 'weight',   emoji: '⚖️', label: 'Weight',   unit: 'kg',    defaultVal: 70  },
  { key: 'sleep',    emoji: '🌙', label: 'Sleep',    unit: 'hrs',   defaultVal: 8   },
  { key: 'steps',    emoji: '👣', label: 'Steps',    unit: 'steps', defaultVal: 8000},
  { key: 'water',    emoji: '💧', label: 'Water',    unit: 'L',     defaultVal: 2   },
  { key: 'mood',     emoji: '😊', label: 'Mood',     unit: '/10',   defaultVal: 7   },
  { key: 'custom',   emoji: '✨', label: 'Custom',   unit: '',      defaultVal: 1   },
]

// ── Ring progress (conic-gradient) ──────────────────────────────────────────
const RING_CONFIGS = {
  steps: {
    main: '#2FAA7D',
    conic: (deg) => `conic-gradient(#35c994 0deg, #2faa7d ${deg}deg, #12201d ${deg}deg)`,
    maxDeg: 220,
  },
  sleep: {
    main: '#4F86C5',
    conic: (deg) => `conic-gradient(#5ea2ff 0deg, #4f86c5 ${deg}deg, #10191d ${deg}deg)`,
    maxDeg: 230,
  },
  water: {
    main: '#8470C3',
    conic: (deg) => `conic-gradient(#9d83ff 0deg, #8470c3 ${deg}deg, #101418 ${deg}deg)`,
    maxDeg: 210,
  },
}

function Ring({ type, value, max, size = 110, stroke = 11, label, sub }) {
  const cfg = RING_CONFIGS[type]
  const pct = Math.min(value / max, 1)
  const deg = pct * cfg.maxDeg

  return (
    <div className="hring-wrap" style={{ width: size, height: size }}>
      {/* Conic ring */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: cfg.conic(deg),
        transition: 'background 0.6s ease',
      }} />
      {/* Cut-out center */}
      <div className="hring-center" />
      <div className="hring-label">
        <span className="hring-value" style={{ color: cfg.main }}>{label}</span>
        <span className="hring-sub">{sub}</span>
      </div>
    </div>
  )
}

// ── Habit tracker ────────────────────────────────────────────────────────────
const DAYS = ['M','T','W','T','F','S','S']
const LS_HABITS = 'loco_habits_v1'

function loadHabits() {
  try { return JSON.parse(localStorage.getItem(LS_HABITS)) || [] } catch { return [] }
}
function saveHabits(h) { localStorage.setItem(LS_HABITS, JSON.stringify(h)) }

// habit shape: { id, name, scheduledDays: [0-6 booleans], checked: [0-6 booleans] }
function useHabits() {
  const [habits, setHabits] = useState(loadHabits)
  const update = (next) => { setHabits(next); saveHabits(next) }

  const addHabit = (name, scheduledDays) => {
    update([...habits, { id: crypto.randomUUID(), name, scheduledDays, checked: Array(7).fill(false) }])
  }
  const removeHabit = (id) => update(habits.filter(h => h.id !== id))
  const toggleCheck = (id, dayIdx) => {
    update(habits.map(h => h.id !== id ? h : {
      ...h, checked: h.checked.map((v, i) => i === dayIdx ? !v : v)
    }))
  }
  const toggleSchedule = (id, dayIdx) => {
    update(habits.map(h => h.id !== id ? h : {
      ...h, scheduledDays: h.scheduledDays.map((v, i) => i === dayIdx ? !v : v)
    }))
  }
  return { habits, addHabit, removeHabit, toggleCheck, toggleSchedule }
}

function AddHabitForm({ onAdd, onCancel }) {
  const [name, setName] = useState('')
  const [days, setDays] = useState(Array(7).fill(false))
  const toggle = i => setDays(d => d.map((v, j) => j === i ? !v : v))
  return (
    <div className="hhabit-addform">
      <input className="hinput" placeholder="Habit name (e.g. Exercise)" value={name}
        onChange={e => setName(e.target.value)} autoFocus />
      <div className="hhabit-addform-days">
        <span className="hhabit-addform-label">Schedule days:</span>
        <div className="hhabit-addform-daypills">
          {DAYS.map((d, i) => (
            <button key={i} type="button"
              className={`hhabit-daypill ${days[i] ? 'hhabit-daypill--on' : ''}`}
              onClick={() => toggle(i)}>{d}</button>
          ))}
        </div>
      </div>
      <div className="hlog-form-actions">
        <button className="hbtn-ghost" onClick={onCancel}>Cancel</button>
        <button className="hbtn-primary" onClick={() => { if (name.trim()) { onAdd(name.trim(), days); onCancel() } }}>
          <Check size={14}/> Add
        </button>
      </div>
    </div>
  )
}

function HabitRow({ habit, onToggle, onRemove }) {
  return (
    <div className="hhabit-row">
      <span className="hhabit-name">{habit.name}</span>
      <div className="hhabit-days">
        {DAYS.map((_, i) => {
          const scheduled = habit.scheduledDays[i]
          const checked   = habit.checked[i]
          return (
            <div key={i}
              className={`hhabit-cell ${
                !scheduled ? 'hhabit-cell--off' :
                checked    ? 'hhabit-cell--on'  : ''
              }`}
              onClick={() => scheduled && onToggle(habit.id, i)}
              style={{ cursor: scheduled ? 'pointer' : 'default' }}
            />
          )
        })}
      </div>
      <button className="hhabit-remove" onClick={() => onRemove(habit.id)} title="Remove habit">
        <X size={11}/>
      </button>
    </div>
  )
}

// ── Log form (inline floating) ───────────────────────────────────────────────
function LogForm({ metric, onSave, onCancel, initial }) {
  const m = METRICS.find(x => x.key === metric) || METRICS[6]
  const [value, setValue] = useState(initial?.value ?? m.defaultVal)
  const [unit, setUnit]   = useState(initial?.unit  ?? m.unit)
  const [note, setNote]   = useState(initial?.note  ?? '')
  const [customLabel, setCustomLabel] = useState(initial?.customLabel ?? '')

  return (
    <div className="hlog-form">
      <div className="hlog-form-header">
        <span>{m.emoji} {metric === 'custom' && customLabel ? customLabel : m.label}</span>
        <button className="hlog-form-close" onClick={onCancel}><X size={14}/></button>
      </div>
      {metric === 'custom' && (
        <input className="hinput" placeholder="Label (e.g. Meditation)" value={customLabel}
          onChange={e => setCustomLabel(e.target.value)} />
      )}
      <div className="hlog-form-row">
        <input className="hinput" type="number" step="0.1" value={value}
          onChange={e => setValue(e.target.value)} placeholder="Value" />
        <input className="hinput" value={unit}
          onChange={e => setUnit(e.target.value)} placeholder="Unit" style={{ width: 80 }} />
      </div>
      <input className="hinput" value={note} onChange={e => setNote(e.target.value)} placeholder="Note (optional)" />
      <div className="hlog-form-actions">
        <button className="hbtn-ghost" onClick={onCancel}>Cancel</button>
        <button className="hbtn-primary" onClick={() => onSave({
          value: Number(value), unit, note,
          customLabel: metric === 'custom' ? customLabel : undefined
        })}>
          <Check size={14}/> Save
        </button>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export function Health({ userId, isDemoMode }) {
  const { logs, loading, addLog, deleteLog, getStreak } = useHealth({ userId, isDemoMode })
  const { habits, addHabit, removeHabit, toggleCheck } = useHabits()

  const [menuOpen, setMenuOpen]         = useState(false)
  const [activeMetric, setActiveMetric] = useState(null)
  const [editingId, setEditingId]       = useState(null)
  const [showAddHabit, setShowAddHabit] = useState(false)
  const menuRef = useRef(null)

  // Close menu on outside click
  useEffect(() => {
    const handler = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const today = new Date().toISOString().split('T')[0]

  // Today's logs
  const todayLogs = useMemo(() => logs.filter(l => l.date === today), [logs, today])

  // Ring values from today's logs
  const stepsLog   = todayLogs.find(l => l.metric === 'steps')
  const sleepLog   = todayLogs.find(l => l.metric === 'sleep')
  const waterLog   = todayLogs.find(l => l.metric === 'water')

  const stepsVal = stepsLog?.value ?? 0
  const sleepVal = sleepLog?.value ?? 0
  const waterVal = waterLog?.value ?? 0

  // Streak for header
  const workoutStreak = getStreak('workout')

  const handleMetricSelect = (key) => {
    setMenuOpen(false)
    setActiveMetric(key)
    setEditingId(null)
  }

  const handleSave = async (data) => {
    if (editingId) {
      // delete old + re-add (simple update strategy)
      await deleteLog(editingId)
    }
    await addLog({
      metric: activeMetric,
      value: data.value,
      unit: data.unit,
      note: data.note,
      customLabel: data.customLabel,
      date: today,
    })
    setActiveMetric(null)
    setEditingId(null)
  }

  const handleEdit = (log) => {
    setEditingId(log.id)
    setActiveMetric(log.metric)
  }

  // Week number within current month (1–4)
  const weekNum = (() => {
    const now = new Date()
    return Math.ceil(now.getDate() / 7)
  })()

  return (
    <div className="hpage">
      {/* ── Header ── */}
      <div className="hheader">
        <div>
          <h1 className="hheader-title">Health</h1>
          <p className="hheader-sub">{workoutStreak}-day streak · Week {weekNum}</p>
        </div>
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button className="hbtn-log" onClick={() => setMenuOpen(v => !v)}>
            <Plus size={15}/> Log today
          </button>
          {menuOpen && (
            <div className="hlog-menu">
              {METRICS.map(m => (
                <button key={m.key} className="hlog-menu-item" onClick={() => handleMetricSelect(m.key)}>
                  <span>{m.emoji}</span> {m.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Inline log form ── */}
      {activeMetric && (
        <LogForm
          metric={activeMetric}
          initial={editingId ? logs.find(l => l.id === editingId) : null}
          onSave={handleSave}
          onCancel={() => { setActiveMetric(null); setEditingId(null) }}
        />
      )}

      {/* ── Progress rings ── */}
      <div className="hrings-grid">
        <div className="hring-card">
          <Ring type="steps" value={stepsVal} max={10000} size={110} stroke={11}
            label={stepsVal.toLocaleString()} sub="Steps today" />
        </div>
        <div className="hring-card">
          <Ring type="sleep" value={sleepVal} max={9} size={110} stroke={11}
            label={`${sleepVal} hrs`} sub="Sleep last night" />
        </div>
        <div className="hring-card">
          <Ring type="water" value={waterVal} max={3} size={110} stroke={11}
            label={`${waterVal} L`} sub="Water intake" />
        </div>
      </div>

      {/* ── Habit tracker ── */}
      <div className="hhabit-card">
        <div className="hhabit-card-header">
          <p className="hhabit-heading">HABIT TRACKER · THIS WEEK</p>
          <button className="hhabit-add-btn" onClick={() => setShowAddHabit(v => !v)} title="Add habit">
            <Plus size={13}/>
          </button>
        </div>

        {showAddHabit && (
          <AddHabitForm onAdd={addHabit} onCancel={() => setShowAddHabit(false)} />
        )}

        <div className="hhabit-days-header">
          <span className="hhabit-name-spacer" />
          {DAYS.map((d, i) => <span key={i} className="hhabit-day-label">{d}</span>)}
          <span className="hhabit-remove-spacer" />
        </div>

        {habits.length === 0 ? (
          <p className="hhabit-empty">No habits yet. Tap + to add one.</p>
        ) : (
          habits.map(h => (
            <HabitRow key={h.id} habit={h} onToggle={toggleCheck} onRemove={removeHabit} />
          ))
        )}
      </div>

      {/* ── Today's log entries (editable) ── */}
      {todayLogs.length > 0 && (
        <div className="hentries">
          <p className="hentries-heading">DAILY LOGS</p>
          {todayLogs.map(log => {
            const m = METRICS.find(x => x.key === log.metric) || METRICS[6]
            return (
              <div key={log.id} className="hentry">
                <span className="hentry-emoji">{m.emoji}</span>
                <div className="hentry-body">
                  <span className="hentry-metric">{log.customLabel || m.label}</span>
                  {log.value != null && (
                    <span className="hentry-value">{log.value} {log.unit}</span>
                  )}
                  {log.note && <span className="hentry-note">{log.note}</span>}
                </div>
                <button className="hentry-edit" onClick={() => handleEdit(log)} title="Edit">
                  <Pencil size={13}/>
                </button>
                <button className="hentry-del" onClick={() => deleteLog(log.id)} title="Delete">
                  <X size={13}/>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
