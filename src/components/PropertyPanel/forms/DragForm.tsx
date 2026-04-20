import React from 'react'
import { Field, NumberInput, TextInput } from '../fields'

interface Props {
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
}

export default function DragForm({ data, onChange }: Props) {
  const useFromVar = !!data.useFromVar
  const useToVar = !!data.useToVar

  return (
    <>
      <p style={sectionLabel}>시작 좌표</p>
      <Field label="입력 방식">
        <div style={toggleRow}>
          <button style={toggleBtn(!useFromVar)} onClick={() => onChange({ useFromVar: false })}>직접 입력</button>
          <button style={toggleBtn(useFromVar)} onClick={() => onChange({ useFromVar: true })}>변수 사용</button>
        </div>
      </Field>
      {!useFromVar ? (
        <>
          <Field label="From X">
            <NumberInput value={data.fromX as number} onChange={(v) => onChange({ fromX: v })} placeholder="0" />
          </Field>
          <Field label="From Y">
            <NumberInput value={data.fromY as number} onChange={(v) => onChange({ fromY: v })} placeholder="0" />
          </Field>
        </>
      ) : (
        <Field label="변수명">
          <TextInput
            value={data.fromVar as string}
            onChange={(v) => onChange({ fromVar: v })}
            placeholder="예: target"
          />
          <p style={hint}>ImageMatch에서 저장한 변수명</p>
        </Field>
      )}

      <div style={divider} />

      <p style={sectionLabel}>끝 좌표</p>
      <Field label="입력 방식">
        <div style={toggleRow}>
          <button style={toggleBtn(!useToVar)} onClick={() => onChange({ useToVar: false })}>직접 입력</button>
          <button style={toggleBtn(useToVar)} onClick={() => onChange({ useToVar: true })}>변수 사용</button>
        </div>
      </Field>
      {!useToVar ? (
        <>
          <Field label="To X">
            <NumberInput value={data.toX as number} onChange={(v) => onChange({ toX: v })} placeholder="0" />
          </Field>
          <Field label="To Y">
            <NumberInput value={data.toY as number} onChange={(v) => onChange({ toY: v })} placeholder="0" />
          </Field>
        </>
      ) : (
        <Field label="변수명">
          <TextInput
            value={data.toVar as string}
            onChange={(v) => onChange({ toVar: v })}
            placeholder="예: destination"
          />
          <p style={hint}>ImageMatch에서 저장한 변수명</p>
        </Field>
      )}
    </>
  )
}

const sectionLabel: React.CSSProperties = {
  fontSize: 11, color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5
}
const divider: React.CSSProperties = { height: 1, background: '#0f3460', margin: '10px 0' }
const toggleRow: React.CSSProperties = { display: 'flex', gap: 4 }
const toggleBtn = (active: boolean): React.CSSProperties => ({
  flex: 1, background: active ? '#e94560' : '#0f3460',
  border: `1px solid ${active ? '#e94560' : '#1a4a8a'}`,
  borderRadius: 4, color: '#e0e0e0', padding: '4px 0', fontSize: 12, cursor: 'pointer'
})
const hint: React.CSSProperties = { fontSize: 10, color: '#888', marginTop: 3 }
