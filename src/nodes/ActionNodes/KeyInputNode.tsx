import React from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { baseStyle, labelStyle } from '../nodeStyles'

export default function KeyInputNode({ data }: NodeProps) {
  return (
    <div style={baseStyle('#0f3460')}>
      <Handle type="target" position={Position.Top} />
      <p style={labelStyle}>KeyInput</p>
      <small style={{ color: '#aaa' }}>{data.keys?.join(' + ') ?? '키 미설정'}</small>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
