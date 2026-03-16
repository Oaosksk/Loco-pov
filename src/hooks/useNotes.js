import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const LS_KEY = 'loco_notes_cache'

// Demo notes used when no Supabase session
const DEMO_NOTES = [
  {
    id: '1',
    title: 'Welcome to Loco!',
    body: 'This is a demo note. Connect Supabase to persist your notes in the cloud.',
    tag: 'personal',
    is_public: false,
    share_token: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Book ideas 📚',
    body: 'Atomic Habits, Deep Work, The Almanack of Naval Ravikant. Read one chapter per day.',
    tag: 'ideas',
    is_public: false,
    share_token: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    title: 'Q2 Work Milestones',
    body: 'Launch MVP by end of April. Hire one full-stack dev. Reach 500 signups.',
    tag: 'work',
    is_public: false,
    share_token: null,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
  },
]

export function useNotes({ userId, isDemoMode }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchNotes = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)

    if (isDemoMode) {
      const cached = localStorage.getItem(LS_KEY)
      setNotes(cached ? JSON.parse(cached) : DEMO_NOTES)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setNotes(data)
      // Cache for offline
      localStorage.setItem(LS_KEY, JSON.stringify(data))
    } catch (err) {
      console.error('[Notes] Fetch error:', err.message)
      // Fall back to localStorage cache
      const cached = localStorage.getItem(LS_KEY)
      if (cached) setNotes(JSON.parse(cached))
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId, isDemoMode])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const addNote = async ({ title, body, tag }) => {
    const newNote = {
      id: crypto.randomUUID(),
      title,
      body,
      tag: tag || 'personal',
      is_public: false,
      share_token: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: userId,
    }

    if (isDemoMode) {
      const updated = [newNote, ...notes]
      setNotes(updated)
      localStorage.setItem(LS_KEY, JSON.stringify(updated))
      return newNote
    }

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({ title, body, tag: tag || 'personal', user_id: userId })
        .select()
        .single()

      if (error) throw error

      const updated = [data, ...notes]
      setNotes(updated)
      localStorage.setItem(LS_KEY, JSON.stringify(updated))
      return data
    } catch (err) {
      console.error('[Notes] Add error:', err.message)
      throw err
    }
  }

  const updateNote = async (id, changes) => {
    const updated = notes.map((n) =>
      n.id === id ? { ...n, ...changes, updated_at: new Date().toISOString() } : n
    )
    setNotes(updated)
    localStorage.setItem(LS_KEY, JSON.stringify(updated))

    if (isDemoMode) return

    try {
      const { error } = await supabase
        .from('notes')
        .update({ ...changes, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      console.error('[Notes] Update error:', err.message)
      throw err
    }
  }

  const deleteNote = async (id) => {
    const updated = notes.filter((n) => n.id !== id)
    setNotes(updated)
    localStorage.setItem(LS_KEY, JSON.stringify(updated))

    if (isDemoMode) return

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      console.error('[Notes] Delete error:', err.message)
      throw err
    }
  }

  const shareNote = async (id) => {
    const token = crypto.randomUUID().replace(/-/g, '')
    await updateNote(id, { is_public: true, share_token: token })
    return token
  }

  const unshareNote = async (id) => {
    await updateNote(id, { is_public: false, share_token: null })
  }

  return { notes, loading, error, fetchNotes, addNote, updateNote, deleteNote, shareNote, unshareNote }
}
