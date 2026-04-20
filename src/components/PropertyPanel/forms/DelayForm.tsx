import React from 'react'
import { Field, NumberInput } from '../fields'

interface Props {
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
}

export default function DelayForm({ data, onChange }: Props) {
  return (
    <Field label="대기 시간 (ms)">
      <NumberInput
        value={data.ms as number}
        onChange={(v) => onChange({ ms: v })}
        placeholder="1000"
      />
    </Field>
  )
}
