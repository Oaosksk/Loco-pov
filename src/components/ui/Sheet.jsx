import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export function Sheet({ open, onClose, title, children }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />

      {/* Panel */}
      <div className="relative z-10 w-full sm:max-w-lg
                      bg-surface-light dark:bg-surface-dark
                      border-t border-border-light dark:border-border-dark
                      sm:border sm:rounded-2xl
                      rounded-t-3xl shadow-card-dark
                      p-5 sm:p-6 animate-slide-up max-h-[92svh] overflow-y-auto"
           style={{ borderWidth: '0.5px' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-serif font-bold text-text-light dark:text-text-dark">
            {title}
          </h2>
          <button onClick={onClose} className="btn-icon -mr-1">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
