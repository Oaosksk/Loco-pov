import React from 'react'

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base =
    variant === 'primary' ? 'btn-primary' :
    variant === 'ghost'   ? 'btn-ghost'   :
    variant === 'accent'  ? 'btn-accent'  :
    'btn-primary'

  const sizeClass = size === 'sm' ? 'px-3 py-1.5 text-xs' : ''

  return (
    <button className={`${base} ${sizeClass} ${className}`} {...props}>
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
