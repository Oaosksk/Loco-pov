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

const TONE_FREQS = { beep: 880, chime: 523, bell: 659, alert: 1047 }

function playTone(toneId, customAudio) {
  if (customAudio && toneId === 'custom') {
    try {
      const audio = new Audio(customAudio)
      audio.volume = 0.5
      audio.play()
      return
    } catch (e) {
      console.error('Custom audio playback failed:', e)
    }
  }

  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = TONE_FREQS[toneId] || 880
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 1)
  } catch (e) {
    console.error('Audio playback failed:', e)
  }
}

function fireNotif(reminder, snoozeCount = 0) {
  const title = reminder.type === 'alarm' ? `⏰ Alarm` : `🔔 Reminder`
  const body = snoozeCount > 0 ? `${reminder.title} (Snoozed ${snoozeCount}x)` : reminder.title
  
  if (Notification.permission === 'granted') {
    const notif = new Notification(title, { 
      body, 
      icon: '/icons/icon-192.png',
      requireInteraction: true,
      tag: reminder.id
    })
    
    notif.onclick = () => {
      window.focus()
      notif.close()
    }
  }
  
  playTone(reminder.tone || 'beep', reminder.customAudio)
}

// Get next trigger time for a recurring reminder
function getNextTrigger(reminder) {
  if (!reminder.datetime) return null
  const base = new Date(reminder.datetime)
  const now = new Date()

  if (reminder.repeat === 'once') return base > now ? base : null

  // For weekdays: Mon–Fri
  const targetDays = reminder.repeat === 'weekdays'
    ? [1, 2, 3, 4, 5]  // Mon=1 ... Fri=5 (JS: Sun=0)
    : (reminder.customDays || []).map(d => (d + 1) % 7) // convert Mon=0 to JS Sun=0 based

  if (!targetDays.length) return null

  const candidate = new Date(now)
  candidate.setHours(base.getHours(), base.getMinutes(), 0, 0)

  for (let i = 0; i < 8; i++) {
    const day = candidate.getDay()
    if (targetDays.includes(day) && candidate > now) return candidate
    candidate.setDate(candidate.getDate() + 1)
  }
  return null
}

export function useReminders() {
  const [reminders, setReminders] = useState(load)
  const timersRef = useRef([])
  const snoozeCountRef = useRef({})

  const persist = useCallback((data) => {
    setReminders(data)
    save(data)
  }, [])

  const scheduleReminder = useCallback((reminder) => {
    if (reminder.enabled === false) return
    const next = getNextTrigger(reminder)
    if (!next) return

    const delay = next.getTime() - Date.now()
    if (delay <= 0) return

    const id = setTimeout(() => {
      const snoozeCount = snoozeCountRef.current[reminder.id] || 0
      fireNotif(reminder, snoozeCount)

      // For reminders (not alarms), implement snooze logic
      if (reminder.type !== 'alarm' && snoozeCount < 3) {
        snoozeCountRef.current[reminder.id] = snoozeCount + 1
        
        // Re-fire after 5 minutes
        const snoozeId = setTimeout(() => {
          fireNotif(reminder, snoozeCountRef.current[reminder.id])
          
          if (snoozeCountRef.current[reminder.id] < 3) {
            snoozeCountRef.current[reminder.id]++
          } else {
            delete snoozeCountRef.current[reminder.id]
          }
        }, 5 * 60 * 1000) // 5 minutes
        
        timersRef.current.push(snoozeId)
      } else {
        delete snoozeCountRef.current[reminder.id]
      }

      // If recurring, re-schedule for next occurrence
      if (reminder.repeat !== 'once') {
        setReminders(prev => {
          const updated = prev.map(r =>
            r.id === reminder.id
              ? { ...r, datetime: new Date(next.getTime() + 86400000).toISOString() }
              : r
          )
          save(updated)
          return updated
        })
      }
    }, delay)

    timersRef.current.push(id)
  }, [])

  useEffect(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    requestNotifPermission().then(granted => {
      if (!granted) return
      reminders.forEach(scheduleReminder)
    })
    return () => timersRef.current.forEach(clearTimeout)
  }, [reminders, scheduleReminder])

  const addReminder = useCallback((fields) => {
    const item = {
      id: crypto.randomUUID(),
      title: fields.title,
      note: fields.note || '',
      datetime: fields.datetime,
      repeat: fields.repeat || 'once',
      customDays: fields.customDays || [],
      tone: fields.tone || 'beep',
      type: fields.type || 'reminder',
      enabled: fields.enabled !== false,
      customAudio: fields.customAudio,
      created_at: new Date().toISOString(),
    }
    persist([item, ...reminders])
    return item
  }, [reminders, persist])

  const toggleEnabled = useCallback((id) => {
    persist(reminders.map(r => r.id === id ? { ...r, enabled: r.enabled === false ? true : false } : r))
  }, [reminders, persist])

  const deleteReminder = useCallback((id) => {
    delete snoozeCountRef.current[id]
    persist(reminders.filter(r => r.id !== id))
  }, [reminders, persist])

  const updateReminder = useCallback((id, fields) => {
    persist(reminders.map(r => r.id === id ? { ...r, ...fields } : r))
  }, [reminders, persist])

  return { reminders, addReminder, toggleEnabled, deleteReminder, updateReminder }
}
