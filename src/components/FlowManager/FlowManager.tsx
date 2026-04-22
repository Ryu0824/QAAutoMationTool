import React, { useEffect, useState } from 'react'
import { useFlowStore } from '../../store/flowStore'
import UnsavedChangesModal from './UnsavedChangesModal'

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
      app: {
        onBeforeClose: (cb: () => void) => () => void
        confirmClose: () => void
      }
    }
  }
}

export default function FlowManager(): React.ReactElement {
  const [flowList, setFlowList] = useState<string[]>([])
  const [savingName, setSavingName] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<{ fn: () => void; hideSave?: boolean } | null>(null)
  const { nodes, edges, currentFlowName, isDirty, loadFlow, resetFlow, setCurrentFlowName, markSaved } = useFlowStore()

  const refresh = async () => {
    const list = await window.api.flow.list()
    setFlowList(list)
  }

  useEffect(() => { refresh() }, [])

  const handleSave = async () => {
    if (currentFlowName) {
      await window.api.flow.save(currentFlowName, { nodes, edges })
      markSaved()
      refresh()
    } else {
      setSavingName('')
    }
  }

  const handleSaveConfirm = async () => {
    if (!savingName?.trim()) return
    await window.api.flow.save(savingName.trim(), { nodes, edges })
    setCurrentFlowName(savingName.trim())
    markSaved()
    setSavingName(null)
    refresh()
  }

  const doLoad = async (name: string) => {
    const data = await window.api.flow.load(name)
    loadFlow(name, data.nodes as never, data.edges as never)
  }

  const handleLoad = (name: string) => {
    if (isDirty) {
      setPendingAction({ fn: () => doLoad(name) })
    } else {
      doLoad(name)
    }
  }

  const doDelete = async (name: string) => {
    await window.api.flow.delete(name)
    if (currentFlowName === name) resetFlow()
    refresh()
  }

  const handleDelete = (name: string) => {
    if (!confirm(`"${name}" 플로우를 삭제할까요?`)) return
    if (isDirty && currentFlowName === name) {
      setPendingAction({ fn: () => doDelete(name), hideSave: true })
    } else {
      doDelete(name)
    }
  }

  const doNew = () => resetFlow()

  const handleNew = () => {
    if (isDirty) {
      setPendingAction({ fn: doNew })
    } else {
      doNew()
    }
  }

  const handleModalSave = async () => {
    if (pendingAction) {
      const next = pendingAction.fn
      setPendingAction(null)
      await handleSave()
      next()
    }
  }

  const handleModalDiscard = () => {
    if (pendingAction) {
      const next = pendingAction.fn
      setPendingAction(null)
      next()
    }
  }

  const handleModalCancel = () => setPendingAction(null)

  return (
    <div style={styles.container}>
      {pendingAction && (
        <UnsavedChangesModal
          hideSave={pendingAction.hideSave}
          onSave={handleModalSave}
          onDiscard={handleModalDiscard}
          onCancel={handleModalCancel}
        />
      )}
      {savingName !== null ? (
        <>
          <input
            autoFocus
            style={styles.input}
            placeholder="플로우 이름 입력"
            value={savingName}
            onChange={(e) => setSavingName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveConfirm()
              if (e.key === 'Escape') setSavingName(null)
            }}
          />
          <button style={{ ...styles.btn, background: '#e94560' }} onClick={handleSaveConfirm}>확인</button>
          <button style={{ ...styles.btn, background: '#333' }} onClick={() => setSavingName(null)}>취소</button>
        </>
      ) : (
        <>
          <select
            style={styles.select}
            value={currentFlowName ?? ''}
            onChange={(e) => { if (e.target.value) handleLoad(e.target.value) }}
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
        </>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' },
  input: {
    background: '#0f3460',
    color: '#e0e0e0',
    border: '1px solid #e94560',
    borderRadius: 4,
    padding: '4px 8px',
    fontSize: 13,
    outline: 'none',
    width: 160
  },
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
