import React from 'react'
import { CalendarClock } from 'lucide-react'

export function Schedule() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <CalendarClock size={48} className="text-primary/40 mb-4" />
      <h1 className="text-2xl font-bold font-serif text-text-light dark:text-text-dark mb-2">Schedule</h1>
      <p className="text-muted-light dark:text-muted-dark text-sm">Coming soon.</p>
    </div>
  )
}
