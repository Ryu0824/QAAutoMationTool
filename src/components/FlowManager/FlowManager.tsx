import React, { useEffect, useState } from 'react'
import { useFlowStore } from '../../store/flowStore'

declare global {
  interface Window {
    api: {
      flow: {
        save: (name: string, data: unknown) => Promise<{ ok: boolean }>
        load: (name: string) => Promise<{ nodes: unknown[]; edges: unknown[] }>
        list: () => Promise<string[]>
        delete: (name: string) => Promise<{ ok: boolean }>
        setPath: (path: string) => Promise<{ ok: boolean; path: string }>
      }
      capture: {
        screen: () => Promise<string>
        region: (x: number, y: number, w: number, h: number) => Promise<string>
      }
      action: {
        click: (x: number, y: number, button?: 'left' | 'right') => Promise<{ ok: boolean }>
        keyInput: (keys: string[]) => Promise<{ ok: boolean }>
        drag: (fromX: number, fromY: number, toX: number, toY: number) => Promise<{ ok: boolean }>
      }
      python: {
        match: (screenB64: string, templateB64: string, threshold?: number) => Promise<{ found: boolean; x: number; y: number; confidence: number }>
        ocr: (imageB64: string, region?: { x: number; y: number; w: number; h: number }) => Promise<{ text: string }>
      }
      template: {
        openDialog: () => Promise<string | null>
        list: () => Promise<string[]>
        load: (name: string) => Promise<string>
        delete: (name: string) => Promise<{ ok: boolean }>
      }
    }
  }
}

export default function FlowManager(): React.ReactElement {
  const [flowList, setFlowList] = useState<string[]>([])
  const { nodes, edges, currentFlowName, loadFlow, resetFlow, setCurrentFlowName } = useFlowStore()

  const refresh = async () => {
    const list = await window.api.flow.list()
    setFlowList(list)
  }

  useEffect(() => { refresh() }, [])

  const handleSave = async () => {
    const name = currentFlowName ?? prompt('플로우 이름 입력:')
    if (!name) return
    await window.api.flow.save(name, { nodes, edges })
    setCurrentFlowName(name)
    refresh()
  }

  const handleLoad = async (name: string) => {
    const data = await window.api.flow.load(name)
    loadFlow(name, data.nodes as never, data.edges as never)
  }

  const handleDelete = async (name: string) => {
    if (!confirm(`"${name}" 플로우를 삭제할까요?`)) return
    await window.api.flow.delete(name)
    if (currentFlowName === name) resetFlow()
    refresh()
  }

  const handleNew = () => resetFlow()

  return (
    <div style={styles.container}>
      <select
        style={styles.select}
        value={currentFlowName ?? ''}
        onChange={(e) => e.target.value && handleLoad(e.target.value)}
      >
        <option value="">-- 플로우 선택 --</option>
        {flowList.map(name => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>
      <button style={styles.btn} onClick={handleNew}>새 플로우</button>
      <button style={{ ...styles.btn, background: '#e94560' }} onClick={handleSave}>저장</button>
      {currentFlowName && (
        <button style={{ ...styles.btn, background: '#333' }} onClick={() => handleDelete(currentFlowName)}>삭제</button>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' },
  select: {
    background: '#0f3460',
    color: '#e0e0e0',
    border: '1px solid #1a4a8a',
    borderRadius: 4,
    padding: '4px 8px',
    fontSize: 13
  },
  btn: {
    background: '#0f3460',
    color: '#e0e0e0',
    border: '1px solid #1a4a8a',
    borderRadius: 4,
    padding: '4px 12px',
    fontSize: 13,
    cursor: 'pointer'
  }
}
