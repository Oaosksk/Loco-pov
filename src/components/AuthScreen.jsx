import React from 'react'
import { Button } from './ui/Button'
import { Zap, BookOpen, Target, Brain, HardDrive } from 'lucide-react'

function Feature({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
        <Icon size={18} className="text-white" />
      </div>
      <span className="text-white/80 text-sm font-medium">{label}</span>
    </div>
  )
}

export function AuthScreen({ onSignIn, loading }) {
  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl">

        {/* Left panel — branding */}
        <div className="bg-gradient-to-br from-[#0D0D0D] via-[#111111] to-[#1a0000] p-10 flex flex-col justify-between">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
                <Zap size={22} className="text-white" />
              </div>
              <span className="text-2xl font-bold text-white font-serif tracking-tight">Loco</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white font-serif leading-tight mb-4">
              Your personal<br />
              <span className="text-accent">productivity hub</span>
            </h1>
            <p className="text-white/70 text-sm mb-8 leading-relaxed">
              Notes. Goals. Drive. AI. All in one free, beautiful app — works offline and on any device.
            </p>

            <div className="space-y-3">
              <Feature icon={BookOpen} label="Smart note-taking with tags & sharing" />
              <Feature icon={Target}   label="Goal tracking with progress bars" />
              <Feature icon={HardDrive} label="Browse your Google Drive files" />
              <Feature icon={Brain}     label="AI assistant powered by Groq (free)" />
            </div>
          </div>

          <p className="text-white/30 text-xs mt-8">
            100% free · No paid APIs · Open source
          </p>
        </div>

        {/* Right panel — sign-in */}
        <div className="bg-surface-light dark:bg-surface-dark p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-bold font-serif text-text-light dark:text-text-dark mb-2">
            Welcome back 👋
          </h2>
          <p className="text-muted-light dark:text-muted-dark text-sm mb-8">
            Sign in with Google to sync your data across devices.
          </p>

          <Button
            variant="primary"
            onClick={onSignIn}
            disabled={loading}
            className="w-full justify-center mb-4 gap-3"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
              <path d="M43.6 24.5c0-1.5-.1-3-.4-4.4H24v8.4h11c-.5 2.6-2 4.8-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15.3z" fill="#4285F4"/>
              <path d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.2 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H6v5.3C9.4 39.8 16.2 44 24 44z" fill="#34A853"/>
              <path d="M12.6 27.5A12 12 0 0 1 12 24c0-1.2.2-2.4.6-3.5V15.2H6A20 20 0 0 0 4 24c0 3.2.8 6.2 2 8.8l6.6-5.3z" fill="#FBBC05"/>
              <path d="M24 12c3 0 5.7 1 7.8 3l5.8-5.8C34.1 5.9 29.4 4 24 4 16.2 4 9.4 8.2 6 15.2l6.6 5.3C14.2 15.6 18.7 12 24 12z" fill="#EA4335"/>
            </svg>
            {loading ? 'Signing in…' : 'Continue with Google'}
          </Button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-light dark:border-border-dark" />
            </div>
           
          </div>

          {/* <button
            onClick={onDemoMode}
            className="btn-ghost w-full justify-center"
          >
            Try with demo data
          </button> */}

          <p className="text-xs text-muted-light dark:text-muted-dark mt-6 text-center leading-relaxed">
            By signing in you agree to our terms.
            Google Drive access is read-only.
            Your Groq AI key stays on your device only.
          </p>
        </div>

      </div>
    </div>
  )
}
