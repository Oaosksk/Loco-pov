import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useNotes } from '../hooks/useNotes'
import { detectTags, getTagColor, getAvailableCommands } from '../lib/parseEntry'
import { Send, Edit3, Trash2, ChevronDown, HelpCircle, X, Check, Search } from 'lucide-react'

function formatDayHeader(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  const isToday = dateStr === today.toISOString().split('T')[0]
  const isYesterday = dateStr === yesterday.toISOString().split('T')[0]
  
  if (isToday) return '📅 Today'
  if (isYesterday) return '📅 Yesterday'
  
  return `📅 ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
}

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function TypeBadge({ type }) {
  const color = getTagColor(type)
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${color.bg} ${color.text}`}>
      {color.label}
    </span>
  )
}

function EntryLine({ entry, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(entry.raw_text)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const editRef = useRef(null)

  useEffect(() => {
    if (editing && editRef.current) {
      editRef.current.focus()
      editRef.current.setSelectionRange(editText.length, editText.length)
    }
  }, [editing])

  const handleSaveEdit = () => {
    if (editText.trim() && editText.trim() !== entry.raw_text) {
      onEdit(entry.id, editText.trim())
    }
    setEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSaveEdit()
    }
    if (e.key === 'Escape') {
      setEditText(entry.raw_text)
      setEditing(false)
    }
  }

  return (
    <div className="group flex items-start gap-3 py-2.5 px-3 -mx-3 rounded-xl hover:bg-surface-light dark:hover:bg-[#111111] transition-colors">
      {/* Time */}
      <span className="text-[11px] text-muted-light dark:text-muted-dark font-mono mt-0.5 w-12 flex-shrink-0">
        {formatTime(entry.entry_time)}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex gap-2">
            <input
              ref={editRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="input flex-1 text-sm py-1.5"
            />
            <button onClick={handleSaveEdit} className="btn-icon text-green-500">
              <Check size={14} />
            </button>
            <button onClick={() => { setEditText(entry.raw_text); setEditing(false) }} className="btn-icon text-muted-light dark:text-muted-dark">
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm text-text-light dark:text-text-dark leading-relaxed">
              {entry.raw_text}
            </p>
            <TypeBadge type={entry.parsed_type} />
            {entry.is_edited && (
              <span className="text-[10px] text-muted-light dark:text-muted-dark italic">(edited)</span>
            )}
          </div>
        )}

        {/* Parsed data preview */}
        {!editing && entry.parsed_type === 'expense' && entry.parsed_data?.amount > 0 && (
          <p className="text-xs text-green-500 mt-0.5">
            ₹{entry.parsed_data.amount} · {entry.parsed_data.category}
          </p>
        )}
        {!editing && entry.parsed_type === 'health' && entry.parsed_data?.value && (
          <p className="text-xs text-red-400 mt-0.5">
            {entry.parsed_data.value}{entry.parsed_data.unit} · {entry.parsed_data.metric}
          </p>
        )}
        {!editing && entry.parsed_type === 'reminder' && entry.parsed_data?.remind_at && (
          <p className="text-xs text-blue-400 mt-0.5">
            ⏰ {new Date(entry.parsed_data.remind_at).toLocaleString('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={() => setEditing(true)}
          className="btn-icon"
          title="Edit"
        >
          <Edit3 size={13} />
        </button>
        <button
          onClick={() => {
            if (confirmDelete) {
              onDelete(entry.id)
            } else {
              setConfirmDelete(true)
              setTimeout(() => setConfirmDelete(false), 3000)
            }
          }}
          className={`btn-icon ${confirmDelete ? 'text-red-500' : ''}`}
          title={confirmDelete ? 'Click again to confirm' : 'Delete'}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

function DayBlock({ date, entries, onEdit, onDelete }) {
  const [collapsed, setCollapsed] = useState(false)
  const today = new Date().toISOString().split('T')[0]
  const isToday = date === today

  return (
    <div className="animate-fade-in">
      {/* Day header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 w-full text-left mb-2 group"
      >
        <h2 className="text-sm font-bold font-serif text-text-light dark:text-text-dark">
          {formatDayHeader(date)}
        </h2>
        <span className="text-xs text-muted-light dark:text-muted-dark">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </span>
        <ChevronDown
          size={14}
          className={`text-muted-light dark:text-muted-dark transition-transform ${collapsed ? '-rotate-90' : ''}`}
        />
        {isToday && (
          <span className="ml-auto text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            LIVE
          </span>
        )}
      </button>

      {/* Entries */}
      {!collapsed && (
        <div className="ml-1 border-l-2 border-border-light dark:border-border-dark pl-4 space-y-0.5">
          {entries.map(entry => (
            <EntryLine
              key={entry.id}
              entry={entry}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CommandHelp({ show, onClose }) {
  if (!show) return null
  const commands = getAvailableCommands()

  return (
    <div className="card p-4 mb-4 animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold font-serif text-text-light dark:text-text-dark">@ Commands</h3>
        <button onClick={onClose} className="btn-icon"><X size={14} /></button>
      </div>
      <div className="space-y-2">
        {commands.map(cmd => (
          <div key={cmd.tag} className="flex items-start gap-3 text-xs">
            <code className="text-primary font-mono font-bold bg-primary/10 px-1.5 py-0.5 rounded flex-shrink-0">
              {cmd.tag}
            </code>
            <div className="flex-1 min-w-0">
              <p className="text-text-light dark:text-text-dark font-medium">{cmd.description}</p>
              <p className="text-muted-light dark:text-muted-dark mt-0.5">
                e.g. <span className="text-text-light dark:text-text-dark/70">{cmd.example}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Notes({ userId, isDemoMode }) {
  const { groupedEntries, entries, loading, addEntry, editEntry, deleteEntry } = useNotes({ userId, isDemoMode })
  const [input, setInput] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const inputRef = useRef(null)

  // Detect tags while typing
  const activeTags = useMemo(() => detectTags(input), [input])

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!input.trim()) return
    await addEntry(input.trim())
    setInput('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Filter entries if searching
  const displayGroups = useMemo(() => {
    if (!search.trim()) return groupedEntries
    const q = search.toLowerCase()
    return groupedEntries
      .map(group => ({
        ...group,
        entries: group.entries.filter(e =>
          e.raw_text?.toLowerCase().includes(q) ||
          e.parsed_type?.toLowerCase().includes(q)
        ),
      }))
      .filter(group => group.entries.length > 0)
  }, [groupedEntries, search])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-text-light dark:text-text-dark">
            Journal
          </h1>
          <p className="text-sm text-muted-light dark:text-muted-dark mt-0.5">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'} logged
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`btn-icon ${showSearch ? 'text-primary' : ''}`}
            title="Search entries"
          >
            <Search size={18} />
          </button>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className={`btn-icon ${showHelp ? 'text-primary' : ''}`}
            title="Help with @ commands"
          >
            <HelpCircle size={18} />
          </button>
        </div>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="relative animate-slide-up">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search entries..."
            className="input pl-9 pr-8 text-sm"
            autoFocus
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
      )}

      {/* Command help */}
      <CommandHelp show={showHelp} onClose={() => setShowHelp(false)} />

      {/* Input area — always visible, no "create note" button needed */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="card p-3">
          {/* Tag detection chips */}
          {activeTags.length > 0 && (
            <div className="flex gap-2 mb-2 flex-wrap">
              {activeTags.map(({ tag, type }) => {
                const color = getTagColor(type)
                return (
                  <span
                    key={tag}
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${color.bg} ${color.text} animate-fade-in`}
                  >
                    {color.label}
                  </span>
                )
              })}
            </div>
          )}

          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write something... use @e for expenses, @h for health, @R for reminders"
              rows={1}
              className="flex-1 bg-transparent text-sm text-text-light dark:text-text-dark placeholder:text-muted-light dark:placeholder:text-muted-dark focus:outline-none resize-none"
              style={{ minHeight: '36px', maxHeight: '120px' }}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-30 hover:bg-primary-light transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </form>

      {/* Journal entries grouped by day */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-5 w-40 bg-border-light dark:bg-border-dark rounded animate-pulse" />
              <div className="h-10 bg-border-light dark:bg-border-dark rounded-xl animate-pulse" />
              <div className="h-10 bg-border-light dark:bg-border-dark rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      ) : displayGroups.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl mb-4 block">📝</span>
          <p className="text-muted-light dark:text-muted-dark font-medium">
            {search ? 'No entries match your search.' : 'Start your journal! Just type and hit Enter.'}
          </p>
          <p className="text-xs text-muted-light dark:text-muted-dark mt-2">
            Try: <code className="text-primary">coffee 80 @e</code> or <code className="text-primary">gym 45min @h</code>
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {displayGroups.map(group => (
            <DayBlock
              key={group.date}
              date={group.date}
              entries={group.entries}
              onEdit={editEntry}
              onDelete={deleteEntry}
            />
          ))}
        </div>
      )}
    </div>
  )
}
