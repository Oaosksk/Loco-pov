// import React, { useState } from 'react'
// import { useAuth } from '../hooks/useAuth'
// import { useExpenses } from '../hooks/useExpenses'
// import { useSubscriptions } from '../hooks/useSubscriptions'
// import { useReminders } from '../hooks/useReminders'
// import { useGoals } from '../hooks/useGoals'
// import { useHealth } from '../hooks/useHealth'
// import { Wallet, Target, Flame, CreditCard, Bell, RefreshCw, Sparkles, AlertCircle, Trash2, } from 'lucide-react'
// import { chat } from '../lib/groq'
// // import { useNavigate } from 'react-router-dom'


// /* ── Stat card ──────────────────────────────────────── */
// function StatCard({ icon: Icon, title, value, subtitle, warning }) {

//   return (
//     <div className="card p-4 space-y-3">
//       <div className="flex items-center justify-between">
//         <Icon size={15} className="text-muted-light dark:text-muted-dark" />
//         {warning && <AlertCircle size={13} className="text-muted-dark animate-pulse" />}
//       </div>
//       <div>
//         <p className="text-lg font-bold font-serif text-text-light dark:text-text-dark leading-none">
//           {value}
//         </p>
//         <p className="text-[11px] font-medium text-muted-light dark:text-muted-dark mt-1">{title}</p>
//         {subtitle && (
//           <p className="text-[10px] text-muted-light dark:text-muted-dark opacity-70">{subtitle}</p>
//         )}
//       </div>
//     </div>
//   )
// }

// /* ── Today's reminders ──────────────────────────────── */
// function TodayReminders({ reminders, onToggle, onDelete }) {
//   const today = new Date().toISOString().split('T')[0]
//   const list  = reminders.filter(r => r.remind_at?.startsWith(today) || r.datetime?.startsWith(today))

//   return (
//     <div className="card p-4">
//       <div className="flex items-center gap-2 mb-3">
//         <Bell size={14} className="text-muted-light dark:text-muted-dark" />
//         <h3 className="text-sm font-serif font-bold text-text-light dark:text-text-dark">Today</h3>
//         {list.length > 0 && (
//           <span className="ml-auto text-[10px] font-medium text-muted-dark
//                            border border-border-dark rounded px-1.5 py-0.5"
//                 style={{ borderWidth: '0.5px' }}>
//             {list.length}
//           </span>
//         )}
//       </div>
//       {list.length === 0 ? (
//         <p className="text-xs text-muted-light dark:text-muted-dark">No reminders today.</p>
//       ) : (
//         <div className="space-y-1.5">
//           {list.map(r => {
//             const dt = r.remind_at || r.datetime
//             return (
//               <div key={r.id}
//                    className={`flex items-center gap-3 py-1.5 group ${r.done ? 'opacity-40' : ''}`}>
//                 <input
//                   type="checkbox"
//                   checked={r.done || false}
//                   onChange={() => onToggle(r.id)}
//                   className="w-3.5 h-3.5 rounded-sm border border-border-dark accent-text-dark
//                              cursor-pointer flex-shrink-0"
//                 />
//                 <div className="flex-1 min-w-0">
//                   <p className={`text-xs text-text-light dark:text-text-dark ${r.done ? 'line-through' : ''}`}>
//                     {r.title}
//                   </p>
//                   {dt && (
//                     <p className="text-[10px] text-muted-light dark:text-muted-dark">
//                       {new Date(dt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
//                     </p>
//                   )}
//                 </div>
//                 <button
//                   onClick={() => onDelete(r.id)}
//                   className="btn-icon opacity-0 group-hover:opacity-100 w-6 h-6"
//                 >
//                   <Trash2 size={11} />
//                 </button>
//               </div>
//             )
//           })}
//         </div>
//       )}
//     </div>
//   )
// }

// /* ── Goals progress ─────────────────────────────────── */
// function GoalsProgress({ goals }) {
//   const active = goals.filter(g => g.status === 'active')
//   if (active.length === 0) return null

//   return (
//     <div className="card p-4">
//       <div className="flex items-center gap-2 mb-3">
//         <Target size={14} className="text-muted-light dark:text-muted-dark" />
//         <h3 className="text-sm font-serif font-bold text-text-light dark:text-text-dark">Goals</h3>
//         <span className="ml-auto text-[10px] text-muted-dark">
//           {goals.filter(g => g.status === 'completed').length}/{goals.length} done
//         </span>
//       </div>
//       <div className="space-y-3">
//         {active.slice(0, 4).map(goal => {
//           const pct = Math.min(100, Math.round((goal.progress / goal.target) * 100))
//           return (
//             <div key={goal.id} className="space-y-1">
//               <div className="flex justify-between items-center">
//                 <span className="text-xs text-text-light dark:text-text-dark truncate">{goal.title}</span>
//                 <span className="text-[10px] text-muted-dark ml-2 flex-shrink-0">{pct}%</span>
//               </div>
//               <div className="progress-track">
//                 <div className="progress-fill" style={{ width: `${pct}%` }} />
//               </div>
//             </div>
//           )
//         })}
//       </div>
//     </div>
//   )
// }

// /* ── Health streaks ─────────────────────────────────── */
// function HealthStreak({ getStreak }) {
//   const metrics = ['workout', 'water', 'sleep', 'steps']
//   const data = metrics.map(m => ({ m, s: getStreak(m) }))
//   if (data.every(d => d.s === 0)) return null

