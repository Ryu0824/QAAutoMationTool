import React from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'

export default function StartNode(_: NodeProps) {
  return (
    <div style={style}>
      <span>▶ START</span>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

const style: React.CSSProperties = {
  background: '#1a6a2a',
  border: '2px solid #2aaa4a',
  borderRadius: 20,
  padding: '8px 20px',
  color: '#fff',
  fontWeight: 700,
  fontSize: 13,
  textAlign: 'center'
}
