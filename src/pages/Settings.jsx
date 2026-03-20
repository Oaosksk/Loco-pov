import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import {
  Key, Wallet, Brain, Bell, Shield, Info,
  Check, Eye, EyeOff, Moon, Sun, Smartphone,
} from 'lucide-react'

const LS_GROQ_KEY = 'loco_groq_key'
const LS_BUDGET = 'loco_monthly_budget'
const LS_FUZZY = 'loco_fuzzy_ai'
const LS_REMIND_DAYS = 'loco_remind_days'

function SettingSection({ icon: Icon, title, description, children }) {
  return (
    <div className="card p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon size={18} className="text-primary" />
        </div>
        <div>
          <h3 className="font-bold font-serif text-text-light dark:text-text-dark text-sm">{title}</h3>
          {description && (
            <p className="text-xs text-muted-light dark:text-muted-dark mt-0.5">{description}</p>
          )}
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
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-border-light dark:bg-border-dark rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
      </div>
    </label>
  )
}

export function Settings() {
  const { user } = useAuth()

  // Groq API key
  const [groqKey, setGroqKey] = useState(() => localStorage.getItem(LS_GROQ_KEY) || '')
  const [showKey, setShowKey] = useState(false)
  const [keySaved, setKeySaved] = useState(false)

  // Budget
  const [budget, setBudget] = useState(() => localStorage.getItem(LS_BUDGET) || '')

  // Fuzzy AI toggle
  const [fuzzyAI, setFuzzyAI] = useState(() => localStorage.getItem(LS_FUZZY) === 'true')

  // Subscription remind days
  const [remindDays, setRemindDays] = useState(() => localStorage.getItem(LS_REMIND_DAYS) || '3')

  // Save handlers
  const saveGroqKey = () => {
    localStorage.setItem(LS_GROQ_KEY, groqKey.trim())
    setKeySaved(true)
    setTimeout(() => setKeySaved(false), 2000)
  }

  const saveBudget = (val) => {
    setBudget(val)
    localStorage.setItem(LS_BUDGET, val)
  }

  const saveFuzzyAI = (val) => {
    setFuzzyAI(val)
    localStorage.setItem(LS_FUZZY, String(val))
  }

  const saveRemindDays = (val) => {
    setRemindDays(val)
    localStorage.setItem(LS_REMIND_DAYS, val)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-serif text-text-light dark:text-text-dark">Settings</h1>
        <p className="text-sm text-muted-light dark:text-muted-dark mt-0.5">
          Configure your Loco experience
        </p>
      </div>

      {/* Profile */}
      <div className="card p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center overflow-hidden flex-shrink-0">
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-xl font-bold">
                {(user?.user_metadata?.full_name || user?.email || 'U')[0].toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="font-bold font-serif text-text-light dark:text-text-dark">
              {user?.user_metadata?.full_name || 'User'}
            </p>
            <p className="text-xs text-muted-light dark:text-muted-dark">{user?.email || 'demo@loco.app'}</p>
          </div>
        </div>
      </div>

      {/* Groq API Key */}
      <SettingSection
        icon={Key}
        title="Groq API Key"
        description="Powers the AI assistant. Free at console.groq.com"
      >
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showKey ? 'text' : 'password'}
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              placeholder="gsk_..."
              className="input pr-10 font-mono text-xs"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark"
            >
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <Button variant="primary" onClick={saveGroqKey} disabled={!groqKey.trim()}>
            {keySaved ? <Check size={14} /> : 'Save'}
          </Button>
        </div>
        <p className="text-[10px] text-muted-light dark:text-muted-dark mt-2">
          🔒 Stored in <code>localStorage</code> only. Never sent to Loco servers.
        </p>
      </SettingSection>

      {/* Budget */}
      <SettingSection
        icon={Wallet}
        title="Monthly Budget"
        description="Set a monthly budget to get alerts at 80%"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-text-light dark:text-text-dark">₹</span>
          <input
            type="number"
            min="0"
            value={budget}
            onChange={(e) => saveBudget(e.target.value)}
            placeholder="e.g., 15000"
            className="input flex-1"
          />
        </div>
        {budget && Number(budget) > 0 && (
          <p className="text-xs text-muted-light dark:text-muted-dark mt-2">
            You'll be notified when expenses reach ₹{Math.round(Number(budget) * 0.8).toLocaleString('en-IN')} (80%)
          </p>
        )}
      </SettingSection>

      {/* AI Settings */}
      <SettingSection
        icon={Brain}
        title="AI Detection"
        description="Fuzzy AI auto-classifies entries without @ tags"
      >
        <Toggle
          label="Enable fuzzy AI detection"
          checked={fuzzyAI}
          onChange={saveFuzzyAI}
        />
        <p className="text-[10px] text-muted-light dark:text-muted-dark mt-2">
          When enabled, lines like "petrol 159" will auto-detect as expenses even without <code className="text-primary">@e</code>.
          Uses Groq API calls.
        </p>
      </SettingSection>

      {/* Notifications */}
      <SettingSection
        icon={Bell}
        title="Notifications"
        description="Push notification preferences"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-text-light dark:text-text-dark">Remind before renewal</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="30"
                value={remindDays}
                onChange={(e) => saveRemindDays(e.target.value)}
                className="input w-16 text-center py-1 text-sm"
              />
              <span className="text-xs text-muted-light dark:text-muted-dark">days</span>
            </div>
          </div>
        </div>
      </SettingSection>

      {/* About */}
      <SettingSection
        icon={Info}
        title="About Loco"
        description="v1.0.0 — Personal life tracker"
      >
        <div className="space-y-2 text-xs text-muted-light dark:text-muted-dark">
          <p>Built with React 19, Vite, Tailwind CSS, Supabase, and Groq AI.</p>
          <p>100% free tier — no paid APIs.</p>
          <p>Currency: INR (₹)</p>
          <div className="flex items-center gap-2 pt-2">
            <Smartphone size={14} />
            <span>PWA — installable on any device</span>
          </div>
        </div>
      </SettingSection>
    </div>
  )
}
