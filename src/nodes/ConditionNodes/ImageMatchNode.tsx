import React from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { baseStyle, labelStyle } from '../nodeStyles'

export default function ImageMatchNode({ data }: NodeProps) {
  return (
    <div style={baseStyle('#1a4a2a')}>
      <Handle type="target" position={Position.Top} />
      <p style={labelStyle}>ImageMatch</p>
      <small style={{ color: '#aaa' }}>{data.template ?? '템플릿 미설정'}</small>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <Handle type="source" position={Position.Bottom} id="found" style={{ left: '30%' }} />
        <Handle type="source" position={Position.Bottom} id="notFound" style={{ left: '70%' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#888', marginTop: 2 }}>
        <span>발견</span><span>미발견</span>
      </div>
    </div>
  )
}
