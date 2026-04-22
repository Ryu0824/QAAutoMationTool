import React from 'react'

interface Props {
  onSave: () => void
  onDiscard: () => void
  onCancel: () => void
  hideSave?: boolean
}

export default function UnsavedChangesModal({ onSave, onDiscard, onCancel, hideSave }: Props): React.ReactElement {
  return (
    <div style={styles.overlay}>
      <div style={styles.dialog}>
        <p style={styles.message}>저장되지 않은 변경 사항이 있습니다.</p>
        <div style={styles.actions}>
          {!hideSave && (
            <button style={{ ...styles.btn, background: '#e94560' }} onClick={onSave}>저장</button>
          )}
          <button style={{ ...styles.btn, background: '#444' }} onClick={onDiscard}>저장 안 함</button>
          <button style={{ ...styles.btn, background: '#0f3460' }} onClick={onCancel}>취소</button>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  dialog: {
    background: '#16213e',
    border: '1px solid #1a4a8a',
    borderRadius: 8,
    padding: '24px 32px',
    minWidth: 280,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  message: {
    color: '#e0e0e0',
    fontSize: 14,
    margin: 0,
    textAlign: 'center',
  },
  actions: {
    display: 'flex',
    gap: 8,
    justifyContent: 'center',
  },
  btn: {
    color: '#e0e0e0',
    border: '1px solid #1a4a8a',
    borderRadius: 4,
    padding: '6px 16px',
    fontSize: 13,
    cursor: 'pointer',
  },
}
