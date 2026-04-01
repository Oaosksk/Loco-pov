import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  X, Mic, MicOff, Image, Sparkles, Type, MoreVertical,
  Search, Trash2, Settings, Share2, Sun, Undo2, Redo2,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Highlighter, Palette, ChevronDown,
  Check, Loader2, ArrowLeft
} from 'lucide-react'

const THEMES = {
  dark:  { label: 'Dark',  bg: '#0f0f0f', surface: '#1a1a1a', text: '#e8e8e8', muted: '#555', border: '#2a2a2a', accent: '#e8e8e8' },
  light: { label: 'Light', bg: '#fafaf8', surface: '#ffffff', text: '#1a1a1a', muted: '#888', border: '#e5e5e5', accent: '#1a1a1a' },
  warm:  { label: 'Warm',  bg: '#1c1510', surface: '#231c16', text: '#e8ddd0', muted: '#7a6a58', border: '#332820', accent: '#d4a96a' },
  cool:  { label: 'Cool',  bg: '#0d1117', surface: '#161b22', text: '#cdd9e5', muted: '#4d6075', border: '#1e2836', accent: '#79c0ff' },
}

const TEXT_SIZES = ['10px','12px','14px','16px','18px','20px','24px','28px','32px']
const TEXT_COLORS = ['#e8e8e8','#ff6b6b','#ffd93d','#6bcb77','#4ecdc4','#74b9ff','#a29bfe','#fd79a8','#888','#ffffff']
const HIGHLIGHT_COLORS = ['#ffd93d55','#ff6b6b44','#6bcb7744','#74b9ff44','#a29bfe44']

function formatStamp(date) {
  if (!date) return ''
  return date.toLocaleString('en-IN', {
    day: 'numeric', month: 'long',
    hour: 'numeric', minute: '2-digit', hour12: true
  })
}

function ToolBtn({ onClick, active, title, children, style = {} }) {
  return (
    <button
      onMouseDown={e => { e.preventDefault(); onClick && onClick() }}
      title={title}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
        background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
        color: 'inherit', flexShrink: 0, transition: 'background 0.15s',
        ...style
      }}
    >
      {children}
    </button>
  )
}

function ColorPicker({ colors, onSelect, onClose }) {
  return (
    <div style={{
      position: 'absolute', top: '110%', left: 0, zIndex: 200,
      background: 'var(--sh-surface)', border: '0.5px solid var(--sh-border)',
      borderRadius: 12, padding: 10, display: 'flex', flexWrap: 'wrap',
      gap: 6, width: 160, boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
    }}>
      {colors.map(c => (
        <button key={c} onMouseDown={e => { e.preventDefault(); onSelect(c); onClose() }}
          style={{ width: 24, height: 24, borderRadius: 6, background: c, border: '0.5px solid rgba(255,255,255,0.2)', cursor: 'pointer' }} />
      ))}
    </div>
  )
}

function SizePicker({ sizes, onSelect, onClose }) {
  return (
    <div style={{
      position: 'absolute', top: '110%', left: 0, zIndex: 200,
      background: 'var(--sh-surface)', border: '0.5px solid var(--sh-border)',
      borderRadius: 12, padding: 6, display: 'flex', flexDirection: 'column',
      gap: 2, width: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
    }}>
      {sizes.map(s => (
        <button key={s} onMouseDown={e => { e.preventDefault(); onSelect(s); onClose() }}
          style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: 'transparent',
            color: 'var(--sh-text)', cursor: 'pointer', textAlign: 'left', fontSize: s }}
        >{s}</button>
      ))}
    </div>
  )
}

