import React, { useEffect, useState } from 'react'
import { Field } from '../fields'

interface Props {
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
}

export default function SubFlowForm({ data, onChange }: Props) {
  const [list, setList] = useState<string[]>([])

  useEffect(() => {
    window.api.flow.list().then(setList).catch(() => setList([]))
  }, [])

  return (
    <Field label="호출할 플로우">
      <select
        style={selectStyle}
        value={(data.flowName as string) ?? ''}
        onChange={(e) => onChange({ flowName: e.target.value })}
      >
        <option value="">-- 선택 --</option>
        {list.map((name) => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>
    </Field>
  )
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  background: '#0f3460',
  border: '1px solid #1a4a8a',
  borderRadius: 4,
  color: '#e0e0e0',
  padding: '5px 8px',
  fontSize: 13,
  boxSizing: 'border-box'
}
