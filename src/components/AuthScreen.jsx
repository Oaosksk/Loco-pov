import React from 'react'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <path d="M43.6 24.5c0-1.5-.1-3-.4-4.4H24v8.4h11c-.5 2.6-2 4.8-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15.3z" fill="#4285F4"/>
    <path d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.2 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H6v5.3C9.4 39.8 16.2 44 24 44z" fill="#34A853"/>
    <path d="M12.6 27.5A12 12 0 0 1 12 24c0-1.2.2-2.4.6-3.5V15.2H6A20 20 0 0 0 4 24c0 3.2.8 6.2 2 8.8l6.6-5.3z" fill="#FBBC05"/>
    <path d="M24 12c3 0 5.7 1 7.8 3l5.8-5.8C34.1 5.9 29.4 4 24 4 16.2 4 9.4 8.2 6 15.2l6.6 5.3C14.2 15.6 18.7 12 24 12z" fill="#EA4335"/>
  </svg>
)

export function AuthScreen({ onSignIn, onDemoMode, loading }) {
  return (
    <div
      className="min-h-screen flex flex-col justify-between font-sans"
      style={{ background: '#0D1117' }}
    >
      {/* ── Top — headline ───────────────────────────── */}
      <div className="px-8 pt-20 pb-10 flex-1 flex flex-col justify-start max-w-sm mx-auto w-full">

        {/* Wordmark — subtle */}
        <p
          className="text-xs font-medium mb-16 tracking-widest uppercase"
          style={{ color: '#8B949E' }}
        >
          Loco
        </p>

        {/* Headline */}
        <h1 className="font-serif leading-tight mb-6" style={{ fontSize: '2.75rem' }}>
          <span
            className="block font-bold"
            style={{ color: '#E6EDF3' }}
          >
            Your life,
          </span>
          <span
            className="block italic font-normal"
            style={{ color: '#8B949E' }}
          >
            written down.
          </span>
        </h1>

        {/* Subtext */}
        <p
          className="text-sm leading-relaxed"
          style={{ color: '#8B949E', maxWidth: '22rem' }}
        >
          A journal that quietly tracks your expenses,
          goals, health and reminders — one line at a time.
        </p>
      </div>

      {/* ── Bottom — CTA ─────────────────────────────── */}
      <div className="px-8 pb-12 max-w-sm mx-auto w-full space-y-4">
        <button
          onClick={onSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl
                     text-sm font-medium transition-opacity duration-150
                     disabled:opacity-50"
          style={{
            background: 'transparent',
            border: '0.5px solid #21262D',
            color: '#E6EDF3',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#8B949E'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#21262D'}
        >
          <GoogleIcon />
          {loading ? 'Signing in…' : 'Continue with Google'}
        </button>

        {onDemoMode && (
          <button
            onClick={onDemoMode}
            className="w-full py-3 rounded-xl text-sm font-medium transition-opacity duration-150
                       hover:opacity-70"
            style={{ color: '#8B949E', background: 'transparent' }}
          >
            Try demo mode
          </button>
        )}

        <p
          className="text-center text-xs"
          style={{ color: '#8B949E', opacity: 0.6 }}
        >
          Free forever · No ads · Works offline
        </p>
      </div>
    </div>
  )
}
