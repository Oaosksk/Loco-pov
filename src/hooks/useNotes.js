import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { parseEntry } from '../lib/parseEntry'

const LS_BUFFER_KEY = 'loco_notes_buffer'   // offline buffer
// const LS_CACHE_KEY  = 'loco_entries_cache'  // cached entries for display

function getTodayDate() {
  return new Date().toISOString().split('T')[0]
}

// Group entries by date for display
function groupByDate(entries) {
  const groups = {}
  for (const entry of entries) {
    const date = entry.note_date || entry.entry_time?.split('T')[0] || getTodayDate()
    if (!groups[date]) groups[date] = []
    groups[date].push(entry)
  }
  // Sort dates descending, entries within each date by time ascending
  const sorted = Object.keys(groups).sort((a, b) => b.localeCompare(a))
  return sorted.map(date => ({
    date,
    entries: groups[date].sort((a, b) => (a.entry_time || '').localeCompare(b.entry_time || '')),
  }))
}

/**
 * Rolling daily journal hook.
 * - One note per day per user (upserted)
 * - Entries are individual parsed lines with timestamps
 * - Offline-first: writes to localStorage buffer, syncs to Supabase
 */
export function useNotes({ userId, isDemoMode }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const syncingRef = useRef(false)

  // ─── Load entries ───
  const fetchEntries = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)

    if (isDemoMode) {
      // const cached = localStorage.getItem(LS_CACHE_KEY)
      // if (cached) {
        // setEntries(JSON.parse(cached))
      // } else 
        {
        // Seed demo entries
        const demoEntries = [
          {
            id: 'demo-1',
            note_date: getTodayDate(),
            title: 'Fuel Expense',
            raw_text: 'petrol 159 @e',
            parsed_type: 'expense',
            parsed_data: { description: 'Petrol', amount: 159, category: 'transport', date: getTodayDate() },
            entry_time: new Date().toISOString(),
            is_edited: false,
          },
          {
            id: 'demo-2',
            note_date: getTodayDate(),
            title: 'Workout Session',
            raw_text: 'gym 45min @h',
            parsed_type: 'health',
            parsed_data: { metric: 'workout', value: 45, unit: 'min', note: 'Gym', date: getTodayDate() },
            entry_time: new Date(Date.now() - 3600000).toISOString(),
            is_edited: false,
          },
          {
            id: 'demo-3',
            note_date: getTodayDate(),
            title: '',
            raw_text: 'feeling good @casual',
            parsed_type: 'casual',
            parsed_data: { content: 'feeling good' },
            entry_time: new Date(Date.now() - 7200000).toISOString(),
            is_edited: false,
          },
          {
            id: 'demo-4',
            note_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            title: 'Coffee Break',
            raw_text: 'coffee 80 @e',
            parsed_type: 'expense',
            parsed_data: { description: 'Coffee', amount: 80, category: 'food', date: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
            entry_time: new Date(Date.now() - 86400000).toISOString(),
            is_edited: false,
          },
          {
            id: 'demo-5',
            note_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            title: 'Family Reminder',
            raw_text: 'call mum @R 9pm tonight',
            parsed_type: 'reminder',
            parsed_data: { title: 'Call mum', remind_at: new Date().toISOString() },
            entry_time: new Date(Date.now() - 82800000).toISOString(),
            is_edited: false,
          },
        ]
        setEntries(demoEntries)
        // localStorage.setItem(LS_CACHE_KEY, JSON.stringify(demoEntries))
      }
      setLoading(false)
      return
    }

    try {
      // Fetch note_entries from Supabase
      const { data, error: fetchErr } = await supabase
        .from('note_entries')
        .select('*')
        .order('entry_time', { ascending: false })
        .limit(200)

      if (fetchErr) throw fetchErr

      // Only update cache when we actually get data back
      if (data && data.length >= 0) {
        setEntries(data)
        // localStorage.setItem(LS_CACHE_KEY, JSON.stringify(data))
      }
    } catch (err) {
      console.error('[Notes] Fetch error:', err.message)
      // const cached = localStorage.getItem(LS_CACHE_KEY)
      // if (cached) setEntries(JSON.parse(cached))
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId, isDemoMode])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  // ─── Add entry ───
  const addEntry = useCallback(async (rawText, title = '') => {
    if (!rawText?.trim() || !userId) return null

    const parsed = parseEntry(rawText)
    const today = getTodayDate()
    const now = new Date().toISOString()

    const newEntry = {
      id: crypto.randomUUID(),
      note_date: today,
      title: title || '',
      raw_text: rawText.trim(),
      parsed_type: parsed.type,
      parsed_data: parsed.data,
      entry_time: now,
      is_edited: false,
      user_id: userId,
    }

    // Optimistic update
    const updated = [newEntry, ...entries]
    setEntries(updated)
    // localStorage.setItem(LS_CACHE_KEY, JSON.stringify(updated))

    if (isDemoMode) return newEntry

    try {
      // Ensure note for today exists (upsert)
      const { data: noteData, error: noteErr } = await supabase
        .from('notes')
        .upsert(
          { user_id: userId, note_date: today },
          { onConflict: 'user_id,note_date' }
        )
        .select()
        .single()

      if (noteErr) {
        // If the upsert fails, try to get existing
        console.warn('[Notes] Upsert note warning:', noteErr.message)
      }

      const noteId = noteData?.id

      // Insert the entry
      const { data: entryData, error: entryErr } = await supabase
        .from('note_entries')
        .insert({
          note_id: noteId,
          user_id: userId,
          note_date: today,
          raw_text: rawText.trim(),
          parsed_type: parsed.type,
          parsed_data: parsed.data,
          entry_time: now,
        })
        .select()
        .single()

      if (entryErr) throw entryErr

      // Route to appropriate table based on type
      await routeParsedData(parsed, entryData?.id || newEntry.id, userId)

      return entryData || newEntry
    } catch (err) {
      console.error('[Notes] Add entry error:', err.message)
      // Save to offline buffer
      const buffer = JSON.parse(localStorage.getItem(LS_BUFFER_KEY) || '[]')
      buffer.push(newEntry)
      localStorage.setItem(LS_BUFFER_KEY, JSON.stringify(buffer))
      return newEntry
    }
  }, [userId, isDemoMode, entries])

  // ─── Edit entry ───
  const editEntry = useCallback(async (id, newRawText, newTitle = '') => {
    if (!newRawText?.trim()) return

    const parsed = parseEntry(newRawText)
    const updated = entries.map(e =>
      e.id === id
        ? { ...e, title: newTitle || '', raw_text: newRawText.trim(), parsed_type: parsed.type, parsed_data: parsed.data, is_edited: true }
        : e
    )
    setEntries(updated)
    // localStorage.setItem(LS_CACHE_KEY, JSON.stringify(updated))

    if (isDemoMode) return

    try {
      const { error } = await supabase
        .from('note_entries')
        .update({
          raw_text: newRawText.trim(),
          parsed_type: parsed.type,
          parsed_data: parsed.data,
          is_edited: true,
        })
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      console.error('[Notes] Edit entry error:', err.message)
    }
  }, [entries, isDemoMode])

  // ─── Delete entry ───
  const deleteEntry = useCallback(async (id) => {
    const updated = entries.filter(e => e.id !== id)
    setEntries(updated)
    // localStorage.setItem(LS_CACHE_KEY, JSON.stringify(updated))

    if (isDemoMode) return

    try {
      const { error } = await supabase
        .from('note_entries')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      console.error('[Notes] Delete entry error:', err.message)
    }
  }, [entries, isDemoMode])

  // ─── Sync offline buffer ───
  const syncBuffer = useCallback(async () => {
    if (isDemoMode || syncingRef.current) return
    const buffer = JSON.parse(localStorage.getItem(LS_BUFFER_KEY) || '[]')
    if (buffer.length === 0) return

    syncingRef.current = true
    const remaining = []

    for (const entry of buffer) {
      try {
        const { error } = await supabase
          .from('note_entries')
          .insert({
            user_id: entry.user_id,
            note_date: entry.note_date,
            raw_text: entry.raw_text,
            parsed_type: entry.parsed_type,
            parsed_data: entry.parsed_data,
            entry_time: entry.entry_time,
          })

        if (error) {
          remaining.push(entry)
        }
      } catch {
        remaining.push(entry)
      }
    }

    localStorage.setItem(LS_BUFFER_KEY, JSON.stringify(remaining))
    syncingRef.current = false

    if (remaining.length < buffer.length) {
      fetchEntries() // refresh from server after sync
    }
  }, [isDemoMode, fetchEntries])

  // Try to sync buffer on mount and periodically
  useEffect(() => {
    if (isDemoMode) return
    syncBuffer()
    const interval = setInterval(syncBuffer, 30000) // every 30s
    return () => clearInterval(interval)
  }, [syncBuffer, isDemoMode])

  // Grouped data for display
  const groupedEntries = groupByDate(entries)

  return {
    entries,
    groupedEntries,
    loading,
    error,
    addEntry,
    editEntry,
    deleteEntry,
    fetchEntries,
  }
}

