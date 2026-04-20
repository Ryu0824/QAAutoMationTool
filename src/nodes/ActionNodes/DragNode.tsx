import React from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { baseStyle, labelStyle } from '../nodeStyles'

export default function DragNode({ data }: NodeProps) {
  return (
    <div style={baseStyle('#0f3460')}>
      <Handle type="target" position={Position.Top} />
      <p style={labelStyle}>Drag</p>
      <small style={{ color: '#aaa' }}>
        {data.fromX != null ? `(${data.fromX},${data.fromY}) → (${data.toX},${data.toY})` : '좌표 미설정'}
      </small>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
