import React from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { baseStyle, labelStyle } from '../nodeStyles'

export default function OCRReadNode({ data }: NodeProps) {
  return (
    <div style={baseStyle('#1a4a2a')}>
      <Handle type="target" position={Position.Top} />
      <p style={labelStyle}>OCRRead</p>
      <small style={{ color: '#aaa' }}>{data.expect ?? '기댓값 미설정'}</small>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <Handle type="source" position={Position.Bottom} id="match" style={{ left: '30%' }} />
        <Handle type="source" position={Position.Bottom} id="noMatch" style={{ left: '70%' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#888', marginTop: 2 }}>
        <span>일치</span><span>불일치</span>
      </div>
    </div>
  )
}
