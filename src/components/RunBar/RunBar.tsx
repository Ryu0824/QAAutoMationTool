import React, { useRef } from 'react'
import { useFlowStore } from '../../store/flowStore'
import { FlowExecutor } from '../../engine/executor'

export default function RunBar() {
  const { nodes, edges, execStatus, setExecStatus, setExecNodeId, appendLog, clearLog } = useFlowStore()
  const executorRef = useRef<FlowExecutor | null>(null)

  const handleRun = async () => {
    clearLog()
    setExecStatus('running')
    setExecNodeId(null)

    const executor = new FlowExecutor(nodes, edges)
    executorRef.current = executor

    executor.onNodeStart = (id) => setExecNodeId(id)
    executor.onLog = (msg) => appendLog(msg)

    try {
      await executor.run()
      setExecStatus('done')
      setExecNodeId(null)
      appendLog('✓ 플로우 완료')
    } catch (e) {
      setExecStatus('error')
      setExecNodeId(null)
      appendLog(`✗ 오류: ${(e as Error).message}`)
    }
  }

  const handleStop = () => {
    executorRef.current?.stop()
    executorRef.current = null
    setExecStatus('idle')
    setExecNodeId(null)
    appendLog('— 실행 중단')
  }

  const isRunning = execStatus === 'running'

  return (
    <div style={styles.container}>
      {!isRunning ? (
        <button style={{ ...styles.btn, background: '#1a6a2a', borderColor: '#2aaa4a' }} onClick={handleRun}>
          ▶ 실행
        </button>
      ) : (
        <button style={{ ...styles.btn, background: '#6a1a1a', borderColor: '#aa2a2a' }} onClick={handleStop}>
          ■ 중지
        </button>
      )}
      <span style={statusStyle(execStatus)}>
        {STATUS_LABEL[execStatus]}
      </span>
    </div>
  )
}

const STATUS_LABEL: Record<string, string> = {
  idle: '대기',
  running: '실행 중...',
  done: '완료',
  error: '오류'
}

function statusStyle(status: string): React.CSSProperties {
  const colors: Record<string, string> = {
    idle: '#666', running: '#f0c040', done: '#2aaa4a', error: '#e94560'
  }
  return { fontSize: 12, color: colors[status] ?? '#666' }
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', alignItems: 'center', gap: 10 },
  btn: {
    border: '1px solid',
    borderRadius: 4,
    color: '#fff',
    padding: '4px 14px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer'
  }
}
