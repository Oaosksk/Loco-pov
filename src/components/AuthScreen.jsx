import React, { useState } from 'react'
import batGif from '../assets/download.gif'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <path d="M43.6 24.5c0-1.5-.1-3-.4-4.4H24v8.4h11c-.5 2.6-2 4.8-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15.3z" fill="#4285F4"/>
    <path d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.2 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H6v5.3C9.4 39.8 16.2 44 24 44z" fill="#34A853"/>
    <path d="M12.6 27.5A12 12 0 0 1 12 24c0-1.2.2-2.4.6-3.5V15.2H6A20 20 0 0 0 4 24c0 3.2.8 6.2 2 8.8l6.6-5.3z" fill="#FBBC05"/>
    <path d="M24 12c3 0 5.7 1 7.8 3l5.8-5.8C34.1 5.9 29.4 4 24 4 16.2 4 9.4 8.2 6 15.2l6.6 5.3C14.2 15.6 18.7 12 24 12z" fill="#EA4335"/>
  </svg>
)

export function AuthScreen({ onSignIn, onEmailSignIn, onEmailSignUp, loading }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setEmailLoading(true)
    try {
      if (isSignUp) {
        await onEmailSignUp(email, password)
        setError('Check your email to confirm your account.')
      } else {
        await onEmailSignIn(email, password)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setEmailLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100svh',
      background: 'radial-gradient(ellipse at 50% 100%, #2a1f4e 0%, #1a1333 30%, #0e0c1a 60%, #080810 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '5.5rem',
      fontFamily: "'DM Sans', system-ui, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>

      <div style={{
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '70%',
        height: '220px',
        background: 'radial-gradient(ellipse at 50% 100%, rgba(120, 80, 255, 0.35) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '400px', padding: '0 clamp(1.25rem, 6vw, 2rem)', textAlign: 'left' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(2.2rem, 8vw, 2.8rem)',
            fontWeight: 700,
            color: '#E6EDF3',
            lineHeight: 1.15,
          }}>Your life,</span>
          <img
            src={batGif}
            alt=""
            style={{ width: 'clamp(48px, 11vw, 64px)', height: 'clamp(48px, 11vw, 64px)', imageRendering: 'pixelated', flexShrink: 0 }}
          />
        </div>

        <p style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 'clamp(2.2rem, 8vw, 2.8rem)',
          fontWeight: 400,
          fontStyle: 'italic',
          color: '#c8d0db',
          lineHeight: 1.15,
          margin: '0 0 1rem',
        }}>written down.</p>

        <p style={{ color: '#8B949E', fontSize: 'clamp(0.8rem, 3vw, 0.9rem)', lineHeight: 1.6, maxWidth: '300px', margin: 0 }}>
          A journal that quietly tracks your expenses, goals, health and reminders — one line at a time.
        </p>
      </div>

      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '0 clamp(1.25rem, 6vw, 2rem)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        position: 'relative',
        zIndex: 1,
      }}>

        <button
          onClick={onSignIn}
          disabled={loading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            padding: '0.85rem',
            borderRadius: '0.65rem',
            fontSize: '0.9rem',
            fontWeight: 500,
            cursor: 'pointer',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#E6EDF3',
            opacity: loading ? 0.5 : 1,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.2rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ color: '#8B949E', fontSize: '0.75rem' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        </div>

        <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.65rem',
              color: '#E6EDF3',
              padding: '0.8rem 1rem',
              fontSize: '0.875rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(120,80,255,0.6)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.65rem',
              color: '#E6EDF3',
              padding: '0.8rem 1rem',
              fontSize: '0.875rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(120,80,255,0.6)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          />

          {error && (
            <p style={{ fontSize: '0.75rem', color: error.startsWith('Check') ? '#3FB950' : '#F85149', margin: '0.1rem 0' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={emailLoading}
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '0.65rem',
              fontSize: '0.9rem',
              fontWeight: 500,
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#E6EDF3',
              opacity: emailLoading ? 0.5 : 1,
              transition: 'background 0.15s',
              marginTop: '0.1rem',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
          >
            {emailLoading ? '…' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#8B949E', margin: '0.2rem 0 0' }}>
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button
            type="button"
            onClick={() => { setIsSignUp(v => !v); setError('') }}
            style={{ background: 'none', border: 'none', color: '#E6EDF3', cursor: 'pointer', fontSize: '0.78rem', padding: 0, fontWeight: 600 }}
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>

        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#8B949E', opacity: 0.5, margin: 0 }}>
          Free forever · No ads · Privacy first
        </p>
      </div>
    </div>
  )
}
