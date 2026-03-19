import { useState, useEffect, useCallback, useRef } from 'react'

const LS_KEY = 'loco_reminders'

function load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || [] } catch { return [] }
}
function save(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data))
}

async function requestNotifPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

function fireNotif(title, body) {
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/icons/icon-192.png' })
  }
  // Also play a short beep via AudioContext
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.4)
  } catch (_) {}
}

export function useReminders() {
  const [reminders, setReminders] = useState(load)
  const timersRef = useRef([])

  const persist = useCallback((data) => {
    setReminders(data)
    save(data)
  }, [])

  // Schedule browser notifications for a single reminder
  const scheduleNotifs = useCallback((reminder) => {
    if (!reminder.datetime || reminder.done) return
    const target = new Date(reminder.datetime).getTime()
    const now = Date.now()

    const schedule = (offsetMs, label) => {
      const delay = target - offsetMs - now
      if (delay <= 0) return
      const id = setTimeout(() => {
        fireNotif(`⏰ ${label} — ${reminder.title}`, reminder.note || '')
      }, delay)
      timersRef.current.push(id)
    }

    schedule(15 * 60 * 1000, '15 min reminder')
    schedule(10 * 60 * 1000, '10 min reminder')
    schedule(0, 'Time now!')
  }, [])

  // Re-schedule all on mount / reminders change
  useEffect(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    requestNotifPermission().then((granted) => {
      if (!granted) return
      reminders.forEach(scheduleNotifs)
    })
    return () => timersRef.current.forEach(clearTimeout)
  }, [reminders, scheduleNotifs])

  const addReminder = useCallback((fields) => {
    const item = {
      id: crypto.randomUUID(),
      title: fields.title,
      datetime: fields.datetime,   // ISO string
      note: fields.note || '',
      important: fields.important || false,
      done: false,
      created_at: new Date().toISOString(),
    }
    persist([item, ...reminders])
    return item
  }, [reminders, persist])

  const toggleDone = useCallback((id) => {
    persist(reminders.map(r => r.id === id ? { ...r, done: !r.done } : r))
  }, [reminders, persist])

  const deleteReminder = useCallback((id) => {
    persist(reminders.filter(r => r.id !== id))
  }, [reminders, persist])

  const updateReminder = useCallback((id, fields) => {
    persist(reminders.map(r => r.id === id ? { ...r, ...fields } : r))
  }, [reminders, persist])

  return { reminders, addReminder, toggleDone, deleteReminder, updateReminder }
}