function ThreeDotMenu({ onFind, onDelete, onShare, onSettings, theme, onTheme, onClose }) {
  const items = [
    { icon: <Search size={13}/>, label: 'Find', action: onFind },
    { icon: <Trash2 size={13}/>, label: 'Delete', action: onDelete, danger: true },
    { icon: <Share2 size={13}/>, label: 'Share', action: onShare },
    { icon: <Settings size={13}/>, label: 'Settings', action: onSettings },
  ]

  return (
    <div style={{
      position: 'absolute', right: 0, top: '110%', zIndex: 300, minWidth: 200,
      background: 'var(--sh-surface)', border: '0.5px solid var(--sh-border)',
      borderRadius: 14, overflow: 'hidden', boxShadow: '0 12px 48px rgba(0,0,0,0.5)'
    }}>
      {items.map(item => (
        <button key={item.label} onMouseDown={e => { e.preventDefault(); item.action?.(); onClose() }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', border: 'none', background: 'transparent',
            color: item.danger ? '#ff6b6b' : 'var(--sh-text)', cursor: 'pointer',
            fontSize: 13, textAlign: 'left'
          }}>
          {item.icon} {item.label}
        </button>
      ))}

      <div style={{ height: '0.5px', background: 'var(--sh-border)', margin: '4px 0' }} />

      <div style={{ padding: '8px 14px 6px' }}>
        <p style={{ fontSize: 10, color: 'var(--sh-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Theme</p>
        <div style={{ display: 'flex', gap: 6 }}>
          {Object.entries(THEMES).map(([key, t]) => (
            <button key={key} onMouseDown={e => { e.preventDefault(); onTheme(key); onClose() }}
              title={t.label}
              style={{
                width: 28, height: 28, borderRadius: 8, border: theme === key ? `2px solid ${t.accent}` : '0.5px solid var(--sh-border)',
                background: t.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
              {theme === key && <Check size={12} color={t.accent} />}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          {Object.entries(THEMES).map(([key, t]) => (
            <span key={key} style={{ width: 28, textAlign: 'center', fontSize: 9, color: 'var(--sh-muted)' }}>{t.label}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function FindBar({ onClose }) {
  const [query, setQuery] = useState('')
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 12px', background: 'var(--sh-bg)', borderBottom: '0.5px solid var(--sh-border)'
    }}>
      <Search size={13} color="var(--sh-muted)" />
      <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
        placeholder="Find in note…"
        style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none',
          color: 'var(--sh-text)', fontSize: 13 }} />
      <button onMouseDown={e => { e.preventDefault(); onClose() }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sh-muted)', display: 'flex' }}>
        <X size={13} />
      </button>
    </div>
  )
}

function AISummaryModal({ content, onClose }) {
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!content.trim()) { setSummary('No content to summarize.'); setLoading(false); return }
    setLoading(true)
    ;(async () => {
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            messages: [{
              role: 'user',
              content: `Summarize the following note in 2-4 concise bullet points. Be direct and useful:\n\n${content}`
            }]
          })
        })
        const data = await res.json()
        setSummary(data.content?.[0]?.text || 'Could not generate summary.')
      } catch {
        setSummary('Failed to connect to AI. Please try again.')
      } finally { setLoading(false) }
    })()
  }, [content])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 400, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'rgb(0, 0, 0)', backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'var(--sh-surface)', border: '0.5px solid var(--sh-border)',
        borderRadius: 18, padding: 24, maxWidth: 400, width: '90%',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} color="#a29bfe" />
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--sh-text)' }}>AI Summary</span>
          </div>
          <button onMouseDown={e => { e.preventDefault(); onClose() }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sh-muted)', display: 'flex' }}>
            <X size={15} />
          </button>
        </div>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--sh-muted)', fontSize: 13 }}>
            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Summarizing…
          </div>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--sh-text)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{summary}</p>
        )}
      </div>
    </div>
  )
}

