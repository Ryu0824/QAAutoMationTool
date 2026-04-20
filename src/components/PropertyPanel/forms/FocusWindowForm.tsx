import React, { useEffect, useState } from 'react'
import { Field, TextInput } from '../fields'

interface Props {
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
}

export default function FocusWindowForm({ data, onChange }: Props) {
  const [windows, setWindows] = useState<string[]>([])

  useEffect(() => {
    window.api.action.listWindows().then(setWindows).catch(() => setWindows([]))
  }, [])

  const refresh = () => {
    window.api.action.listWindows().then(setWindows).catch(() => setWindows([]))
  }

  return (
    <>
      <Field label="창 제목 (부분 일치)">
        <TextInput
          value={data.windowTitle as string}
          onChange={(v) => onChange({ windowTitle: v })}
          placeholder="예: 메이플스토리"
        />
      </Field>

      <Field label="실행 중인 창 목록">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
          <button style={refreshBtn} onClick={refresh}>↻ 새로고침</button>
        </div>
        <div style={listBox}>
          {windows.length === 0 && <p style={{ color: '#555', fontSize: 11 }}>창 없음</p>}
          {windows.map((title) => (
            <div
              key={title}
              style={itemStyle(title === data.windowTitle)}
              onClick={() => onChange({ windowTitle: title })}
              title={title}
            >
              {title}
            </div>
          ))}
        </div>
      </Field>

      <Field label="포커스 후 대기 (ms)">
        <input
          type="number"
          style={inputStyle}
          value={(data.delayAfter as number) ?? 300}
          onChange={(e) => onChange({ delayAfter: Number(e.target.value) })}
        />
      </Field>
    </>
  )
}

const refreshBtn: React.CSSProperties = {
  background: 'none', border: '1px solid #1a4a8a', borderRadius: 3,
  color: '#888', fontSize: 11, cursor: 'pointer', padding: '2px 6px'
}

const listBox: React.CSSProperties = {
  maxHeight: 150, overflowY: 'auto',
  border: '1px solid #1a4a8a', borderRadius: 4
}

const itemStyle = (selected: boolean): React.CSSProperties => ({
  padding: '4px 8px', fontSize: 11, cursor: 'pointer',
  background: selected ? '#1a3a6a' : 'transparent',
  color: selected ? '#fff' : '#aaa',
  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  borderBottom: '1px solid #0f3460'
})

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#0f3460', border: '1px solid #1a4a8a',
  borderRadius: 4, color: '#e0e0e0', padding: '5px 8px',
  fontSize: 13, boxSizing: 'border-box'
}
