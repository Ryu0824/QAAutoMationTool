import React from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { baseStyle, labelStyle } from '../nodeStyles'

export default function DelayNode({ data }: NodeProps) {
  return (
    <div style={baseStyle('#0f3460')}>
      <Handle type="target" position={Position.Top} />
      <p style={labelStyle}>Delay</p>
      <small style={{ color: '#aaa' }}>{data.ms != null ? `${data.ms}ms` : '시간 미설정'}</small>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
