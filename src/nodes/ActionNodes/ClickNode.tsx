import React from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { baseStyle, labelStyle } from '../nodeStyles'

const CLICK_LABEL: Record<string, string> = {
  single: 'Click',
  double: 'Double Click',
  right: 'Right Click'
}

export default function ClickNode({ data }: NodeProps) {
  return (
    <div style={baseStyle('#0f3460')}>
      <Handle type="target" position={Position.Top} />
      <p style={labelStyle}>{CLICK_LABEL[data.clickType as string] ?? 'Click'}</p>
      <small style={{ color: '#aaa' }}>{data.x != null ? `(${data.x}, ${data.y})` : '좌표 미설정'}</small>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
