import React, { useState, useMemo, useEffect } from 'react'
import { useReminders } from '../hooks/useReminders'
import { Button } from '../components/ui/Button'
import { Sheet } from '../components/ui/Sheet'
import { Plus, Trash2, Clock, Calendar, Volume2, X, MoreVertical, Bell, AlarmClock, Upload } from 'lucide-react'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const DEFAULT_TONES = [
  { id: 'beep', name: 'Beep', freq: 880 },
  { id: 'chime', name: 'Chime', freq: 523 },
  { id: 'bell', name: 'Bell', freq: 659 },
  { id: 'alert', name: 'Alert', freq: 1047 },
]

function formatTime(datetime) {
  if (!datetime) return '--:--'
  const d = new Date(datetime)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function formatDate(datetime) {
  if (!datetime) return ''
  const d = new Date(datetime)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function ReminderCard({ reminder, onToggle, onDelete, onSettings }) {
  const isPast = reminder.datetime && new Date(reminder.datetime) < new Date()
  const isAlarm = reminder.type === 'alarm'
  
  return (
    <div className={`card p-4 group ${reminder.enabled === false ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {isAlarm ? <AlarmClock size={16} className="text-primary" /> : <Bell size={16} className="text-primary" />}
              <h3 className={`text-sm font-semibold ${
                reminder.enabled === false ? 'line-through text-muted-light dark:text-muted-dark' : 'text-text-light dark:text-text-dark'
              }`}>
                {reminder.title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggle(reminder.id)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  reminder.enabled !== false ? 'bg-primary' : 'bg-border-light dark:bg-border-dark'
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  reminder.enabled !== false ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </button>
              <div className="relative">
                <button
                  onClick={() => onSettings(reminder.id)}
                  className="btn-icon w-6 h-6 opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical size={13} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-light dark:text-muted-dark mb-2">
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{formatTime(reminder.datetime)}</span>
            </div>
            {reminder.datetime && (
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>{formatDate(reminder.datetime)}</span>
              </div>
            )}
          </div>

          {reminder.repeat && reminder.repeat !== 'once' && (
            <div className="flex gap-1 mb-2">
              {reminder.repeat === 'weekdays' ? (
                WEEKDAYS.slice(0, 5).map(day => (
                  <span key={day} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                    {day}
                  </span>
                ))
              ) : reminder.customDays ? (
                reminder.customDays.map(dayIndex => (
                  <span key={dayIndex} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                    {WEEKDAYS[dayIndex]}
                  </span>
                ))
              ) : null}
            </div>
          )}

          {reminder.note && (
            <p className="text-xs text-muted-light dark:text-muted-dark line-clamp-2">
              {reminder.note}
            </p>
          )}

          {isPast && reminder.enabled !== false && (
            <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
              Overdue
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function SettingsSheet({ open, onClose, reminder, onDelete, onUpdateSound }) {
  const [showUpload, setShowUpload] = useState(false)

  const playTone = (toneId) => {
    try {
      const toneData = DEFAULT_TONES.find(t => t.id === toneId)
      if (!toneData) return
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = toneData.freq
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.5)
    } catch (e) {
      console.error('Audio playback failed:', e)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('audio/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        onUpdateSound(reminder.id, { customAudio: event.target.result, tone: 'custom' })
        setShowUpload(false)
      }
      reader.readAsDataURL(file)
    }
  }

  if (!reminder) return null

  return (
    <Sheet open={open} onClose={onClose} title="Settings">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-2">
            Sound
          </label>
          <div className="space-y-2">
            {DEFAULT_TONES.map(t => (
              <button
                key={t.id}
                onClick={() => onUpdateSound(reminder.id, { tone: t.id })}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-all ${
                  reminder.tone === t.id
                    ? 'bg-primary/20 border border-primary text-text-light dark:text-text-dark'
                    : 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark'
                }`}
              >
                <span>{t.name}</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); playTone(t.id) }}
                  className="btn-icon w-7 h-7"
                >
                  <Volume2 size={14} />
                </button>
              </button>
            ))}
            {reminder.customAudio && (
              <button
                onClick={() => onUpdateSound(reminder.id, { tone: 'custom' })}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-all ${
                  reminder.tone === 'custom'
                    ? 'bg-primary/20 border border-primary text-text-light dark:text-text-dark'
                    : 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark'
                }`}
              >
                <span>Custom Audio</span>
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowUpload(true)}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-lg text-sm bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark"
        >
          <Upload size={14} />
          Upload Custom Sound
        </button>

        {showUpload && (
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="w-full text-xs"
          />
        )}

        <div className="pt-4 border-t border-border-light dark:border-border-dark">
          <button
            onClick={() => { onDelete(reminder.id); onClose() }}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-lg text-sm bg-red-500/10 border border-red-500/30 text-red-500"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </Sheet>
  )
}

function AddSheet({ open, onClose, onAdd, type }) {
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [time, setTime] = useState('09:00')
  const [repeat, setRepeat] = useState('once')
  const [customDays, setCustomDays] = useState([])
  const [tone, setTone] = useState('beep')

  const reset = () => {
    setTitle('')
    setNote('')
    setDate(new Date().toISOString().split('T')[0])
    setTime('09:00')
    setRepeat('once')
    setCustomDays([])
    setTone('beep')
  }

  const toggleDay = (index) => {
    setCustomDays(prev =>
      prev.includes(index) ? prev.filter(d => d !== index) : [...prev, index].sort()
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return

    const datetime = new Date(`${date}T${time}`).toISOString()

    onAdd({
      title: title.trim(),
      note: note.trim(),
      datetime,
      repeat,
      customDays: repeat === 'custom' ? customDays : undefined,
      tone,
      type,
      enabled: true,
    })

    reset()
    onClose()
  }

  return (
    <Sheet open={open} onClose={() => { reset(); onClose() }} title={`New ${type === 'alarm' ? 'Alarm' : 'Reminder'}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-1">
            Title *
          </label>
          <input
            autoFocus
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="input"
            placeholder={type === 'alarm' ? 'Wake up, Morning workout...' : 'Call mom, Take medicine...'}
          />
        </div>

        {type === 'reminder' && (
          <div>
            <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-1">
              Note
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              className="input"
              rows={2}
              placeholder="Additional details..."
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-1">
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="input"
            />
          </div>
        </div>

        {type === 'alarm' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-2">
                Repeat
              </label>
              <div className="flex gap-2">
                {['once', 'weekdays', 'custom'].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRepeat(r)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                      repeat === r
                        ? 'bg-primary text-black'
                        : 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark'
                    }`}
                  >
                    {r === 'once' ? 'Once' : r === 'weekdays' ? 'Weekdays' : 'Custom'}
                  </button>
                ))}
              </div>
            </div>

            {repeat === 'custom' && (
              <div>
                <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-2">
                  Select Days
                </label>
                <div className="flex gap-2">
                  {WEEKDAYS.map((day, index) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(index)}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                        customDays.includes(index)
                          ? 'bg-primary text-black'
                          : 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            variant="ghost"
            type="button"
            onClick={() => { reset(); onClose() }}
            className="flex-1 justify-center"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={!title.trim()}
            className="flex-1 justify-center"
          >
            Done
          </Button>
        </div>
      </form>
    </Sheet>
  )
}

function TypeSelectionSheet({ open, onClose, onSelect }) {
  return (
    <Sheet open={open} onClose={onClose} title="Create New">
      <div className="space-y-3">
        <button
          onClick={() => { onSelect('alarm'); onClose() }}
          className="w-full flex items-center gap-3 p-4 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark hover:border-primary transition-colors"
        >
          <AlarmClock size={24} className="text-primary" />
          <div className="text-left">
            <h3 className="text-sm font-semibold text-text-light dark:text-text-dark">Alarm</h3>
            <p className="text-xs text-muted-light dark:text-muted-dark">Wake up calls, recurring alerts</p>
          </div>
        </button>
        <button
          onClick={() => { onSelect('reminder'); onClose() }}
          className="w-full flex items-center gap-3 p-4 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark hover:border-primary transition-colors"
        >
          <Bell size={24} className="text-primary" />
          <div className="text-left">
            <h3 className="text-sm font-semibold text-text-light dark:text-text-dark">Reminder</h3>
            <p className="text-xs text-muted-light dark:text-muted-dark">Tasks, appointments, one-time events</p>
          </div>
        </button>
      </div>
    </Sheet>
  )
}

export function Reminders({ userId, isDemoMode }) {
  const { reminders, addReminder, toggleEnabled, deleteReminder, updateReminder } = useReminders()
  const [showTypeSelect, setShowTypeSelect] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [addType, setAddType] = useState('reminder')
  const [settingsId, setSettingsId] = useState(null)

  const handleTypeSelect = (type) => {
    setAddType(type)
    setShowAdd(true)
  }

  const handleUpdateSound = (id, updates) => {
    updateReminder(id, updates)
  }

  const sortedReminders = useMemo(() => {
    return [...reminders].sort((a, b) => {
      if (!a.datetime) return 1
      if (!b.datetime) return -1
      return new Date(a.datetime) - new Date(b.datetime)
    })
  }, [reminders])

  const { alarms, remindersList } = useMemo(() => {
    const alarms = sortedReminders.filter(r => r.type === 'alarm')
    const remindersList = sortedReminders.filter(r => r.type !== 'alarm')
    return { alarms, remindersList }
  }, [sortedReminders])

  const settingsReminder = reminders.find(r => r.id === settingsId)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-text-light dark:text-text-dark">
            Alarms & Reminders
          </h1>
          <p className="text-xs text-muted-light dark:text-muted-dark mt-0.5">
            {reminders.length} total
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowTypeSelect(true)}>
          <Plus size={16} />
          Add
        </Button>
      </div>

      {reminders.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl mb-4 block">⏰</span>
          <p className="text-sm text-muted-light dark:text-muted-dark">No alarms or reminders yet.</p>
          <p className="text-xs text-muted-light dark:text-muted-dark mt-1">
            Tap the + button to create one
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {alarms.length > 0 && (
            <div>
              <h2 className="text-sm font-serif font-bold text-text-light dark:text-text-dark mb-3 flex items-center gap-2">
                <AlarmClock size={16} />
                Alarms
              </h2>
              <div className="space-y-2">
                {alarms.map(reminder => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    onToggle={toggleEnabled}
                    onDelete={deleteReminder}
                    onSettings={setSettingsId}
                  />
                ))}
              </div>
            </div>
          )}

          {remindersList.length > 0 && (
            <div>
              <h2 className="text-sm font-serif font-bold text-text-light dark:text-text-dark mb-3 flex items-center gap-2">
                <Bell size={16} />
                Reminders
              </h2>
              <div className="space-y-2">
                {remindersList.map(reminder => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    onToggle={toggleEnabled}
                    onDelete={deleteReminder}
                    onSettings={setSettingsId}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <TypeSelectionSheet
        open={showTypeSelect}
        onClose={() => setShowTypeSelect(false)}
        onSelect={handleTypeSelect}
      />

      <AddSheet
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={addReminder}
        type={addType}
      />

      <SettingsSheet
        open={!!settingsId}
        onClose={() => setSettingsId(null)}
        reminder={settingsReminder}
        onDelete={deleteReminder}
        onUpdateSound={handleUpdateSound}
      />
    </div>
  )
}
