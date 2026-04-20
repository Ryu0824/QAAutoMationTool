import React from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { baseStyle, labelStyle } from '../nodeStyles'

export default function LoopNode({ data }: NodeProps) {
  return (
    <div style={baseStyle('#3a1a4a')}>
      <Handle type="target" position={Position.Top} />
      <p style={labelStyle}>Loop</p>
      <small style={{ color: '#aaa' }}>{data.count != null ? `${data.count}회 반복` : '횟수 미설정'}</small>
      <Handle type="source" position={Position.Bottom} id="body" style={{ left: '30%' }} />
      <Handle type="source" position={Position.Bottom} id="done" style={{ left: '70%' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#888', marginTop: 2 }}>
        <span>반복</span><span>완료</span>
      </div>
    </div>
  )
}
