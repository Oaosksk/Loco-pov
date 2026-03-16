import React from 'react'

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const base =
    variant === 'primary' ? 'btn-primary' :
    variant === 'ghost'   ? 'btn-ghost'   :
    variant === 'accent'  ? 'btn-accent'  :
    'btn-primary'

  return (
    <button className={`${base} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function IconButton({ children, className = '', ...props }) {
  return (
    <button className={`btn-icon ${className}`} {...props}>
      {children}
    </button>
  )
}
