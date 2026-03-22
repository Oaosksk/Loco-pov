import { useState, useLayoutEffect } from 'react'

const LS_KEY = 'loco_dark_mode'

// Apply the dark class synchronously before first paint
// so there's never a flash of light mode
function applyDark(isDark) {
  const root = document.documentElement
  if (isDark) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

// Read initial value and apply it immediately (before React renders)
;(function init() {
  const stored = localStorage.getItem(LS_KEY)
  const isDark = stored !== null ? stored === 'true' : true // default dark
  applyDark(isDark)
})()

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem(LS_KEY)
    return stored !== null ? stored === 'true' : true
  })

  useLayoutEffect(() => {
    applyDark(isDark)
    localStorage.setItem(LS_KEY, String(isDark))
  }, [isDark])

  const toggle = () => setIsDark(v => !v)

  return { isDark, toggle }
}
