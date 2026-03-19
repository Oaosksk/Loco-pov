import React, { useState, useMemo } from 'react'
import { useNotes } from '../hooks/useNotes'
import { SearchBar } from '../components/ui/SearchBar'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Sheet } from '../components/ui/Sheet'
import { Plus, Trash2, Share2, Copy, Check, Sparkles, Lock, Globe } from 'lucide-react'

const TAGS = ['all', 'personal', 'work', 'ideas', 'learning', 'health']

const TAG_COLORS = {
  personal: 'tag-personal',
  work: 'tag-work',
  ideas: 'tag-ideas',
  learning: 'tag-learning',
  health: 'tag-health',
}

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function NoteCard({ note, onDelete, onShare, onUnshare, onSummarise, apiKey }) {
  const [copied, setCopied] = useState(false)
  const [summarising, setSummarising] = useState(false)
  const [summary, setSummary] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const shareUrl = note.share_token
    ? `${window.location.origin}/share/${note.share_token}`
    : null

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = async () => {
    if (note.is_public) {
      await onUnshare(note.id)
    } else {
      await onShare(note.id)
    }
  }

  const handleSummarise = async () => {
    if (!apiKey) {
      setSummary('⚠️ Set a Groq API key in the AI tab first.')
      return
    }
    setSummarising(true)
    setSummary('')
    try {
      const { summariseNote } = await import('../lib/groq')
      const result = await summariseNote({ apiKey, note })
      setSummary(result)
    } catch (err) {
      setSummary(`Error: ${err.message}`)
    } finally {
      setSummarising(false)
    }
  }

  return (
    <div className="card p-5 flex flex-col gap-3 group">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold font-serif text-text-light dark:text-text-dark leading-snug">
          {note.title}
        </h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={handleShare}
            className="btn-icon"
            title={note.is_public ? 'Make private' : 'Share'}
          >
            {note.is_public ? <Globe size={15} className="text-green-500" /> : <Share2 size={15} />}
          </button>
          <button
            onClick={handleSummarise}
            className="btn-icon"
            title="AI Summarise"
            disabled={summarising}
          >
            <Sparkles size={15} className={summarising ? 'animate-pulse text-accent' : ''} />
          </button>
          <button
            onClick={() => confirmDelete ? onDelete(note.id) : setConfirmDelete(true)}
            className={`btn-icon ${confirmDelete ? 'text-red-500' : ''}`}
            title={confirmDelete ? 'Click again to confirm' : 'Delete'}
            onBlur={() => setConfirmDelete(false)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Body preview */}
      {note.body && (
        <p className="text-sm text-muted-light dark:text-muted-dark line-clamp-3 leading-relaxed">
          {note.body}
        </p>
      )}

      {/* Summary */}
      {(summarising || summary) && (
        <div className="rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 p-3 text-xs text-text-light dark:text-text-dark leading-relaxed">
          {summarising ? (
            <span className="text-muted-light dark:text-muted-dark animate-pulse">Summarising…</span>
          ) : (
            summary
          )}
        </div>
      )}

      {/* Share URL */}
      {note.is_public && shareUrl && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-3 py-2">
          <Globe size={13} className="text-green-600 dark:text-green-400 flex-shrink-0" />
          <span className="text-xs text-green-700 dark:text-green-300 truncate flex-1">{shareUrl}</span>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 text-green-600 dark:text-green-400 hover:text-green-800 transition-colors"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className={`tag ${TAG_COLORS[note.tag] || 'tag-personal'}`}>{note.tag}</span>
        <span className="text-xs text-muted-light dark:text-muted-dark">{formatDate(note.updated_at)}</span>
      </div>
    </div>
  )
}

function AddNoteSheet({ open, onClose, onAdd }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tag, setTag] = useState('personal')
  const [saving, setSaving] = useState(false)

  const reset = () => { setTitle(''); setBody(''); setTag('personal') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      await onAdd({ title: title.trim(), body: body.trim(), tag })
      reset()
      onClose()
    } catch {
      /* error handled in hook */
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onClose={() => { reset(); onClose() }} title="New Note">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-1">
            Title *
          </label>
          <input
            autoFocus
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title…"
            className="input"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-1">
            Body
          </label>
          <textarea
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your note here…"
            className="textarea"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-2">
            Tag
          </label>
          <div className="flex flex-wrap gap-2">
            {TAGS.filter(t => t !== 'all').map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setTag(t)}
                className={`tag cursor-pointer transition-all ${
                  tag === t
                    ? `${TAG_COLORS[t]} ring-2 ring-offset-1 ring-primary/40`
                    : TAG_COLORS[t]
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={() => { reset(); onClose() }} className="flex-1 justify-center">
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={saving || !title.trim()} className="flex-1 justify-center">
            {saving ? 'Saving…' : 'Save Note'}
          </Button>
        </div>
      </form>
    </Sheet>
  )
}

export function Notes({ userId, isDemoMode }) {
  const { notes, loading, addNote, deleteNote, shareNote, unshareNote } = useNotes({ userId, isDemoMode })
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const apiKey = localStorage.getItem('loco_groq_key') || ''

  const filtered = useMemo(() => {
    let list = notes
    if (activeTag !== 'all') list = list.filter((n) => n.tag === activeTag)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          (n.body || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [notes, activeTag, search])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-text-light dark:text-text-dark">Notes</h1>
          <p className="text-sm text-muted-light dark:text-muted-dark mt-0.5">
            {notes.length} note{notes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} />
          New Note
        </Button>
      </div>

      {/* Search + tag filters */}
      <div className="space-y-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search notes…"
        />
        <div className="flex gap-2 flex-wrap">
          {TAGS.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTag(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all duration-200 ${
                activeTag === t
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:border-primary hover:text-primary'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Notes grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-border-light dark:bg-border-dark rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl mb-4 block">📝</span>
          <p className="text-muted-light dark:text-muted-dark font-medium">
            {search ? 'No notes match your search.' : 'No notes yet. Create your first one!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onDelete={deleteNote}
              onShare={shareNote}
              onUnshare={unshareNote}
              apiKey={apiKey}
            />
          ))}
        </div>
      )}

      <AddNoteSheet open={showAdd} onClose={() => setShowAdd(false)} onAdd={addNote} />
    </div>
  )
}
