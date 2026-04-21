import React, { useEffect, useState } from 'react'
import { Field, NumberInput } from '../fields'

interface Props {
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
}

export default function ImageMatchForm({ data, onChange }: Props) {
  const [templates, setTemplates] = useState<string[]>([])
  const selected = data.template as string | undefined

  const refreshList = () => {
    window.api.template.list().then(setTemplates).catch(() => setTemplates([]))
  }

  useEffect(() => { refreshList() }, [])

  const handleUpload = async () => {
    const name = await window.api.template.openDialog()
    if (name) {
      refreshList()
      onChange({ template: name })
    }
  }

  const handleDelete = async (name: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await window.api.template.delete(name)
    refreshList()
    if (selected === name) onChange({ template: undefined })
  }

  return (
    <>
      <Field label="템플릿 이미지">
        <div style={{ display: 'flex', gap: 4 }}>
          <button style={{ ...uploadBtn, flex: 1 }} onClick={handleUpload}>+ 이미지 업로드</button>
          <button
            style={{ ...uploadBtn, flex: 1, borderColor: '#1a6a9a', color: '#7dd3fc' }}
            onClick={async () => {
              const result = await (window as any).api.capture.openOverlay('region')
              if (result?.imageBase64) {
                const name = await (window as any).api.template.saveCapture(result.imageBase64)
                refreshList()
                onChange({ template: name })
              }
            }}
          >
            화면에서 캡처
          </button>
        </div>

        {templates.length === 0 && (
          <p style={{ color: '#555', fontSize: 11, marginTop: 6 }}>업로드된 템플릿 없음</p>
        )}

        <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {templates.map((name) => (
            <div
              key={name}
              onClick={() => onChange({ template: name })}
              style={itemStyle(name === selected)}
            >
              <span style={{ flex: 1, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {name === selected ? '✓ ' : ''}{name}
              </span>
              <button
                style={deleteBtn}
                onClick={(e) => handleDelete(name, e)}
                title="삭제"
              >✕</button>
            </div>
          ))}
        </div>
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
          placeholder="예: target (비워두면 저장 안 함)"
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
  cursor: 'pointer'
}

const itemStyle = (selected: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  background: selected ? '#1a3a6a' : '#0a1a3a',
  border: `1px solid ${selected ? '#e94560' : '#1a4a8a'}`,
  borderRadius: 4,
  padding: '4px 8px',
  cursor: 'pointer',
  gap: 4
})

const deleteBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#666',
  fontSize: 11,
  cursor: 'pointer',
  padding: '0 2px',
  flexShrink: 0
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
