import React from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { baseStyle, labelStyle } from '../nodeStyles'

export default function SubFlowNode({ data }: NodeProps) {
  return (
    <div style={baseStyle('#3a1a4a')}>
      <Handle type="target" position={Position.Top} />
      <p style={labelStyle}>SubFlow</p>
      <small style={{ color: '#aaa' }}>{data.flowName ?? '플로우 미선택'}</small>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
