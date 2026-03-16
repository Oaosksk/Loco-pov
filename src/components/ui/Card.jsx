import React from 'react'

export function Card({ children, className = '', ...props }) {
  return (
    <div className={`card p-5 ${className}`} {...props}>
      {children}
    </div>
  )
}
