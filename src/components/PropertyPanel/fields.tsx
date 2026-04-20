import React from 'react'

interface FieldProps {
  label: string
  children: React.ReactNode
}

export function Field({ label, children }: FieldProps) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0f3460',
  border: '1px solid #1a4a8a',
  borderRadius: 4,
  color: '#e0e0e0',
  padding: '5px 8px',
  fontSize: 13,
  boxSizing: 'border-box'
}

interface NumberInputProps {
  value: number | undefined
  onChange: (v: number) => void
  placeholder?: string
}

export function NumberInput({ value, onChange, placeholder }: NumberInputProps) {
  return (
    <input
      type="number"
      style={inputStyle}
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  )
}

interface TextInputProps {
  value: string | undefined
  onChange: (v: string) => void
  placeholder?: string
}

export function TextInput({ value, onChange, placeholder }: TextInputProps) {
  return (
    <input
      type="text"
      style={inputStyle}
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

interface SelectInputProps {
  value: string | undefined
  options: { label: string; value: string }[]
  onChange: (v: string) => void
}

export function SelectInput({ value, options, onChange }: SelectInputProps) {
  return (
    <select
      style={inputStyle}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
