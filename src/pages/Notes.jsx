import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useNotes } from '../hooks/useNotes'
import { detectTags, getTagColor, getAvailableCommands } from '../lib/parseEntry'
import {
  Send, Edit3, Trash2, HelpCircle, X, Search,
  Plus, MoreVertical, FolderPlus, FileText,
} from 'lucide-react'
import { Sheet } from '../components/ui/Sheet'
import { Button } from '../components/ui/Button'

/* ── Type color mapping — subdued editorial palette ── */
const TYPE_LABEL = {
  expense:      '💰 Expense',
  health:       '❤️ Health',
  reminder:     '⏰ Reminder',
  casual:       '📝 Note',
  subscription: '🔄 Sub',
  goal:         '🎯 Goal',
  upload:       '📎 File',
}

function NoteCard({ entry, onEdit, onDelete }) {
  const [showMenu, setShowMenu]   = useState(false)
  const [editing, setEditing]     = useState(false)
  const [editText, setEditText]   = useState(entry.raw_text)

  const label = TYPE_LABEL[entry.parsed_type] || '📝 Note'

  const handleSave = () => {
    if (editText.trim() && editText.trim() !== entry.raw_text) {
      onEdit(entry.id, editText.trim())
    }
    setEditing(false)
  }

  return (
    <div className="card p-4 group relative">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="tag">{label}</span>
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="btn-icon w-6 h-6 opacity-0 group-hover:opacity-100"
          >
            <MoreVertical size={13} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 z-10 w-32
                            bg-surface-light dark:bg-surface-dark
                            border border-border-light dark:border-border-dark
                            rounded-xl shadow-card-dark overflow-hidden"
                 style={{ borderWidth: '0.5px' }}>
              <button
                onClick={() => { setEditing(true); setShowMenu(false) }}
                className="w-full text-left px-3 py-2.5 text-xs flex items-center gap-2
                           text-text-light dark:text-text-dark
                           hover:bg-bg-light dark:hover:bg-bg-dark"
              >
                <Edit3 size={12} /> Edit
              </button>
              <button
                onClick={() => { onDelete(entry.id); setShowMenu(false) }}
                className="w-full text-left px-3 py-2.5 text-xs flex items-center gap-2
                           text-muted-light dark:text-muted-dark
                           hover:bg-bg-light dark:hover:bg-bg-dark"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea
            value={editText}
            onChange={e => setEditText(e.target.value)}
            className="input text-xs"
            rows={3}
            autoFocus
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave() }
              if (e.key === 'Escape') { setEditText(entry.raw_text); setEditing(false) }
            }}
          />
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleSave} className="text-xs px-3 py-1.5">Save</Button>
            <Button variant="ghost"   onClick={() => { setEditText(entry.raw_text); setEditing(false) }} className="text-xs px-3 py-1.5">Cancel</Button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-text-light dark:text-text-dark leading-relaxed line-clamp-4 mb-3">
            {entry.raw_text}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-muted-light dark:text-muted-dark">
            <span>
              {new Date(entry.entry_time).toLocaleString('en-GB', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
              })}
            </span>
            {entry.is_edited && <span className="italic opacity-70">(edited)</span>}
          </div>
        </>
      )}
    </div>
  )
}

function FolderCard({ type, count, onClick }) {
  const label = TYPE_LABEL[type] || '📝 Note'
  return (
    <button
      onClick={onClick}
      className="card p-4 text-left hover:border-muted-dark dark:hover:border-muted-dark transition-colors"
    >
      <FileText size={20} className="text-muted-light dark:text-muted-dark mb-3" />
      <p className="text-sm font-serif font-bold text-text-light dark:text-text-dark">{label}</p>
      <p className="text-[11px] text-muted-light dark:text-muted-dark mt-0.5">
        {count} entr{count !== 1 ? 'ies' : 'y'}
      </p>
    </button>
  )
}

function AddNoteSheet({ open, onClose, onAdd }) {
  const [input, setInput]   = useState('')
  const activeTags = useMemo(() => detectTags(input), [input])

  const handleSubmit = e => {
    e.preventDefault()
    if (!input.trim()) return
    onAdd(input.trim())
    setInput('')
    onClose()
  }

  return (
    <Sheet open={open} onClose={() => { setInput(''); onClose() }} title="New Entry">
      <form onSubmit={handleSubmit} className="space-y-4">
        {activeTags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {activeTags.map(({ tag, type }) => (
              <span key={tag} className="tag">{TYPE_LABEL[type] || type}</span>
            ))}
          </div>
        )}
        <div>
            <h3 className="block text-xs font-medium text-muted-light dark:text-muted-dark mb-1.5">
              Title
            </h3>
            <textarea name="title" 
            id="title-card" 
            autoFocus
            placeholder="Title" className="input" 
            rows={1}/>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-light dark:text-muted-dark mb-1.5">
            Entry *
          </label>
          <textarea
            // autoFocus required
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={"petrol 159 @e\ngym 45min @h\ncall mum @R 9pm"}
            className="input"
            rows={4}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e)
            }}
          />
        </div>
        <div className="flex gap-3">
          <Button variant="ghost"   type="button" onClick={() => { setInput(''); onClose() }} className="flex-1 justify-center">Cancel</Button>
          <Button variant="primary" type="submit" disabled={!input.trim()}                    className="flex-1 justify-center">Add</Button>
        </div>
      </form>
    </Sheet>
  )
}

