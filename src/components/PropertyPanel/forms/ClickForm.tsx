import React from 'react'
import { Field, NumberInput, SelectInput, TextInput } from '../fields'

interface Props {
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
}

export default function ClickForm({ data, onChange }: Props) {
  const useVar = !!data.useVar

  return (
    <>
      <Field label="좌표 입력 방식">
        <div style={toggleRow}>
          <button
            style={toggleBtn(!useVar)}
            onClick={() => onChange({ useVar: false })}
          >직접 입력</button>
          <button
            style={toggleBtn(useVar)}
            onClick={() => onChange({ useVar: true })}
          >변수 사용</button>
        </div>
      </Field>

      {!useVar ? (
        <>
          <Field label="X 좌표">
            <NumberInput value={data.x as number} onChange={(v) => onChange({ x: v })} placeholder="0" />
          </Field>
          <Field label="Y 좌표">
            <NumberInput value={data.y as number} onChange={(v) => onChange({ y: v })} placeholder="0" />
          </Field>
          <button
            style={captureBtn}
            onClick={async () => {
              const result = await (window as any).api.capture.openOverlay('point')
              if (result) onChange({ x: result.x, y: result.y })
            }}
          >
            화면에서 선택
          </button>
        </>
      ) : (
        <Field label="변수명">
          <TextInput
            value={data.varName as string}
            onChange={(v) => onChange({ varName: v })}
            placeholder="예: target"
          />
          <p style={{ fontSize: 10, color: '#888', marginTop: 3 }}>
            ImageMatch에서 저장한 변수명을 입력하세요
          </p>
        </Field>
      )}

      <Field label="클릭 종류">
        <SelectInput
          value={(data.clickType as string) ?? 'single'}
          options={[
            { label: '단일 클릭', value: 'single' },
            { label: '더블 클릭', value: 'double' },
            { label: '오른쪽 클릭', value: 'right' }
          ]}
          onChange={(v) => onChange({ clickType: v })}
        />
      </Field>
    </>
  )
}

const toggleRow: React.CSSProperties = {
  display: 'flex',
  gap: 4
}

const captureBtn: React.CSSProperties = {
  width: '100%',
  marginTop: 6,
  background: '#0a2a50',
  border: '1px solid #1a6a9a',
  borderRadius: 4,
  color: '#7dd3fc',
  padding: '5px 0',
  fontSize: 12,
  cursor: 'pointer'
}

const toggleBtn = (active: boolean): React.CSSProperties => ({
  flex: 1,
  background: active ? '#e94560' : '#0f3460',
  border: `1px solid ${active ? '#e94560' : '#1a4a8a'}`,
  borderRadius: 4,
  color: '#e0e0e0',
  padding: '4px 0',
  fontSize: 12,
  cursor: 'pointer'
})
