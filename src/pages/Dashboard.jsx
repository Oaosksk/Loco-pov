import React, { useState, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useExpenses } from '../hooks/useExpenses'
import { useSubscriptions } from '../hooks/useSubscriptions'
import { useReminders } from '../hooks/useReminders'
import { useGoals } from '../hooks/useGoals'
import { useHealth } from '../hooks/useHealth'
import { Button } from '../components/ui/Button'
import { Sheet } from '../components/ui/Sheet'
import {
  Wallet, Target, Heart, Bell, RefreshCw,
  TrendingUp, Sparkles, CheckCircle2, AlertCircle,
  Flame, CreditCard, Plus, Trash2, Calendar,
} from 'lucide-react'
import { chat, buildSystemPrompt } from '../lib/groq'

function StatCard({ icon: Icon, title, value, subtitle, color = 'text-primary', warning }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-2">
        <div className={`w-8 h-8 rounded-lg ${color.replace('text-', 'bg-')}/10 flex items-center justify-center`}>
          <Icon size={16} className={color} />
        </div>
        {warning && (
          <AlertCircle size={14} className="text-red-500 animate-pulse" />
        )}
      </div>
      <p className={`text-xl font-bold font-serif ${color}`}>{value}</p>
      <p className="text-xs font-semibold text-text-light dark:text-text-dark mt-0.5">{title}</p>
      {subtitle && <p className="text-[10px] text-muted-light dark:text-muted-dark">{subtitle}</p>}
    </div>
  )
}