//   const emojis = { workout: '🏋️', water: '💧', sleep: '🌙', steps: '👣' }
//   return (
//     <div className="card p-4">
//       <div className="flex items-center gap-2 mb-3">
//         <Flame size={14} className="text-muted-light dark:text-muted-dark" />
//         <h3 className="text-sm font-serif font-bold text-text-light dark:text-text-dark">Streaks</h3>
//       </div>
//       <div className="grid grid-cols-4 gap-2">
//         {data.map(({ m, s }) => (
//           <div key={m} className="text-center">
//             <p className="text-base mb-0.5">{emojis[m]}</p>
//             <p className={`text-base font-bold font-serif ${
//               s > 0 ? 'text-text-light dark:text-text-dark' : 'text-muted-light dark:text-muted-dark'
//             }`}>{s}</p>
//             <p className="text-[9px] text-muted-light dark:text-muted-dark capitalize">{m}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

// /* ── AI daily summary ───────────────────────────────── */
// function AISummary() {
//   const [summary, setSummary] = useState('')
//   const [loading, setLoading] = useState(false)
//   const apiKey = localStorage.getItem('loco_groq_key')

//   const generate = async () => {
//     if (!apiKey) { setSummary('Add your Groq API key in Settings.'); return }
//     setLoading(true)
//     try {
//       const result = await chat({
//         apiKey,
//         systemPrompt: 'You are Loco AI. Write one short motivating sentence for the day. Be warm, direct, no fluff.',
//         messages: [{ role: 'user', content: `Today is ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}. Give me one sentence.` }],
//       })
//       setSummary(result)
//     } catch (err) {
//       setSummary(`Error: ${err.message}`)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="card p-4">
//       <div className="flex items-center gap-2 mb-2">
//         <Sparkles size={14} className="text-muted-light dark:text-muted-dark" />
//         <h3 className="text-sm font-serif font-bold text-text-light dark:text-text-dark">AI Insight</h3>
//         <button onClick={generate} disabled={loading} className="ml-auto btn-icon w-6 h-6">
//           <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
//         </button>
//       </div>
//       <p className="text-xs text-muted-light dark:text-muted-dark leading-relaxed">
//         {summary || 'Tap refresh for your daily AI insight.'}
//       </p>
//     </div>
//   )
// }

// /* ── Dashboard page ─────────────────────────────────── */
// export function Dashboard() {
//   const { user, isDemoMode } = useAuth()
//   const { getMonthTotal }    = useExpenses({ userId: user?.id, isDemoMode })
//   const { subscriptions, getMonthlyTotal } = useSubscriptions({ userId: user?.id, isDemoMode })
//   const { reminders, toggleDone, deleteReminder } = useReminders()
//   const { goals }            = useGoals({ userId: user?.id, isDemoMode })
//   const { getStreak }        = useHealth({ userId: user?.id, isDemoMode })

//   const monthTotal    = getMonthTotal()
//   const subTotal      = getMonthlyTotal()
//   const budget        = Number(localStorage.getItem('loco_monthly_budget') || 0)
//   const budgetWarning = budget > 0 && monthTotal >= budget * 0.8
//   const activeGoals   = goals.filter(g => g.status === 'active').length
//   const doneGoals     = goals.filter(g => g.status === 'completed').length

//   const hour     = new Date().getHours()
//   const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
//   const name     = user?.user_metadata?.full_name?.split(' ')[0] || 'there'
//   const dateStr  = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

//   return (
//     <div className="space-y-4 pb-4">

//       {/* Greeting */}
//       <div className="pt-1">
//         <h1 className="text-2xl font-serif font-bold text-text-light dark:text-text-dark">
//           {greeting}, {name}
//         </h1>
//         <p className="text-sm text-muted-light dark:text-muted-dark mt-0.5">{dateStr}</p>
//       </div>

//       {/* Budget warning */}
//       {budgetWarning && (
//         <div className="flex items-center gap-3 px-4 py-3 rounded-xl
//                         border border-border-light dark:border-border-dark
//                         bg-surface-light dark:bg-surface-dark animate-fade-in"
//              style={{ borderWidth: '0.5px' }}>
//           <AlertCircle size={15} className="text-muted-dark flex-shrink-0" />
//           <p className="text-xs text-text-light dark:text-text-dark">
//             <span className="font-semibold">Budget alert</span> — ₹{monthTotal.toLocaleString('en-IN')} of ₹{budget.toLocaleString('en-IN')} used ({Math.round((monthTotal/budget)*100)}%)
//           </p>
//         </div>
//       )}

//       {/* Stat cards */}
//       <div className="grid grid-cols-2 gap-3">
//         <StatCard icon={Wallet}    title="Monthly"          value={`₹${monthTotal.toLocaleString('en-IN')}`}        subtitle={budget > 0 ? `of ₹${budget.toLocaleString('en-IN')}` : undefined} warning={budgetWarning} />
//         <StatCard icon={CreditCard} title="Subscriptions"   value={String(subscriptions.length)}                    subtitle={`₹${Math.round(subTotal).toLocaleString('en-IN')}/mo`} />
//         <StatCard icon={Target}    title="Active Goals"     value={String(activeGoals)}                              subtitle={`${doneGoals} completed`} />
//         <StatCard icon={Flame}     title="Best Streak"      value={`${Math.max(getStreak('workout'), getStreak('water'), getStreak('sleep'), getStreak('steps'))}d`} subtitle="health" />
//       </div>

//       <TodayReminders reminders={reminders} onToggle={toggleDone} onDelete={deleteReminder} />
//       <GoalsProgress  goals={goals} />
//       <HealthStreak   getStreak={getStreak} />
//       <AISummary />
//     </div>
//   )
// }