export function Notes({ userId, isDemoMode }) {
  const { groupedEntries, entries, loading, addEntry, editEntry, deleteEntry } = useNotes({ userId, isDemoMode })
  const [showAdd, setShowAdd]       = useState(false)
  const [showHelp, setShowHelp]     = useState(false)
  const [search, setSearch]         = useState('')
  const [filterType, setFilterType] = useState('all')
  const [viewMode, setViewMode]     = useState('folders')
  const helpRef = useRef(null)

  useEffect(() => {
    const handler = e => {
      if (helpRef.current && !helpRef.current.contains(e.target)) setShowHelp(false)
    }
    if (showHelp) {
      document.addEventListener('mousedown', handler)
      return () => document.removeEventListener('mousedown', handler)
    }
  }, [showHelp])

  const folderGroups = useMemo(() => {
    const g = {}
    entries.forEach(e => {
      const t = e.parsed_type || 'casual'
      if (!g[t]) g[t] = []
      g[t].push(e)
    })
    return g
  }, [entries])

  const filtered = useMemo(() => {
    let list = entries
    if (filterType !== 'all') list = list.filter(e => e.parsed_type === filterType)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(e => e.raw_text?.toLowerCase().includes(q))
    }
    return list
  }, [entries, filterType, search])

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-text-light dark:text-text-dark">Notes</h1>
          <p className="text-xs text-muted-light dark:text-muted-dark mt-0.5">
            {entries.length} entr{entries.length !== 1 ? 'ies' : 'y'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {/* Help */}
          <div className="relative" ref={helpRef}>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className={`btn-icon ${showHelp ? 'bg-border-dark' : ''}`}
              title="@ Commands"
            >
              <HelpCircle size={16} />
            </button>
            {showHelp && (
              <div className="absolute right-0 top-10 w-80 max-h-96 overflow-y-auto
                              bg-surface-light dark:bg-surface-dark
                              border border-border-light dark:border-border-dark
                              rounded-xl shadow-card-dark p-4 z-50 animate-slide-up"
                   style={{ borderWidth: '0.5px' }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-serif font-bold text-text-light dark:text-text-dark">
                    @ Commands
                  </h3>
                  <button onClick={() => setShowHelp(false)} className="btn-icon w-6 h-6">
                    <X size={13} />
                  </button>
                </div>
                <div className="space-y-3">
                  {getAvailableCommands().map(cmd => (
                    <div key={cmd.tag} className="flex items-start gap-2.5 text-xs">
                      <code className="font-mono font-bold text-text-dark bg-border-dark px-2 py-0.5 rounded text-[11px] flex-shrink-0">
                        {cmd.tag}
                      </code>
                      <div>
                        <p className="text-text-light dark:text-text-dark">{cmd.description}</p>
                        <p className="text-muted-light dark:text-muted-dark mt-0.5 italic">{cmd.example}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search entries…"
          className="input pl-8 pr-8 text-sm"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 btn-icon w-5 h-5"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* View toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {['folders', 'all'].map(m => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                viewMode === m
                  ? 'bg-text-light dark:bg-text-dark text-bg-light dark:text-bg-dark'
                  : 'text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark'
              }`}
            >
              {m === 'folders' ? 'Folders' : 'All'}
            </button>
          ))}
        </div>

        {viewMode === 'all' && (
          <div className="flex gap-1 flex-wrap">
            {['all', 'expense', 'health', 'reminder', 'casual'].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition-all ${
                  filterType === t
                    ? 'bg-text-light dark:bg-text-dark text-bg-light dark:text-bg-dark'
                    : 'text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 rounded-xl bg-border-light dark:bg-border-dark animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-3xl mb-3">✍️</p>
          <p className="text-sm text-muted-light dark:text-muted-dark">No entries yet.</p>
          <p className="text-xs text-muted-light dark:text-muted-dark mt-1 opacity-70">
            Try <code className="bg-border-dark px-1 rounded text-text-dark">coffee 80 @e</code>
          </p>
        </div>
      ) : viewMode === 'folders' ? (
        <div className="grid grid-cols-2 gap-3">
          {Object.keys(folderGroups).map(type => (
            <FolderCard
              key={type}
              type={type}
              count={folderGroups[type].length}
              onClick={() => { setFilterType(type); setViewMode('all') }}
            />
          ))}
          <button
            onClick={() => setShowAdd(true)}
            className="card p-4 flex flex-col items-center justify-center gap-2
                       border-dashed hover:border-muted-dark dark:hover:border-muted-dark
                       transition-colors min-h-[100px]"
          >
            <FolderPlus size={20} className="text-muted-light dark:text-muted-dark" />
            <span className="text-xs text-muted-light dark:text-muted-dark">New entry</span>
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-serif font-bold text-text-light dark:text-text-dark">
              {filterType === 'all' ? 'All Entries' : TYPE_LABEL[filterType] || filterType}
            </h2>
            <span className="text-xs text-muted-light dark:text-muted-dark">
              {filtered.length}
            </span>
          </div>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-light dark:text-muted-dark text-center py-12">
              No entries found.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map(entry => (
                <NoteCard key={entry.id} entry={entry} onEdit={editEntry} onDelete={deleteEntry} />
              ))}
            </div>
          )}
        </div>
      )}

      <AddNoteSheet open={showAdd} onClose={() => setShowAdd(false)} onAdd={handleAddNote} />

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-24 right-7 w-12 h-12 rounded-2xl
                   bg-text-light dark:bg-text-dark
                   text-bg-light dark:text-bg-dark
                   shadow-card-dark hover:opacity-80
                   transition-all flex items-center justify-center z-20"
        title="New entry"
      >
        <Plus size={20} />
      </button>
    </div>
  )

  function handleAddNote(text) {
    addEntry(text)
  }
}
