import React, { useState, useRef, useEffect } from 'react'
import { Button } from '../components/ui/Button'
import { Send, Brain, Key, Trash2, Settings, X } from 'lucide-react'
import { chat, buildSystemPrompt } from '../lib/groq'

const LS_KEY = 'loco_groq_key'

const QUICK_ACTIONS = [
  'Summarise my goals',
  'What to focus on today?',
  'Motivate me',
  'Suggest a new goal',
  'What notes did I tag as ideas?',
]

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
        <Brain size={16} className="text-white" />
      </div>
      <div className="card px-4 py-3 max-w-fit">
        <div className="flex gap-1.5 items-center h-4">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  )
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex items-end gap-3 animate-fade-in ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold
                       ${isUser ? 'bg-accent text-white' : 'bg-primary text-white'}`}>
        {isUser ? '👤' : <Brain size={16} />}
      </div>

      {/* Bubble */}
      <div
        className={`rounded-2xl px-4 py-3 max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap
                    ${isUser
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark rounded-bl-sm'
                    }`}
      >
        {msg.content}
      </div>
    </div>
  )
}

function ApiKeySetup({ onSave }) {
  const [key, setKey] = useState('')
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="card p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Key size={28} className="text-primary" />
        </div>
        <h2 className="text-xl font-bold font-serif text-text-light dark:text-text-dark mb-2">
          Connect Groq AI
        </h2>
        <p className="text-sm text-muted-light dark:text-muted-dark mb-6 leading-relaxed">
          Get a free API key at{' '}
          <a
            href="https://console.groq.com"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline"
          >
            console.groq.com
          </a>
          . It's free, no credit card needed. Your key is only stored locally.
        </p>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="gsk_…"
          className="input mb-4 text-center"
        />
        <Button
          variant="primary"
          onClick={() => { if (key.trim()) onSave(key.trim()) }}
          disabled={!key.trim()}
          className="w-full justify-center"
        >
          Save API Key
        </Button>
        <p className="text-xs text-muted-light dark:text-muted-dark mt-4">
          Stored in <code>localStorage</code> only. Never sent to Loco servers.
        </p>
      </div>
    </div>
  )
}

export function AI({ user, notes, goals }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(LS_KEY) || '')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showKeyChange, setShowKeyChange] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const systemPrompt = buildSystemPrompt({ user, notes, goals })

  const saveKey = (key) => {
    localStorage.setItem(LS_KEY, key)
    setApiKey(key)
    setShowKeyChange(false)
  }

  const clearChat = () => {
    setMessages([])
    setError('')
  }

  const sendMessage = async (text) => {
    const content = (text || input).trim()
    if (!content || loading) return

    setInput('')
    setError('')

    const userMsg = { role: 'user', content }
    const history = [...messages, userMsg]
    setMessages(history)
    setLoading(true)

    // Keep last 10 messages for context
    const contextMessages = history.slice(-10)

    try {
      const reply = await chat({ apiKey, systemPrompt, messages: contextMessages })
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!apiKey) {
    return (
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-serif text-text-light dark:text-text-dark">AI Assistant</h1>
          <p className="text-sm text-muted-light dark:text-muted-dark mt-0.5">
            Powered by Groq — llama-3.3-70b-versatile
          </p>
        </div>
        <ApiKeySetup onSave={saveKey} />
      </div>
    )
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100svh - 7rem)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-text-light dark:text-text-dark">AI Assistant</h1>
          <p className="text-sm text-muted-light dark:text-muted-dark mt-0.5">
            Powered by Groq · llama-3.3-70b-versatile
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowKeyChange(true)}
            className="btn-icon"
            title="Change API key"
          >
            <Settings size={18} />
          </button>
          <button
            onClick={clearChat}
            className="btn-icon"
            title="Clear chat"
            disabled={messages.length === 0}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Change key modal */}
      {showKeyChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowKeyChange(false)} />
          <div className="relative card p-6 max-w-sm w-full z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold font-serif text-text-light dark:text-text-dark">Change API Key</h3>
              <button onClick={() => setShowKeyChange(false)} className="btn-icon"><X size={16} /></button>
            </div>
            <ApiKeySetup onSave={saveKey} />
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <Brain size={40} className="text-primary/30 mx-auto mb-3" />
            <p className="text-muted-light dark:text-muted-dark text-sm font-medium">
              Ask me anything about your notes and goals!
            </p>
            <p className="text-xs text-muted-light dark:text-muted-dark mt-1">
              I have full context about your data.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}

        {loading && <TypingIndicator />}

        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-300">
            ⚠️ {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick actions */}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2 py-3 overflow-x-auto">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action}
              onClick={() => sendMessage(action)}
              disabled={loading}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border border-border-light dark:border-border-dark
                         text-muted-light dark:text-muted-dark
                         hover:border-primary hover:text-primary dark:hover:text-primary
                         transition-all duration-200 bg-surface-light dark:bg-surface-dark"
            >
              {action}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-border-light dark:border-border-dark pt-4 mt-2">
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Ask Loco AI… (Enter to send, Shift+Enter for newline)"
            className="textarea flex-1 resize-none max-h-36 overflow-auto"
            style={{ minHeight: '44px' }}
          />
          <Button
            variant="primary"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 flex-shrink-0"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}
