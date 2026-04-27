import React, { useEffect, useRef, useState } from 'react'

interface TemplateItem {
  name: string
  thumbnail: string
}

interface Props {
  selected: string | undefined
  onSelect: (name: string) => void
  onRefresh?: (refresh: () => void) => void
}

export default function TemplatePicker({ selected, onSelect, onRefresh }: Props) {
  const [items, setItems] = useState<TemplateItem[]>([])
  const [hovered, setHovered] = useState<{ name: string; thumbnail: string; x: number; y: number } | null>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const refresh = () => {
    window.api.template.list().then((list: any) => {
      setItems(Array.isArray(list) ? list : [])
    }).catch(() => setItems([]))
  }

  useEffect(() => {
    refresh()
    onRefresh?.(refresh)
    return () => { if (hoverTimer.current) clearTimeout(hoverTimer.current) }
  }, [])

  const handleDelete = async (name: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await window.api.template.delete(name)
    refresh()
    if (selected === name) onSelect('')
  }

  const handleMouseEnter = (name: string, thumbnail: string, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    hoverTimer.current = setTimeout(() => {
      setHovered({ name, thumbnail, x: rect.right + 8, y: rect.top })
    }, 300)
  }

  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    setHovered(null)
  }

  return (
    <>
      {items.length === 0 && (
        <p style={{ color: '#555', fontSize: 11, marginTop: 6 }}>업로드된 템플릿 없음</p>
      )}

      <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map(({ name, thumbnail }) => (
          <div
            key={name}
            onClick={() => onSelect(name)}
            onMouseEnter={(e) => handleMouseEnter(name, thumbnail, e)}
            onMouseLeave={handleMouseLeave}
            style={itemStyle(name === selected)}
          >
            <img
              src={`data:image/png;base64,${thumbnail}`}
              style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }}
              alt=""
            />
            <span style={{ flex: 1, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {name === selected ? '✓ ' : ''}{name}
            </span>
            <button
              style={deleteBtn}
              onClick={(e) => handleDelete(name, e)}
              title="삭제"
            >✕</button>
          </div>
        ))}
      </div>

      {hovered && (
        <div style={previewPopup(hovered.x, hovered.y)}>
          <img
            src={`data:image/png;base64,${hovered.thumbnail}`}
            style={{ maxWidth: 200, maxHeight: 200, objectFit: 'contain', display: 'block' }}
            alt={hovered.name}
          />
          <p style={{ fontSize: 10, color: '#aaa', marginTop: 4, wordBreak: 'break-all' }}>{hovered.name}</p>
        </div>
      )}
    </>
  )
}

const itemStyle = (selected: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  background: selected ? '#1a3a6a' : '#0a1a3a',
  border: `1px solid ${selected ? '#e94560' : '#1a4a8a'}`,
  borderRadius: 4,
  padding: '4px 8px',
  cursor: 'pointer',
  gap: 8,
})

const deleteBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#666',
  fontSize: 11,
  cursor: 'pointer',
  padding: '0 2px',
  flexShrink: 0,
}

const previewPopup = (x: number, y: number): React.CSSProperties => ({
  position: 'fixed',
  left: x,
  top: y,
  background: '#0a1a3a',
  border: '1px solid #1a4a8a',
  borderRadius: 6,
  padding: 8,
  zIndex: 9999,
  pointerEvents: 'none',
})
