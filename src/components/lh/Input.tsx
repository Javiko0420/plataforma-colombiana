import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react'

export function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`lh-input${className ? ` ${className}` : ''}`} {...rest} />
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode
}

export function Select({ className = '', children, ...rest }: SelectProps) {
  return (
    <select className={`lh-input${className ? ` ${className}` : ''}`} {...rest}>
      {children}
    </select>
  )
}

export function Textarea({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`lh-input${className ? ` ${className}` : ''}`} {...rest} />
}
