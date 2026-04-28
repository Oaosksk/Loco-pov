import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'

export function AlarmNotification({ alarm, onDismiss, onSnooze }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 text-center">
        <div className="mb-8">
          <div className="text-8xl mb-4">⏰</div>
          <div className="text-6xl font-bold text-white mb-2">
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </div>
          <div className="text-xl text-gray-300">
            {alarm.title}
          </div>
        </div>

        <div className="flex gap-4">
          {alarm.type !== 'alarm' && (
            <button
              onClick={onSnooze}
              className="flex-1 py-4 px-6 rounded-2xl bg-yellow-500/20 border-2 border-yellow-500 text-yellow-500 text-lg font-semibold hover:bg-yellow-500/30 transition-colors"
            >
              Snooze 5min
            </button>
          )}
          <button
            onClick={onDismiss}
            className="flex-1 py-4 px-6 rounded-2xl bg-white/10 border-2 border-white text-white text-lg font-semibold hover:bg-white/20 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}

export function ReminderNotification({ reminder, onDismiss, onSnooze }) {
  return (
    <div className="fixed top-4 right-4 z-50 w-96 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl shadow-2xl p-6 animate-slide-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🔔</div>
          <div>
            <h3 className="text-sm font-semibold text-text-light dark:text-text-dark">
              Reminder
            </h3>
            <p className="text-xs text-muted-light dark:text-muted-dark">
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="btn-icon w-6 h-6"
        >
          <X size={14} />
        </button>
      </div>

      <p className="text-base text-text-light dark:text-text-dark mb-4">
        {reminder.title}
      </p>

      {reminder.note && (
        <p className="text-sm text-muted-light dark:text-muted-dark mb-4">
          {reminder.note}
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={onSnooze}
          className="flex-1 py-2 px-4 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark text-sm font-medium hover:bg-bg-light dark:hover:bg-bg-dark transition-colors"
        >
          Remind in 10 mins
        </button>
        <button
          onClick={onDismiss}
          className="flex-1 py-2 px-4 rounded-lg bg-primary text-black text-sm font-medium hover:opacity-80 transition-opacity"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
