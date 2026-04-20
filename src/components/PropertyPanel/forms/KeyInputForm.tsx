import React, { useState } from 'react'
import { Field } from '../fields'

const COMMON_KEYS = [
  'Return', 'Space', 'Tab', 'Escape', 'Backspace', 'Delete',
  'Up', 'Down', 'Left', 'Right',
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
  'LeftControl', 'LeftShift', 'LeftAlt',
  'A','B','C','D','E','F','G','H','I','J','K','L','M',
  'N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
  'Num0','Num1','Num2','Num3','Num4','Num5','Num6','Num7','Num8','Num9'
]

interface Props {
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
}

export default function KeyInputForm({ data, onChange }: Props) {
  const keys: string[] = (data.keys as string[]) ?? []
  const [input, setInput] = useState('')

  const addKey = (key: string) => {
    if (!key || keys.includes(key)) return
    onChange({ keys: [...keys, key] })
    setInput('')
  }

  const removeKey = (key: string) => {
    onChange({ keys: keys.filter((k) => k !== key) })
  }

  return (
    <>
      <Field label="선택된 키">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, minHeight: 32 }}>
          {keys.length === 0 && <span style={{ color: '#555', fontSize: 12 }}>키를 추가하세요</span>}
          {keys.map((k) => (
            <span
              key={k}
              onClick={() => removeKey(k)}
              title="클릭하여 제거"
              style={keyBadge}
            >
              {k} ✕
            </span>
          ))}
        </div>
      </Field>
      <Field label="키 추가 (직접 입력)">
        <div style={{ display: 'flex', gap: 4 }}>
          <input
            style={{ ...inputStyle, flex: 1 }}
            value={input}
            placeholder="ex) LeftControl"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addKey(input.trim()) }}
          />
          <button style={addBtn} onClick={() => addKey(input.trim())}>추가</button>
        </div>
      </Field>
      <Field label="자주 쓰는 키">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {COMMON_KEYS.map((k) => (
            <span key={k} onClick={() => addKey(k)} style={presetKey}>{k}</span>
          ))}
        </div>
      </Field>
    </>
  )
}

const inputStyle: React.CSSProperties = {
  background: '#0f3460', border: '1px solid #1a4a8a', borderRadius: 4,
  color: '#e0e0e0', padding: '5px 8px', fontSize: 13
}
const keyBadge: React.CSSProperties = {
  background: '#e94560', borderRadius: 4, padding: '2px 8px',
  fontSize: 12, cursor: 'pointer', userSelect: 'none'
}
const presetKey: React.CSSProperties = {
  background: '#0f3460', border: '1px solid #1a4a8a', borderRadius: 3,
  padding: '2px 6px', fontSize: 11, cursor: 'pointer', userSelect: 'none'
}
const addBtn: React.CSSProperties = {
  background: '#0f3460', border: '1px solid #1a4a8a', borderRadius: 4,
  color: '#e0e0e0', padding: '5px 10px', fontSize: 13, cursor: 'pointer'
}
