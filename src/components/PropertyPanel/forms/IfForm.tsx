import React from 'react'
import { Field, SelectInput, TextInput } from '../fields'

interface Props {
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
}

const OPERATORS = [
  { label: '존재 여부 (exists)', value: 'exists' },
  { label: '== 같음', value: '==' },
  { label: '!= 다름', value: '!=' },
  { label: '> 초과', value: '>' },
  { label: '< 미만', value: '<' },
  { label: '>= 이상', value: '>=' },
  { label: '<= 이하', value: '<=' },
  { label: 'contains 포함', value: 'contains' },
  { label: 'regex 정규식', value: 'regex' },
]

export default function IfForm({ data, onChange }: Props) {
  const operator = (data.operator as string) ?? 'exists'

  return (
    <>
      <Field label="변수명">
        <TextInput
          value={data.varName as string}
          onChange={(v) => onChange({ varName: v })}
          placeholder="예: matchResult"
        />
      </Field>
      <Field label="조건 연산자">
        <SelectInput
          value={operator}
          options={OPERATORS}
          onChange={(v) => onChange({ operator: v })}
        />
      </Field>
      {operator !== 'exists' && (
        <Field label="비교값">
          <TextInput
            value={data.compareValue as string}
            onChange={(v) => onChange({ compareValue: v })}
            placeholder="예: 100, hello"
          />
        </Field>
      )}
    </>
  )
}
