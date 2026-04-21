import React from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { baseStyle, labelStyle } from '../nodeStyles'

export default function WaitForImageNode({ data }: NodeProps) {
  const timeout = data.timeout as number | undefined
  return (
    <div style={baseStyle('#1a3a4a')}>
      <Handle type="target" position={Position.Top} />
      <p style={labelStyle}>WaitForImage</p>
      <small style={{ color: '#aaa' }}>{data.template ?? '템플릿 미설정'}</small>
      {timeout !== undefined && (
        <small style={{ color: '#888', display: 'block' }}>{timeout}ms</small>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <Handle type="source" position={Position.Bottom} id="found" style={{ left: '30%' }} />
        <Handle type="source" position={Position.Bottom} id="timeout" style={{ left: '70%' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#888', marginTop: 2 }}>
        <span>발견</span><span>타임아웃</span>
      </div>
    </div>
  )
}
