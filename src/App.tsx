import React from 'react'
import NodeEditor from './components/NodeEditor/NodeEditor'
import NodePanel from './components/NodePanel/NodePanel'
import FlowManager from './components/FlowManager/FlowManager'
import PropertyPanel from './components/PropertyPanel/PropertyPanel'
import RunBar from './components/RunBar/RunBar'
import LogPanel from './components/LogPanel/LogPanel'

export default function App(): React.ReactElement {
  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      <header style={styles.header}>
        <span style={styles.title}>NodeBasicTool</span>
        <RunBar />
        <FlowManager />
      </header>
      <div style={styles.body}>
        <NodePanel />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <NodeEditor />
          <LogPanel />
        </div>
        <PropertyPanel />
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    height: 48,
    background: '#16213e',
    borderBottom: '1px solid #0f3460',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    gap: 16,
    flexShrink: 0
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: '#e94560',
    letterSpacing: 1
  },
  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden'
  }
}