// ─── Route parsed data to related tables ───
async function routeParsedData(parsed, entryId, userId) {
  try {
    switch (parsed.type) {
      case 'expense': {
        const { description, amount, category, date } = parsed.data
        await supabase.from('expenses').insert({
          user_id: userId,
          note_entry_id: entryId,
          description,
          amount,
          category,
          date,
        })
        break
      }
      case 'health': {
        const { metric, value, unit, note, date } = parsed.data
        await supabase.from('health_logs').insert({
          user_id: userId,
          note_entry_id: entryId,
          metric,
          value,
          unit,
          note,
          date,
        })
        break
      }
      case 'reminder': {
        const { title, remind_at } = parsed.data
        await supabase.from('reminders').insert({
          user_id: userId,
          note_entry_id: entryId,
          title,
          remind_at,
          push_sent: false,
        })
        break
      }
      case 'subscription': {
        const { name, amount, cycle } = parsed.data
        await supabase.from('subscriptions').insert({
          user_id: userId,
          note_entry_id: entryId,
          name,
          amount,
          cycle,
          next_due: calculateNextDue(cycle),
          remind_days_before: 3,
        })
        break
      }
      case 'goal': {
        const { title, tasks = [], target = 100 } = parsed.data
        const resolvedTarget = tasks.length > 0 ? tasks.length : target
        const resolvedUnit = tasks.length > 0 ? 'tasks' : '%'

        const { data: goalData, error: goalErr } = await supabase
          .from('goals')
          .insert({
            user_id: userId,
            title,
            progress: 0,
            target: resolvedTarget,
            unit: resolvedUnit,
            status: 'active',
          })
          .select()
          .single()

        if (goalErr) throw goalErr

        if (tasks.length > 0 && goalData?.id) {
          const taskRows = tasks.map((t, i) => ({
            goal_id: goalData.id,
            user_id: userId,
            title: t.title,
            done: false,
            sort_order: t.sort_order ?? i + 1,
          }))
          await supabase.from('goal_tasks').insert(taskRows)
        }
        break
      }
      default:
        break
    }
  } catch (err) {
    console.error(`[Notes] Route ${parsed.type} error:`, err.message)
  }
}

function calculateNextDue(cycle) {
  const now = new Date()
  switch (cycle) {
    case 'weekly':
      now.setDate(now.getDate() + 7)
      break
    case 'monthly':
      now.setMonth(now.getMonth() + 1)
      break
    case 'quarterly':
      now.setMonth(now.getMonth() + 3)
      break
    case 'yearly':
      now.setFullYear(now.getFullYear() + 1)
      break
    default:
      now.setMonth(now.getMonth() + 1)
  }
  return now.toISOString().split('T')[0]
}
