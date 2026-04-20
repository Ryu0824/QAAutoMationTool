import React from 'react'
import { Field, NumberInput, TextInput, SelectInput } from '../fields'

interface Props {
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
}

export default function OCRReadForm({ data, onChange }: Props) {
  return (
    <>
      <Field label="기댓값 (텍스트 비교)">
        <TextInput
          value={data.expect as string}
          onChange={(v) => onChange({ expect: v })}
          placeholder="완료"
        />
      </Field>
      <Field label="비교 방식">
        <SelectInput
          value={(data.matchMode as string) ?? 'contains'}
          options={[
            { label: '포함 (contains)', value: 'contains' },
            { label: '완전 일치 (exact)', value: 'exact' },
            { label: '정규식 (regex)', value: 'regex' }
          ]}
          onChange={(v) => onChange({ matchMode: v })}
        />
      </Field>
      <Field label="결과 텍스트 변수명 (선택)">
        <TextInput
          value={data.varName as string}
          onChange={(v) => onChange({ varName: v || undefined })}
          placeholder="예: ocrText (비워두면 저장 안 함)"
        />
        {data.varName && (
          <p style={{ fontSize: 10, color: '#888', marginTop: 3 }}>
            읽은 텍스트가 <code style={{ color: '#f0c040' }}>${data.varName as string}</code> 에 저장됩니다
          </p>
        )}
      </Field>

      <Field label="읽기 영역">
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
