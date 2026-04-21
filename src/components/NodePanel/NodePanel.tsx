import React from 'react'

const NODE_CATALOG = [
  { category: 'Action', items: ['Click', 'KeyInput', 'Drag', 'Delay', 'FocusWindow'] },
  { category: 'Condition', items: ['ImageMatch', 'WaitForImage', 'OCRRead'] },
  { category: 'Control', items: ['Start', 'Loop', 'Sequence', 'SubFlow'] }
]

export default function NodePanel(): React.ReactElement {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/nodebasictool', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <aside style={styles.panel}>
      <p style={styles.hint}>노드를 드래그해서 추가</p>
      {NODE_CATALOG.map(({ category, items }) => (
        <div key={category}>
          <p style={styles.category}>{category}</p>
          {items.map((item) => (
            <div
              key={item}
              draggable
              onDragStart={(e) => onDragStart(e, item)}
              style={styles.node}
            >
              {item}
            </div>
          ))}
        </div>
      ))}
    </aside>
  )
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    width: 180,
    background: '#16213e',
    borderRight: '1px solid #0f3460',
    padding: 12,
    overflowY: 'auto',
    flexShrink: 0
  },
  hint: {
    fontSize: 11,
    color: '#666',
    marginBottom: 12
  },
  category: {
    fontSize: 11,
    fontWeight: 700,
    color: '#e94560',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 4
  },
  node: {
    background: '#0f3460',
    border: '1px solid #1a4a8a',
    borderRadius: 4,
    padding: '6px 10px',
    fontSize: 13,
    marginBottom: 4,
    cursor: 'grab',
    userSelect: 'none'
  }
}
