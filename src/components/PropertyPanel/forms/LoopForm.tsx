import React from 'react'
import { Field, NumberInput, SelectInput } from '../fields'

interface Props {
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
}

export default function LoopForm({ data, onChange }: Props) {
  const mode = (data.mode as string) ?? 'count'

  return (
    <>
      <Field label="반복 방식">
        <SelectInput
          value={mode}
          options={[
            { label: '횟수 지정', value: 'count' },
            { label: '조건 충족까지', value: 'until' }
          ]}
          onChange={(v) => onChange({ mode: v })}
        />
      </Field>
      {mode === 'count' && (
        <Field label="반복 횟수">
          <NumberInput
            value={data.count as number}
            onChange={(v) => onChange({ count: v })}
            placeholder="3"
          />
        </Field>
      )}
      {mode === 'until' && (
        <Field label="최대 반복 횟수 (무한루프 방지)">
          <NumberInput
            value={data.maxCount as number}
            onChange={(v) => onChange({ maxCount: v })}
            placeholder="100"
          />
        </Field>
      )}
    </>
  )
}
