import { useState, useEffect } from 'react'

const LS_KEY = 'loco_dark_mode'

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem(LS_KEY)
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem(LS_KEY, String(isDark))
  }, [isDark])

  const toggle = () => setIsDark((v) => !v)

  return { isDark, toggle }
}
