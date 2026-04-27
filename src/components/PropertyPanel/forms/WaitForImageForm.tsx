import React, { useRef } from 'react'
import { Field, NumberInput } from '../fields'
import TemplatePicker from './TemplatePicker'

interface Props {
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
}

export default function WaitForImageForm({ data, onChange }: Props) {
  const selected = data.template as string | undefined
  const refreshRef = useRef<() => void>(() => {})

  const handleUpload = async () => {
    const name = await window.api.template.openDialog()
    if (name) {
      refreshRef.current()
      onChange({ template: name })
    }
  }

  const handleCapture = async () => {
    const result = await (window as any).api.capture.openOverlay('region')
    if (result?.imageBase64) {
      const name = await (window as any).api.template.saveCapture(result.imageBase64)
      refreshRef.current()
      onChange({ template: name })
    }
  }

  return (
    <>
      <Field label="템플릿 이미지">
        <div style={{ display: 'flex', gap: 4 }}>
          <button style={{ ...uploadBtn, flex: 1 }} onClick={handleUpload}>+ 이미지 업로드</button>
          <button
            style={{ ...uploadBtn, flex: 1, borderColor: '#1a6a9a', color: '#7dd3fc' }}
            onClick={handleCapture}
          >
            화면에서 캡처
          </button>
        </div>

        <TemplatePicker
          selected={selected}
          onSelect={(name) => onChange({ template: name || undefined })}
          onRefresh={(fn) => { refreshRef.current = fn }}
        />
      </Field>

      <Field label="타임아웃 (ms)">
        <NumberInput
          value={data.timeout as number}
          onChange={(v) => onChange({ timeout: v })}
          placeholder="10000"
        />
        <p style={{ fontSize: 10, color: '#666', marginTop: 3 }}>이미지를 찾을 최대 대기 시간</p>
      </Field>

      <Field label="폴링 간격 (ms)">
        <NumberInput
          value={data.interval as number}
          onChange={(v) => onChange({ interval: v })}
          placeholder="500"
        />
        <p style={{ fontSize: 10, color: '#666', marginTop: 3 }}>재시도 간격</p>
      </Field>

      <Field label="유사도 임계값 (0~1)">
        <NumberInput
          value={data.threshold as number}
          onChange={(v) => onChange({ threshold: Math.min(1, Math.max(0, v)) })}
          placeholder="0.8"
        />
      </Field>

      <Field label="결과 좌표 변수명 (선택)">
        <input
          style={inputStyle}
          value={(data.varName as string) ?? ''}
          placeholder="예: target"
          onChange={(e) => onChange({ varName: e.target.value || undefined })}
        />
        {data.varName && (
          <p style={{ fontSize: 10, color: '#888', marginTop: 3 }}>
            발견 시 <code style={{ color: '#f0c040' }}>${data.varName as string}</code> 에 {'{ x, y }'} 저장
          </p>
        )}
      </Field>

      <Field label="탐색 영역 (비워두면 전체 화면)">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {(['regionX', 'regionY', 'regionW', 'regionH'] as const).map((key) => (
            <div key={key}>
              <label style={{ fontSize: 10, color: '#666' }}>{key.replace('region', '')}</label>
              <NumberInput
                value={data[key] as number}
                onChange={(v) => onChange({ [key]: v })}
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </Field>
    </>
  )
}

const uploadBtn: React.CSSProperties = {
  width: '100%',
  background: '#0f3460',
  border: '1px dashed #1a4a8a',
  borderRadius: 4,
  color: '#e0e0e0',
  padding: '6px',
  fontSize: 12,
  cursor: 'pointer',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0f3460',
  border: '1px solid #1a4a8a',
  borderRadius: 4,
  color: '#e0e0e0',
  padding: '5px 8px',
  fontSize: 13,
  boxSizing: 'border-box',
}
