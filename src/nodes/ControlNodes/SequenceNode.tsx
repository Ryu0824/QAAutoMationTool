import React from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { baseStyle, labelStyle } from '../nodeStyles'

export default function SequenceNode(_: NodeProps) {
  return (
    <div style={baseStyle('#3a1a4a')}>
      <Handle type="target" position={Position.Top} />
      <p style={labelStyle}>Sequence</p>
      <small style={{ color: '#aaa' }}>순차 실행</small>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
