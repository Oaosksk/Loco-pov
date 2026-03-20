import React, { useState, useMemo } from 'react'
import { useHealth } from '../hooks/useHealth'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Sheet } from '../components/ui/Sheet'
import { Plus, Trash2, Flame, TrendingUp, Activity, Heart, Droplets, Moon, Footprints, Brain, Scale } from 'lucide-react'

const METRIC_CONFIG = {
  workout: { icon: Activity, color: 'text-green-400', bg: 'bg-green-500/20', emoji: '🏋️' },
  weight: { icon: Scale, color: 'text-blue-400', bg: 'bg-blue-500/20', emoji: '⚖️' },
  sleep: { icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-500/20', emoji: '🌙' },
  steps: { icon: Footprints, color: 'text-orange-400', bg: 'bg-orange-500/20', emoji: '👣' },
  water: { icon: Droplets, color: 'text-cyan-400', bg: 'bg-cyan-500/20', emoji: '💧' },
  mood: { icon: Brain, color: 'text-pink-400', bg: 'bg-pink-500/20', emoji: '😊' },
  custom: { icon: Heart, color: 'text-red-400', bg: 'bg-red-500/20', emoji: '❤️' },
}

function formatDayHeader(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  if (dateStr === today) return '📅 Today'
  if (dateStr === yesterday) return '📅 Yesterday'
  return `📅 ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
}

function StreakCard({ metric, streak }) {
  const config = METRIC_CONFIG[metric] || METRIC_CONFIG.custom
  return (
    <div className="card p-3 text-center">
      <span className="text-2xl block mb-1">{config.emoji}</span>
      <p className={`text-xl font-bold font-serif ${config.color}`}>{streak}</p>
      <p className="text-[10px] text-muted-light dark:text-muted-dark font-semibold capitalize">{metric}</p>
      <p className="text-[10px] text-muted-light dark:text-muted-dark">day streak</p>
    </div>
  )
}

function MiniChart({ data, color = 'bg-primary' }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data.map(d => d.value), 1)
  
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full rounded-t ${color} transition-all duration-500 min-h-[2px]`}
            style={{ height: `${Math.max((d.value / max) * 100, 4)}%` }}
          />
          <span className="text-[8px] text-muted-light dark:text-muted-dark">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

function AddHealthSheet({ open, onClose, onAdd }) {
  const [metric, setMetric] = useState('workout')
  const [value, setValue] = useState('')
  const [unit, setUnit] = useState('min')
  const [note, setNote] = useState('')

  const reset = () => { setMetric('workout'); setValue(''); setUnit('min'); setNote('') }

  const handleSubmit = (e) => {
    e.preventDefault()
    onAdd({ metric, value: value ? Number(value) : null, unit, note, date: new Date().toISOString().split('T')[0] })
    reset()
    onClose()
  }

  return (
    <Sheet open={open} onClose={() => { reset(); onClose() }} title="Log Health">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-2">Metric</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(METRIC_CONFIG).map(([key, config]) => (
              <button
                key={key}
                type="button"
                onClick={() => setMetric(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                  metric === key
                    ? `${config.bg} ${config.color} ring-2 ring-current/30`
                    : 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark'
                }`}
              >
                {config.emoji} {key}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-1">Value</label>
            <input type="number" step="0.1" value={value} onChange={e => setValue(e.target.value)} className="input" placeholder="45" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-1">Unit</label>
            <input value={unit} onChange={e => setUnit(e.target.value)} className="input" placeholder="min, kg, hr..." />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-1">Note</label>
          <input value={note} onChange={e => setNote(e.target.value)} className="input" placeholder="Details..." />
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={() => { reset(); onClose() }} className="flex-1 justify-center">Cancel</Button>
          <Button variant="primary" type="submit" className="flex-1 justify-center">Log</Button>
        </div>
      </form>
    </Sheet>
  )
}

export function Health() {
  const { user, isDemoMode } = useAuth()
  const { groupedLogs, logs, loading, addLog, deleteLog, getStreak, getWeeklyTrend } = useHealth({ userId: user?.id, isDemoMode })
  const [showAdd, setShowAdd] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState('workout')

  // Get streaks for common metrics
  const streaks = useMemo(() => {
    const metrics = ['workout', 'water', 'sleep', 'steps']
    return metrics.map(m => ({ metric: m, streak: getStreak(m) }))
  }, [getStreak, logs])

  const weeklyTrend = useMemo(() => getWeeklyTrend(selectedMetric), [selectedMetric, getWeeklyTrend])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-text-light dark:text-text-dark">Health</h1>
          <p className="text-sm text-muted-light dark:text-muted-dark mt-0.5">
            {logs.length} log{logs.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} />
          Log
        </Button>
      </div>

      {/* Streak cards */}
      <div className="grid grid-cols-4 gap-2">
        {streaks.map(({ metric, streak }) => (
          <StreakCard key={metric} metric={metric} streak={streak} />
        ))}
      </div>

      {/* Weekly trend chart */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" />
            <h3 className="text-sm font-semibold text-text-light dark:text-text-dark">Weekly Trend</h3>
          </div>
          <select
            value={selectedMetric}
            onChange={e => setSelectedMetric(e.target.value)}
            className="text-xs input w-auto py-1 px-2"
          >
            {Object.keys(METRIC_CONFIG).map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <MiniChart
          data={weeklyTrend}
          color={METRIC_CONFIG[selectedMetric]?.bg?.replace('/20', '') || 'bg-primary'}
        />
      </div>

      {/* Daily logs */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-5 w-32 bg-border-light dark:bg-border-dark rounded animate-pulse" />
              <div className="h-16 bg-border-light dark:bg-border-dark rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      ) : groupedLogs.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl mb-4 block">❤️</span>
          <p className="text-muted-light dark:text-muted-dark font-medium">No health logs yet.</p>
          <p className="text-xs text-muted-light dark:text-muted-dark mt-1">
            Log with <code className="text-primary">gym 45min @h</code> or tap the + button
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {groupedLogs.map(group => (
            <div key={group.date}>
              <h3 className="text-sm font-bold font-serif text-text-light dark:text-text-dark mb-2">
                {formatDayHeader(group.date)}
              </h3>
              <div className="space-y-2">
                {group.logs.map(log => {
                  const config = METRIC_CONFIG[log.metric] || METRIC_CONFIG.custom
                  const Icon = config.icon
                  return (
                    <div
                      key={log.id}
                      className="card p-3 flex items-center gap-3 group"
                    >
                      <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={18} className={config.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-text-light dark:text-text-dark capitalize">{log.metric}</span>
                          {log.value != null && (
                            <span className={`text-sm font-bold ${config.color}`}>
                              {log.value}{log.unit}
                            </span>
                          )}
                        </div>
                        {log.note && (
                          <p className="text-xs text-muted-light dark:text-muted-dark mt-0.5 truncate">{log.note}</p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteLog(log.id)}
                        className="btn-icon opacity-0 group-hover:opacity-100 text-red-500 flex-shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <AddHealthSheet open={showAdd} onClose={() => setShowAdd(false)} onAdd={addLog} />
    </div>
  )
}
