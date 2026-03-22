import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Key, Wallet, Brain, Bell, Info, Eye, EyeOff, Check } from 'lucide-react'

const LS_GROQ_KEY  = 'loco_groq_key'
const LS_BUDGET    = 'loco_monthly_budget'
const LS_FUZZY     = 'loco_fuzzy_ai'
const LS_REMIND    = 'loco_remind_days'

function Section({ icon: Icon, title, desc, children }) {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-start gap-3">
        <Icon size={15} className="text-muted-light dark:text-muted-dark mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-serif font-bold text-text-light dark:text-text-dark">{title}</h3>
          {desc && <p className="text-[11px] text-muted-light dark:text-muted-dark mt-0.5">{desc}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer">
      <span className="text-sm text-text-light dark:text-text-dark">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${
          checked ? 'bg-text-dark' : 'bg-border-dark'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-bg-dark transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  )
}

export function Settings() {
  const { user } = useAuth()

  const [groqKey,   setGroqKey]   = useState(() => localStorage.getItem(LS_GROQ_KEY) || '')
  const [showKey,   setShowKey]   = useState(false)
  const [keySaved,  setKeySaved]  = useState(false)
  const [budget,    setBudget]    = useState(() => localStorage.getItem(LS_BUDGET) || '')
  const [fuzzyAI,   setFuzzyAI]   = useState(() => localStorage.getItem(LS_FUZZY) === 'true')
  const [remindDays,setRemindDays]= useState(() => localStorage.getItem(LS_REMIND) || '3')

  const saveKey = () => {
    localStorage.setItem(LS_GROQ_KEY, groqKey.trim())
    setKeySaved(true)
    setTimeout(() => setKeySaved(false), 2000)
  }

  const saveBudget = v => { setBudget(v); localStorage.setItem(LS_BUDGET, v) }
  const saveFuzzy  = v => { setFuzzyAI(v); localStorage.setItem(LS_FUZZY, String(v)) }
  const saveRemind = v => { setRemindDays(v); localStorage.setItem(LS_REMIND, v) }

  const name   = user?.user_metadata?.full_name || 'User'
  const email  = user?.email || 'demo@loco.app'
  const avatar = user?.user_metadata?.avatar_url

  return (
    <div className="space-y-4">

      <div>
        <h1 className="text-2xl font-serif font-bold text-text-light dark:text-text-dark">Settings</h1>
        <p className="text-xs text-muted-light dark:text-muted-dark mt-0.5">Loco v1.0.0</p>
      </div>

      {/* Profile */}
      <div className="card p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-border-dark flex items-center justify-center overflow-hidden flex-shrink-0">
          {avatar
            ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
            : <span className="text-text-dark text-lg font-serif">{name[0]}</span>}
        </div>
        <div>
          <p className="text-sm font-serif font-bold text-text-light dark:text-text-dark">{name}</p>
          <p className="text-[11px] text-muted-light dark:text-muted-dark">{email}</p>
        </div>
      </div>

      {/* Groq API Key */}
      <Section icon={Key} title="Groq API Key" desc="Powers AI. Free at console.groq.com">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showKey ? 'text' : 'password'}
              value={groqKey}
              onChange={e => setGroqKey(e.target.value)}
              placeholder="gsk_…"
              className="input pr-9 font-mono text-xs"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 btn-icon w-5 h-5"
            >
              {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
          <Button variant="primary" onClick={saveKey} disabled={!groqKey.trim()} className="px-4">
            {keySaved ? <Check size={14} /> : 'Save'}
          </Button>
        </div>
        <p className="text-[10px] text-muted-light dark:text-muted-dark">
          Stored in <code className="bg-border-dark px-1 rounded">localStorage</code> only. Never leaves your device.
        </p>
      </Section>

      {/* Budget */}
      <Section icon={Wallet} title="Monthly Budget" desc="Get alerted at 80% spend">
        <div className="flex items-center gap-2">
          <span className="text-sm font-serif font-bold text-text-light dark:text-text-dark">₹</span>
          <input
            type="number" min="0"
            value={budget}
            onChange={e => saveBudget(e.target.value)}
            placeholder="e.g. 15000"
            className="input flex-1"
          />
        </div>
        {budget && Number(budget) > 0 && (
          <p className="text-[10px] text-muted-light dark:text-muted-dark">
            Alert at ₹{Math.round(Number(budget)*0.8).toLocaleString('en-IN')}
          </p>
        )}
      </Section>

      {/* AI */}
      <Section icon={Brain} title="Fuzzy AI Detection" desc="Auto-classify entries without @ tags">
        <Toggle label="Enable fuzzy AI" checked={fuzzyAI} onChange={saveFuzzy} />
        <p className="text-[10px] text-muted-light dark:text-muted-dark">
          Lines like "petrol 159" get auto-detected as expenses. Uses Groq API.
        </p>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Renewal Reminders" desc="Days before subscription renews">
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-light dark:text-text-dark flex-1">Remind before</span>
          <input
            type="number" min="0" max="30"
            value={remindDays}
            onChange={e => saveRemind(e.target.value)}
            className="input w-16 text-center"
          />
          <span className="text-xs text-muted-light dark:text-muted-dark">days</span>
        </div>
      </Section>

      {/* About */}
      <Section icon={Info} title="About" desc="Loco v1.0.0 — Smart Life Journal">
        <div className="space-y-1 text-xs text-muted-light dark:text-muted-dark leading-relaxed">
          <p>React 19 · Vite · Tailwind CSS · Supabase · Groq AI</p>
          <p>Currency: INR (₹) · All free tier · Offline-first PWA</p>
        </div>
      </Section>
    </div>
  )
}