export function Sheet({ open, onClose, title, children }) {
  const overlayRef      = useRef(null)
  const editorRef       = useRef(null)
  const fileInputRef    = useRef(null)

  const [theme, setTheme]           = useState('dark')
  const t = THEMES[theme]

  const [createdAt, setCreatedAt]   = useState(null)
  const [modifiedAt, setModifiedAt] = useState(null)
  const [isMobile, setIsMobile]     = useState(false) // ADDED: detect mobile vs desktop

  const history        = useRef([''])
  const histIdx        = useRef(0)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const [showTextMenu, setShowTextMenu]   = useState(false)
  const [showThreeDot, setShowThreeDot]   = useState(false)
  const [showColorPick, setShowColorPick] = useState(false)
  const [showHLPick, setShowHLPick]       = useState(false)
  const [showSizePick, setShowSizePick]   = useState(false)
  const [showFind, setShowFind]           = useState(false)
  const [showAI, setShowAI]               = useState(false)
  const [isListening, setIsListening]     = useState(false)
  const [aiContent, setAiContent]         = useState('')

  const recognitionRef = useRef(null)

  useEffect(() => {
    if (open) {
      const now = new Date()
      setCreatedAt(now)
      setModifiedAt(now)
    } else {
      setCreatedAt(null)
      setModifiedAt(null)
    }
  }, [open])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 600)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const pushHistory = useCallback((html) => {
    const h = history.current
    const i = histIdx.current
    history.current = [...h.slice(0, i + 1), html]
    histIdx.current = history.current.length - 1
    setCanUndo(histIdx.current > 0)
    setCanRedo(false)
  }, [])

  const handleUndo = useCallback(() => {
    if (histIdx.current > 0) {
      histIdx.current--
      if (editorRef.current) editorRef.current.innerHTML = history.current[histIdx.current]
      setCanUndo(histIdx.current > 0)
      setCanRedo(true)
    }
  }, [])

  const handleRedo = useCallback(() => {
    if (histIdx.current < history.current.length - 1) {
      histIdx.current++
      if (editorRef.current) editorRef.current.innerHTML = history.current[histIdx.current]
      setCanUndo(true)
      setCanRedo(histIdx.current < history.current.length - 1)
    }
  }, [])

  const execCmd = useCallback((cmd, value = null) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, value)
    pushHistory(editorRef.current?.innerHTML || '')
  }, [pushHistory])

  const toggleVoice = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { alert('Speech recognition not supported in this browser.'); return }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const rec = new SR()
    rec.continuous = true
    rec.interimResults = false
    rec.lang = 'en-US'
    rec.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map(r => r[0].transcript).join(' ')
      if (editorRef.current) {
        editorRef.current.focus()
        document.execCommand('insertText', false, ' ' + transcript)
        pushHistory(editorRef.current.innerHTML)
      }
    }
    rec.onerror = () => setIsListening(false)
    rec.onend   = () => setIsListening(false)
    rec.start()
    recognitionRef.current = rec
    setIsListening(true)
  }, [isListening, pushHistory])

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      execCmd('insertImage', ev.target.result)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }, [execCmd])

  const handleAI = () => {
    const text = editorRef.current?.innerText || ''
    setAiContent(text)
    setShowAI(true)
  }

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handler)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  useEffect(() => {
    const handler = () => {
      setShowThreeDot(false)
      setShowTextMenu(false)
      setShowColorPick(false)
      setShowHLPick(false)
      setShowSizePick(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!open) return null

  const cssVars = {
    '--sh-bg':      t.bg,
    '--sh-surface': t.surface,
    '--sh-text':    t.text,
    '--sh-muted':   t.muted,
    '--sh-border':  t.border,
    '--sh-accent':  t.accent,
  }

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .sh-editor { outline: none; min-height: 200px; }
        .sh-editor img { max-width: 100%; border-radius: 10px; margin: 8px 0; }
        .sh-toolbtn:hover { background: rgba(128,128,128,0.15) !important; }
        .sh-toolbtn-active { background: rgba(255,255,255,0.15) !important; }
        .sh-recording { animation: pulse 1s infinite alternate; }
        @keyframes pulse { from { opacity: 1; } to { opacity: 0.4; } }
      `}</style>

      <div
        ref={overlayRef}
        onMouseDown={(e) => e.target === overlayRef.current && onClose()}
        style={{
          position: 'fixed', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease',
          ...cssVars
        }}
      >
        {/* Backdrop */}
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0, 0, 0, 0.13)',
          backdropFilter: 'blur(4px)',
        }} />

        {/* Panel */}
        <div
          onMouseDown={e => e.stopPropagation()}
          style={{
            position: 'relative', zIndex: 10,
            width: '100%', maxWidth: 600,
            background: 'var(--sh-surface)',
            borderTop: '0.5px solid var(--sh-border)',
            borderRadius: '24px 24px',
            maxHeight: '92svh',
            display: 'flex', flexDirection: 'column',
            animation: 'slideUp 0.25s cubic-bezier(.16,1,.3,1)',
            boxShadow: '0 -8px 80px rgba(0,0,0,0.6)',
          }}
        >
          {/* Find bar */}
          {showFind && <FindBar onClose={() => setShowFind(false)} />}

          {/* ── Header ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 18px 12px',
            borderBottom: '0.5px solid var(--sh-border)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', gap: 2, minWidth: 64 }}>
              {isMobile ? (
                <ToolBtn onClick={onClose} title="Back" style={{ color: 'var(--sh-text)' }}>
                  <ArrowLeft size={18} />
                </ToolBtn>
              ) : (
                <>
                  <ToolBtn onClick={handleUndo} title="Undo" style={{ opacity: canUndo ? 1 : 0.3, color: 'var(--sh-text)' }}>
                    <Undo2 size={15} />
                  </ToolBtn>
                  <ToolBtn onClick={handleRedo} title="Redo" style={{ opacity: canRedo ? 1 : 0.3, color: 'var(--sh-text)' }}>
                    <Redo2 size={15} />
                  </ToolBtn>
                </>
              )}
            </div>

            <h2 style={{
              fontFamily: 'Georgia, serif', fontWeight: 700,
              fontSize: 15, color: 'var(--sh-text)',
              position: 'absolute', left: '50%', transform: 'translateX(-50%)',
              pointerEvents: 'none'
            }}>
              {title}
            </h2>

            <div style={{ display: 'flex', gap: 2, alignItems: 'center', minWidth: 64, justifyContent: 'flex-end' }}>
              <div style={{ position: 'relative' }} onMouseDown={e => e.stopPropagation()}>
                <ToolBtn
                  onClick={() => { setShowThreeDot(v => !v); setShowTextMenu(false) }}
                  style={{ color: 'var(--sh-text)' }}
                  title="More options"
                >
                  <MoreVertical size={15} />
                </ToolBtn>
                {showThreeDot && (
                  <ThreeDotMenu
                    theme={theme}
                    onTheme={setTheme}
                    onFind={() => setShowFind(true)}
                    onDelete={() => { if (confirm('Delete this note?')) onClose() }}
                    onShare={() => navigator.share?.({ text: editorRef.current?.innerText })}
                    onSettings={() => {}}
                    onClose={() => setShowThreeDot(false)}
                  />
                )}
              </div>

              {!isMobile && (
                <ToolBtn onClick={onClose} title="Close" style={{ color: 'var(--sh-muted)' }}>
                  <X size={15} />
                </ToolBtn>
              )}
            </div>
          </div>

          {(createdAt || modifiedAt) && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 18px 8px',
              fontSize: 11, color: 'var(--sh-muted)',
              borderBottom: '0.5px solid var(--sh-border)',
              flexShrink: 0,
            }}>
              {createdAt && (
                <span>{formatStamp(createdAt)}</span>
              )}
              {createdAt && modifiedAt && modifiedAt.getTime() !== createdAt.getTime() && (
                <>
                  <span style={{ opacity: 0.4 }}>|</span>
                  <span>Edited {formatStamp(modifiedAt)}</span>
                </>
              )}
            </div>
          )}

          <div style={{
            display: 'flex', alignItems: 'center', gap: 2,
            padding: '8px 14px',
            borderBottom: '0.5px solid var(--sh-border)',
            background: 'var(--sh-bg)',
            overflowX: 'auto', flexShrink: 0,
          }}>
            <ToolBtn onClick={toggleVoice} title={isListening ? 'Stop recording' : 'Voice to text'}
              style={{ color: isListening ? '#ff6b6b' : 'var(--sh-text)' }}
            >
              <span className={isListening ? 'sh-recording' : ''}>
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </span>
            </ToolBtn>

            <ToolBtn onClick={() => fileInputRef.current?.click()} title="Upload image"
              style={{ color: 'var(--sh-text)' }}>
              <Image size={16} />
            </ToolBtn>
            <input ref={fileInputRef} type="file" accept="image/*"
              onChange={handleImageUpload} style={{ display: 'none' }} />

            <ToolBtn onClick={handleAI} title="AI Summary"
              style={{ color: 'var(--sh-text)' }}>
              <Sparkles size={16} />
            </ToolBtn>

            <div style={{ width: '0.5px', height: 20, background: 'var(--sh-border)', margin: '0 4px', flexShrink: 0 }} />

            <div style={{ position: 'relative' }} onMouseDown={e => e.stopPropagation()}>
              <ToolBtn
                onClick={() => { setShowTextMenu(v => !v); setShowThreeDot(false) }}
                active={showTextMenu}
                title="Text formatting"
                style={{ color: 'var(--sh-text)', gap: 3 }}
              >
                <Type size={15} />
                <ChevronDown size={10} style={{ opacity: 0.6 }} />
              </ToolBtn>

              {showTextMenu && (
                <div style={{
                  position: 'absolute', top: '110%', left: '50%', transform: 'translateX(-50%)',
                  zIndex: 200, background: 'var(--sh-surface)',
                  border: '0.5px solid var(--sh-border)',
                  borderRadius: 16, padding: '10px 12px',
                  boxShadow: '0 12px 48px rgba(0,0,0,0.5)',
                  display: 'flex', flexDirection: 'column', gap: 8,
                  minWidth: 240,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ position: 'relative' }} onMouseDown={e => e.stopPropagation()}>
                      <ToolBtn onClick={() => { setShowSizePick(v => !v); setShowColorPick(false); setShowHLPick(false) }}
                        title="Text size" style={{ color: 'var(--sh-text)', width: 36, fontSize: 11, fontWeight: 700 }}>
                        Aa
                      </ToolBtn>
                      {showSizePick && <SizePicker sizes={TEXT_SIZES} onSelect={s => execCmd('fontSize', s)} onClose={() => setShowSizePick(false)} />}
                    </div>

                    <div style={{ position: 'relative' }} onMouseDown={e => e.stopPropagation()}>
                      <ToolBtn onClick={() => { setShowColorPick(v => !v); setShowSizePick(false); setShowHLPick(false) }}
                        title="Text color" style={{ color: 'var(--sh-text)' }}>
                        <Palette size={14} />
                      </ToolBtn>
                      {showColorPick && <ColorPicker colors={TEXT_COLORS} onSelect={c => execCmd('foreColor', c)} onClose={() => setShowColorPick(false)} />}
                    </div>

                    <div style={{ position: 'relative' }} onMouseDown={e => e.stopPropagation()}>
                      <ToolBtn onClick={() => { setShowHLPick(v => !v); setShowColorPick(false); setShowSizePick(false) }}
                        title="Highlight" style={{ color: 'var(--sh-text)' }}>
                        <Highlighter size={14} />
                      </ToolBtn>
                      {showHLPick && <ColorPicker colors={HIGHLIGHT_COLORS} onSelect={c => execCmd('hiliteColor', c)} onClose={() => setShowHLPick(false)} />}
                    </div>
                  </div>

                  <div style={{ height: '0.5px', background: 'var(--sh-border)' }} />

                  <div style={{ display: 'flex', gap: 4 }}>
                    <ToolBtn onClick={() => execCmd('bold')}      title="Bold"      style={{ color: 'var(--sh-text)', fontWeight: 700, fontSize: 13 }}>B</ToolBtn>
                    <ToolBtn onClick={() => execCmd('italic')}    title="Italic"    style={{ color: 'var(--sh-text)', fontStyle: 'italic', fontSize: 13 }}>I</ToolBtn>
                    <ToolBtn onClick={() => execCmd('underline')} title="Underline" style={{ color: 'var(--sh-text)', textDecoration: 'underline', fontSize: 13 }}>U</ToolBtn>
                  </div>

                  <div style={{ display: 'flex', gap: 4 }}>
                    <ToolBtn onClick={() => execCmd('justifyLeft')}   title="Align left"   style={{ color: 'var(--sh-text)' }}><AlignLeft   size={14} /></ToolBtn>
                    <ToolBtn onClick={() => execCmd('justifyCenter')} title="Align center" style={{ color: 'var(--sh-text)' }}><AlignCenter size={14} /></ToolBtn>
                    <ToolBtn onClick={() => execCmd('justifyRight')}  title="Align right"  style={{ color: 'var(--sh-text)' }}><AlignRight  size={14} /></ToolBtn>
                  </div>

                  <div style={{ display: 'flex', gap: 4 }}>
                    <ToolBtn onClick={() => execCmd('insertUnorderedList')} title="Bullet list"   style={{ color: 'var(--sh-text)' }}><List        size={14} /></ToolBtn>
                    <ToolBtn onClick={() => execCmd('insertOrderedList')}   title="Numbered list" style={{ color: 'var(--sh-text)' }}><ListOrdered size={14} /></ToolBtn>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ overflowY: 'auto', flex: 1, padding: '16px 18px 24px' }}>
            {children ? (
              <div>{children}</div>
            ) : (
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="sh-editor"
                onInput={() => {
                  pushHistory(editorRef.current?.innerHTML || '')
                  setModifiedAt(new Date())
                }}
                style={{
                  color: 'var(--sh-text)', fontSize: 14, lineHeight: 1.75,
                  fontFamily: 'Georgia, serif', caretColor: 'var(--sh-accent)',
                  outline: 'none', minHeight: 200,
                }}
                data-placeholder="Start typing…"
              />
            )}
          </div>
        </div>
      </div>

      {showAI && <AISummaryModal content={aiContent} onClose={() => setShowAI(false)} />}
    </>
  )
}