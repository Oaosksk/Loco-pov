import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useNotes } from '../hooks/useNotes'
import { detectTags, getTagColor, getAvailableCommands } from '../lib/parseEntry'
import { Send, Edit3, Trash2, HelpCircle, X, Check, Search, Plus, MoreVertical, FolderPlus, FileText, Calendar } from 'lucide-react'
import { Sheet } from '../components/ui/Sheet'
import { Button } from '../components/ui/Button'

function NoteCard({ entry, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(entry.raw_text)
  const [editTitle, setEditTitle] = useState(entry.title || '')
  const color = getTagColor(entry.parsed_type)

  const handleSave = () => {
    if (editText.trim() && editText.trim() !== entry.raw_text) {
      onEdit(entry.id, editText.trim(), editTitle.trim())
    }
    setEditing(false)
  }

  const bgColors = {
    expense: 'bg-green-50 dark:bg-green-900/10',
    health: 'bg-red-50 dark:bg-red-900/10',
    reminder: 'bg-blue-50 dark:bg-blue-900/10',
    casual: 'bg-yellow-50 dark:bg-yellow-900/10',
    subscription: 'bg-purple-50 dark:bg-purple-900/10',
    goal: 'bg-pink-50 dark:bg-pink-900/10',
  }

  return (
    <div className={`card p-4 ${bgColors[entry.parsed_type] || 'bg-surface-light dark:bg-surface-dark'} group relative`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <FileText size={16} className={color.text} />
          <span className={`text-xs font-semibold ${color.text}`}>{color.label}</span>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="btn-icon opacity-0 group-hover:opacity-100">
            <MoreVertical size={14} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-lg p-2 z-10 min-w-[120px]">
              <button onClick={() => { setEditing(true); setShowMenu(false) }} className="w-full text-left px-3 py-2 text-sm hover:bg-bg-light dark:hover:bg-bg-dark rounded-lg flex items-center gap-2">
                <Edit3 size={14} /> Edit
              </button>
              <button onClick={() => { onDelete(entry.id); setShowMenu(false) }} className="w-full text-left px-3 py-2 text-sm hover:bg-bg-light dark:hover:bg-bg-dark rounded-lg flex items-center gap-2 text-red-500">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {editing ? (
        <div className="space-y-2">
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Note title (optional)"
            className="input w-full text-sm font-semibold"
          />
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="input w-full text-sm"
            rows={3}
            autoFocus
          />
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleSave}>Save</Button>
            <Button variant="ghost" size="sm" onClick={() => { setEditText(entry.raw_text); setEditTitle(entry.title || ''); setEditing(false) }}>Cancel</Button>
          </div>
        </div>
      ) : (
        <>
          {entry.title && (
            <h4 className="font-bold text-text-light dark:text-text-dark mb-2">{entry.title}</h4>
          )}
          <p className="text-sm text-text-light dark:text-text-dark mb-3 line-clamp-3">{entry.raw_text}</p>
          <div className="flex items-center justify-between text-xs text-muted-light dark:text-muted-dark">
            <span>{new Date(entry.entry_time).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
            {entry.is_edited && <span className="italic">(edited)</span>}
          </div>
        </>
      )}
    </div>
  )
}

function FolderCard({ type, count, onClick }) {
  const color = getTagColor(type)
  const bgColors = {
    expense: 'bg-green-100 dark:bg-green-900/20',
    health: 'bg-red-100 dark:bg-red-900/20',
    reminder: 'bg-blue-100 dark:bg-blue-900/20',
    casual: 'bg-yellow-100 dark:bg-yellow-900/20',
    subscription: 'bg-purple-100 dark:bg-purple-900/20',
    goal: 'bg-pink-100 dark:bg-pink-900/20',
  }

  return (
    <button
      onClick={onClick}
      className={`card p-5 ${bgColors[type] || 'bg-surface-light dark:bg-surface-dark'} hover:scale-105 transition-transform text-left`}
    >
      <div className="flex items-center justify-between mb-3">
        <FileText size={32} className={color.text} />
        <MoreVertical size={16} className="text-muted-light dark:text-muted-dark" />
      </div>
      <h3 className="font-bold text-text-light dark:text-text-dark mb-1">{color.label}</h3>
      <p className="text-xs text-muted-light dark:text-muted-dark">{count} note{count !== 1 ? 's' : ''}</p>
    </button>
  )
}

function AddNoteSheet({ open, onClose, onAdd }) {
  const [input, setInput] = useState('')
  const [title, setTitle] = useState('')
  const activeTags = useMemo(() => detectTags(input), [input])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    onAdd(input.trim(), title.trim())
    setInput('')
    setTitle('')
    onClose()
  }

  return (
    <Sheet open={open} onClose={() => { setInput(''); setTitle(''); onClose() }} title="New Note">
      <form onSubmit={handleSubmit} className="space-y-4">
        {activeTags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {activeTags.map(({ tag, type }) => {
              const color = getTagColor(type)
              return (
                <span key={tag} className={`tag ${color.bg} ${color.text}`}>
                  {color.label}
                </span>
              )
            })}
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-1">Note Title (Optional)</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Morning Routine, Shopping List"
            className="input"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-light dark:text-muted-dark mb-1">Note Content *</label>
          <textarea
            autoFocus
            required
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write something... use @e for expenses, @h for health, @R for reminders"
            className="input"
            rows={4}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={() => { setInput(''); setTitle(''); onClose() }} className="flex-1 justify-center">Cancel</Button>
          <Button variant="primary" type="submit" className="flex-1 justify-center">Create Note</Button>
        </div>
      </form>
    </Sheet>
  )
}

export function Notes({ userId, isDemoMode }) {
  const { groupedEntries, entries, loading, addEntry, editEntry, deleteEntry } = useNotes({ userId, isDemoMode })
  const [showAddNote, setShowAddNote] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [viewMode, setViewMode] = useState('folders') // 'folders' or 'all'
  const helpRef = useRef(null)

  // Close help dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (helpRef.current && !helpRef.current.contains(e.target)) {
        setShowHelp(false)
      }
    }
    if (showHelp) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showHelp])

  // Group entries by type for folder view
  const folderGroups = useMemo(() => {
    const groups = {}
    entries.forEach(entry => {
      const type = entry.parsed_type || 'casual'
      if (!groups[type]) groups[type] = []
      groups[type].push(entry)
    })
    return groups
  }, [entries])

  // Filter entries
  const filteredEntries = useMemo(() => {
    let list = entries
    if (filterType !== 'all') {
      list = list.filter(e => e.parsed_type === filterType)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(e => e.raw_text?.toLowerCase().includes(q))
    }
    return list
  }, [entries, filterType, search])

  const handleAddNote = async (text, title) => {
    await addEntry(text, title)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-text-light dark:text-text-dark">MY NOTES</h1>
          <p className="text-sm text-muted-light dark:text-muted-dark mt-0.5">
            {entries.length} note{entries.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative" ref={helpRef}>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className={`btn-icon ${showHelp ? 'text-primary' : ''}`}
              title="Help"
            >
              <HelpCircle size={18} />
            </button>
            
            {/* Floating Help Dropdown */}
            {showHelp && (
              <div className="absolute right-0 top-12 w-96 max-h-[500px] overflow-y-auto bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl shadow-2xl p-5 z-50 animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold font-serif text-text-light dark:text-text-dark">@ Commands</h3>
                  <button onClick={() => setShowHelp(false)} className="btn-icon">
                    <X size={14} />
                  </button>
                </div>
                <div className="space-y-3">
                  {getAvailableCommands().map(cmd => (
                    <div key={cmd.tag} className="flex items-start gap-3 text-xs">
                      <code className="text-primary font-mono font-bold bg-primary/10 px-2 py-1 rounded min-w-[70px] text-center flex-shrink-0">
                        {cmd.tag}
                      </code>
                      <div className="flex-1 min-w-0">
                        <p className="text-text-light dark:text-text-dark font-semibold mb-1">{cmd.description}</p>
                        <p className="text-muted-light dark:text-muted-dark text-[11px]">
                          <span className="font-medium">Example:</span> <span className="text-text-light dark:text-text-dark/70 italic">{cmd.example}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Button variant="primary" onClick={() => setShowAddNote(true)}>
            <Plus size={16} />
            Add Note
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="input pl-9 pr-8 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* View Toggle & Filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('folders')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              viewMode === 'folders'
                ? 'bg-primary text-white'
                : 'bg-surface-light dark:bg-surface-dark text-muted-light dark:text-muted-dark hover:text-primary'
            }`}
          >
            Folders
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              viewMode === 'all'
                ? 'bg-primary text-white'
                : 'bg-surface-light dark:bg-surface-dark text-muted-light dark:text-muted-dark hover:text-primary'
            }`}
          >
            All Notes
          </button>
        </div>

        {viewMode === 'all' && (
          <div className="flex gap-2">
            {['all', 'expense', 'health', 'reminder', 'casual'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
                  filterType === type
                    ? 'bg-primary text-white'
                    : 'bg-surface-light dark:bg-surface-dark text-muted-light dark:text-muted-dark hover:text-primary'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-40 bg-border-light dark:bg-border-dark rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl mb-4 block">📝</span>
          <p className="text-muted-light dark:text-muted-dark font-medium mb-2">
            No notes yet. Create your first note!
          </p>
          <p className="text-xs text-muted-light dark:text-muted-dark">
            Try: <code className="text-primary">coffee 80 @e</code> or <code className="text-primary">gym 45min @h</code>
          </p>
        </div>
      ) : viewMode === 'folders' ? (
        <div>
          <h2 className="text-lg font-bold font-serif text-text-light dark:text-text-dark mb-4">Recent Folders</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.keys(folderGroups).map(type => (
              <FolderCard
                key={type}
                type={type}
                count={folderGroups[type].length}
                onClick={() => {
                  setFilterType(type)
                  setViewMode('all')
                }}
              />
            ))}
            <button
              onClick={() => setShowAddNote(true)}
              className="card p-5 border-2 border-dashed border-border-light dark:border-border-dark hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2"
            >
              <FolderPlus size={32} className="text-muted-light dark:text-muted-dark" />
              <span className="text-sm font-semibold text-muted-light dark:text-muted-dark">New Note</span>
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold font-serif text-text-light dark:text-text-dark">
              {filterType === 'all' ? 'All Notes' : getTagColor(filterType).label}
            </h2>
            <span className="text-sm text-muted-light dark:text-muted-dark">
              {filteredEntries.length} note{filteredEntries.length !== 1 ? 's' : ''}
            </span>
          </div>
          {filteredEntries.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-light dark:text-muted-dark">No notes found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEntries.map(entry => (
                <NoteCard
                  key={entry.id}
                  entry={entry}
                  onEdit={editEntry}
                  onDelete={deleteEntry}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <AddNoteSheet open={showAddNote} onClose={() => setShowAddNote(false)} onAdd={handleAddNote} />
    </div>
  )
}