function TodayReminders({ reminders, onToggle, onDelete }) {
  const today = new Date().toISOString().split('T')[0]
  const todayReminders = reminders.filter(r => r.datetime?.startsWith(today) || r.remind_at?.startsWith(today))

  if (todayReminders.length === 0) {
    return (
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-2">
          <Bell size={16} className="text-blue-400" />
          <h3 className="text-sm font-semibold text-text-light dark:text-text-dark">Today's Reminders</h3>
        </div>
        <p className="text-xs text-muted-light dark:text-muted-dark">No reminders for today 🎉</p>
      </div>
    )
  }

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Bell size={16} className="text-blue-400" />
        <h3 className="text-sm font-semibold text-text-light dark:text-text-dark">Today's Reminders</h3>
        <span className="ml-auto text-[10px] font-semibold text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded-full">
          {todayReminders.length}
        </span>
      </div>
      <div className="space-y-2">
        {todayReminders.map(r => {
          const time = r.datetime || r.remind_at
          const dt = time ? new Date(time) : null
          return (
            <div key={r.id} className={`flex items-center gap-3 p-2 rounded-lg ${r.done ? 'opacity-50' : 'bg-surface-light dark:bg-[#0a0a0a]'}`}>
              <input
                type="checkbox"
                checked={r.done || false}
                onChange={() => onToggle(r.id)}
                className="w-4 h-4 accent-primary"
              />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold text-text-light dark:text-text-dark ${r.done ? 'line-through' : ''}`}>
                  {r.title}
                </p>
                {dt && (
                  <p className="text-[10px] text-muted-light dark:text-muted-dark">
                    {dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
              <button onClick={() => onDelete(r.id)} className="btn-icon text-red-500 opacity-0 group-hover:opacity-100">
                <Trash2 size={12} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function GoalsProgress({ goals }) {
  const active = goals.filter(g => g.status === 'active')
  const done = goals.filter(g => g.status === 'done')

  if (goals.length === 0) return null

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Target size={16} className="text-cyan-400" />
        <h3 className="text-sm font-semibold text-text-light dark:text-text-dark">Goals Progress</h3>
        <span className="ml-auto text-[10px] font-semibold text-green-400">
          {done.length}/{goals.length} done
        </span>
      </div>
      <div className="space-y-2">
        {active.slice(0, 5).map(goal => {
          const pct = Math.min(100, Math.round((goal.progress / goal.target) * 100))
          return (
            <div key={goal.id} className="space-y-1">
              <div className="flex justify-between">
                <span className="text-xs font-medium text-text-light dark:text-text-dark truncate">{goal.title}</span>
                <span className="text-[10px] font-bold text-primary ml-2">{pct}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-border-light dark:bg-border-dark overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function HealthStreak({ getStreak }) {
  const metrics = ['workout', 'water', 'sleep', 'steps']
  const streaks = metrics.map(m => ({ metric: m, streak: getStreak(m) }))
  const maxStreak = Math.max(...streaks.map(s => s.streak))

  if (maxStreak === 0) return null

  const emojis = { workout: '🏋️', water: '💧', sleep: '🌙', steps: '👣' }

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Flame size={16} className="text-orange-400" />
        <h3 className="text-sm font-semibold text-text-light dark:text-text-dark">Health Streaks</h3>
      </div>
      <div className="flex gap-3">
        {streaks.map(({ metric, streak }) => (
          <div key={metric} className="flex-1 text-center">
            <p className="text-lg mb-0.5">{emojis[metric]}</p>
            <p className={`text-lg font-bold font-serif ${streak > 0 ? 'text-orange-400' : 'text-muted-light dark:text-muted-dark'}`}>
              {streak}
            </p>
            <p className="text-[10px] text-muted-light dark:text-muted-dark capitalize">{metric}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function AISummary() {
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const apiKey = localStorage.getItem('loco_groq_key')

  const generateSummary = async () => {
    if (!apiKey) {
      setSummary('Set your Groq API key in Settings first.')
      return
    }
    setLoading(true)
    try {
      const result = await chat({
        apiKey,
        systemPrompt: 'You are Loco AI. Generate a brief, motivating one-line daily summary for the user based on the current date. Keep it positive and actionable. Maximum 1 sentence.',
        messages: [{ role: 'user', content: `Today is ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}. Give me a one-line daily summary or motivation.` }],
      })
      setSummary(result)
    } catch (err) {
      setSummary(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={16} className="text-primary" />
        <h3 className="text-sm font-semibold text-text-light dark:text-text-dark">Daily AI Summary</h3>
        <button
          onClick={generateSummary}
          disabled={loading}
          className="ml-auto btn-icon"
          title="Generate summary"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      {summary ? (
        <p className="text-xs text-text-light dark:text-text-dark leading-relaxed">{summary}</p>
      ) : (
        <p className="text-xs text-muted-light dark:text-muted-dark">
          Tap refresh to get your daily AI summary.
        </p>
      )}
    </div>
  )
}

export function Dashboard() {
  const { user, isDemoMode } = useAuth()
  const { getMonthTotal } = useExpenses({ userId: user?.id, isDemoMode })
  const { subscriptions, getMonthlyTotal } = useSubscriptions({ userId: user?.id, isDemoMode })
  const { reminders, toggleDone, deleteReminder } = useReminders()
  const { goals } = useGoals({ userId: user?.id, isDemoMode })
  const { getStreak } = useHealth({ userId: user?.id, isDemoMode })

  const monthTotal = getMonthTotal()
  const subMonthlyTotal = getMonthlyTotal()
  const budget = Number(localStorage.getItem('loco_monthly_budget') || 0)
  const budgetWarning = budget > 0 && monthTotal >= budget * 0.8

  const activeGoals = goals.filter(g => g.status === 'active').length
  const doneGoals = goals.filter(g => g.status === 'done').length

  const today = new Date()
  const greeting = (() => {
    const hour = today.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  const name = user?.user_metadata?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="space-y-5 pb-20">
      {/* Greeting */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-serif text-text-light dark:text-text-dark">
          {greeting}, {name} 👋
        </h1>
        <p className="text-sm text-muted-light dark:text-muted-dark mt-0.5">
          {today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Budget warning */}
      {budgetWarning && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 animate-fade-in">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-red-500">Budget Warning!</p>
            <p className="text-[10px] text-red-400">
              You've spent ₹{monthTotal.toLocaleString('en-IN')} of your ₹{budget.toLocaleString('en-IN')} monthly budget ({Math.round((monthTotal / budget) * 100)}%)
            </p>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Wallet}
          title="Monthly Expenses"
          value={`₹${monthTotal.toLocaleString('en-IN')}`}
          subtitle={budget > 0 ? `of ₹${budget.toLocaleString('en-IN')} budget` : undefined}
          color="text-green-400"
          warning={budgetWarning}
        />
        <StatCard
          icon={CreditCard}
          title="Subscriptions"
          value={`${subscriptions.length}`}
          subtitle={`₹${Math.round(subMonthlyTotal).toLocaleString('en-IN')}/mo`}
          color="text-orange-400"
        />
        <StatCard
          icon={Target}
          title="Active Goals"
          value={`${activeGoals}`}
          subtitle={`${doneGoals} completed`}
          color="text-cyan-400"
        />
        <StatCard
          icon={Flame}
          title="Max Streak"
          value={`${Math.max(getStreak('workout'), getStreak('water'), getStreak('sleep'), getStreak('steps'))}d`}
          subtitle="best health streak"
          color="text-orange-400"
        />
      </div>

      {/* Today's reminders */}
      <TodayReminders
        reminders={reminders}
        onToggle={toggleDone}
        onDelete={deleteReminder}
      />

      {/* Goals progress */}
      <GoalsProgress goals={goals} />

      {/* Health streaks */}
      <HealthStreak getStreak={getStreak} />

      {/* AI Summary */}
      <AISummary />
    </div>
  )
}
