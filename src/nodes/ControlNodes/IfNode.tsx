import React from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { baseStyle, labelStyle } from '../nodeStyles'

export default function IfNode({ data }: NodeProps) {
  const varName = (data.varName as string) || '변수 미설정'
  const operator = (data.operator as string) ?? 'exists'
  const compareValue = data.compareValue as string | undefined

  const summary = operator === 'exists'
    ? `$${varName} 존재 여부`
    : `$${varName} ${operator} ${compareValue ?? '?'}`

  return (
    <div style={baseStyle('#3a1a4a')}>
      <Handle type="target" position={Position.Top} />
      <p style={labelStyle}>If</p>
      <small style={{ color: '#aaa' }}>{summary}</small>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <Handle type="source" position={Position.Bottom} id="true" style={{ left: '30%' }} />
        <Handle type="source" position={Position.Bottom} id="false" style={{ left: '70%' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#888', marginTop: 2 }}>
        <span>참</span><span>거짓</span>
      </div>
    </div>
  )
}
