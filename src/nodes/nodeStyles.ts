import type { CSSProperties } from 'react'

export const baseStyle = (bg: string): CSSProperties => ({
  background: bg,
  border: '1px solid #1a4a8a',
  borderRadius: 6,
  padding: '8px 14px',
  minWidth: 140,
  color: '#e0e0e0',
  fontSize: 13
})

export const labelStyle: CSSProperties = {
  fontWeight: 700,
  marginBottom: 4,
  color: '#fff'
}
