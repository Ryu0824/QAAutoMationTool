import React, { useEffect, useRef } from 'react'
import { useFlowStore } from '../../store/flowStore'

export default function LogPanel() {
  const { execLog, execStatus } = useFlowStore()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [execLog])

  if (execLog.length === 0 && execStatus === 'idle') return null

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span style={styles.title}>실행 로그</span>
        <span style={styles.count}>{execLog.length}줄</span>
      </div>
      <div style={styles.body}>
        {execLog.map((line, i) => (
          <div key={i} style={lineStyle(line)}>{line}</div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

function lineStyle(line: string): React.CSSProperties {
  if (line.startsWith('✓')) return { color: '#2aaa4a', fontSize: 12, padding: '1px 0' }
  if (line.startsWith('✗')) return { color: '#e94560', fontSize: 12, padding: '1px 0' }
  if (line.startsWith('—')) return { color: '#888', fontSize: 12, padding: '1px 0' }
  if (line.startsWith('  →')) return { color: '#aaa', fontSize: 11, padding: '1px 0 1px 8px' }
  return { color: '#e0e0e0', fontSize: 12, padding: '1px 0' }
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    height: 160,
    background: '#0d0d1a',
    borderTop: '1px solid #0f3460',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '4px 12px',
    borderBottom: '1px solid #0f3460',
    flexShrink: 0
  },
  title: { fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 },
  count: { fontSize: 10, color: '#555' },
  body: {
    overflowY: 'auto',
    flex: 1,
    padding: '6px 12px',
    fontFamily: 'monospace'
  }
}
