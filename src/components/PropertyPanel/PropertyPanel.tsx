import React from 'react'
import { useFlowStore } from '../../store/flowStore'
import ClickForm from './forms/ClickForm'
import KeyInputForm from './forms/KeyInputForm'
import DragForm from './forms/DragForm'
import DelayForm from './forms/DelayForm'
import ImageMatchForm from './forms/ImageMatchForm'
import OCRReadForm from './forms/OCRReadForm'
import LoopForm from './forms/LoopForm'
import SubFlowForm from './forms/SubFlowForm'
import FocusWindowForm from './forms/FocusWindowForm'

const FORM_MAP: Record<string, React.ComponentType<{ data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }>> = {
  Click: ClickForm,
  KeyInput: KeyInputForm,
  Drag: DragForm,
  Delay: DelayForm,
  ImageMatch: ImageMatchForm,
  OCRRead: OCRReadForm,
  Loop: LoopForm,
  SubFlow: SubFlowForm,
  FocusWindow: FocusWindowForm
}

const NODE_LABEL: Record<string, string> = {
  Click: '클릭', KeyInput: '키 입력', Drag: '드래그', Delay: '대기', FocusWindow: '창 포커스',
  ImageMatch: '이미지 탐색', OCRRead: 'OCR 읽기', Loop: '반복', Sequence: '순차 실행', SubFlow: '서브플로우'
}

export default function PropertyPanel() {
  const { nodes, edges, selectedNodeId, updateNodeData, selectNode, setNodes, setEdges } = useFlowStore()
  const node = nodes.find((n) => n.id === selectedNodeId)

  const handleDelete = () => {
    if (!node) return
    setNodes(nodes.filter((n) => n.id !== node.id))
    setEdges(edges.filter((e) => e.source !== node.id && e.target !== node.id))
    selectNode(null)
  }

  if (!node) {
    return (
      <aside style={styles.panel}>
        <p style={styles.empty}>노드를 선택하면<br />속성이 표시됩니다</p>
      </aside>
    )
  }

  const Form = FORM_MAP[node.type ?? '']
  const data = node.data as Record<string, unknown>

  return (
    <aside style={styles.panel}>
      <div style={styles.header}>
        <span style={styles.nodeType}>{NODE_LABEL[node.type ?? ''] ?? node.type}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button style={styles.deleteBtn} onClick={handleDelete} title="노드 삭제">🗑</button>
          <button style={styles.closeBtn} onClick={() => selectNode(null)}>✕</button>
        </div>
      </div>

      <div style={styles.body}>
        <div style={styles.section}>
          <label style={styles.sectionLabel}>노드 이름</label>
          <input
            style={styles.input}
            value={(data.label as string) ?? ''}
            placeholder={node.type}
            onChange={(e) => updateNodeData(node.id, { label: e.target.value })}
          />
        </div>

        <div style={styles.divider} />

        {Form ? (
          <Form
            data={data}
            onChange={(patch) => updateNodeData(node.id, patch)}
          />
        ) : (
          <p style={{ color: '#666', fontSize: 12 }}>설정 항목이 없습니다</p>
        )}
      </div>
    </aside>
  )
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    width: 240,
    background: '#16213e',
    borderLeft: '1px solid #0f3460',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    overflow: 'hidden'
  },
  empty: {
    color: '#555',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 60,
    lineHeight: 1.8
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px',
    borderBottom: '1px solid #0f3460',
    flexShrink: 0
  },
  nodeType: {
    fontSize: 14,
    fontWeight: 700,
    color: '#e94560'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#666',
    fontSize: 14,
    cursor: 'pointer',
    padding: '2px 6px'
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#e94560',
    fontSize: 14,
    cursor: 'pointer',
    padding: '2px 6px'
  },
  body: {
    padding: '14px',
    overflowY: 'auto',
    flex: 1
  },
  section: {
    marginBottom: 14
  },
  sectionLabel: {
    display: 'block',
    fontSize: 11,
    color: '#888',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  input: {
    width: '100%',
    background: '#0f3460',
    border: '1px solid #1a4a8a',
    borderRadius: 4,
    color: '#e0e0e0',
    padding: '5px 8px',
    fontSize: 13,
    boxSizing: 'border-box'
  },
  divider: {
    height: 1,
    background: '#0f3460',
    margin: '4px 0 14px'
  }
}
