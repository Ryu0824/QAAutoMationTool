import React, { useEffect, useRef, useState } from 'react'

type Mode = 'point' | 'region'

interface InitData {
  screenshotB64: string
  mode: Mode
}

interface Selection {
  startX: number
  startY: number
  endX: number
  endY: number
}

declare global {
  interface Window {
    overlayApi: {
      onInit: (cb: (data: InitData) => void) => void
      complete: (result: unknown) => void
      cancel: () => void
    }
  }
}

export default function OverlayApp() {
  const [initData, setInitData] = useState<InitData | null>(null)
  const [dragging, setDragging] = useState(false)
  const [selection, setSelection] = useState<Selection | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    window.overlayApi.onInit(setInitData)

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') window.overlayApi.cancel()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  if (!initData) return null

  const { screenshotB64, mode } = initData

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    if (mode === 'point') {
      window.overlayApi.complete({ x: e.clientX, y: e.clientY })
      return
    }
    setDragging(true)
    setSelection({ startX: e.clientX, startY: e.clientY, endX: e.clientX, endY: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return
    setSelection(s => s ? { ...s, endX: e.clientX, endY: e.clientY } : null)
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!dragging || !selection) return
    setDragging(false)

    const x = Math.min(selection.startX, e.clientX)
    const y = Math.min(selection.startY, e.clientY)
    const w = Math.abs(e.clientX - selection.startX)
    const h = Math.abs(e.clientY - selection.startY)

    if (w < 4 || h < 4) {
      setSelection(null)
      return
    }

    const img = imgRef.current!
    const scaleX = img.naturalWidth / img.offsetWidth
    const scaleY = img.naturalHeight / img.offsetHeight
    const sx = x * scaleX
    const sy = y * scaleY
    const sw = w * scaleX
    const sh = h * scaleY
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(sw)
    canvas.height = Math.round(sh)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
    const imageBase64 = canvas.toDataURL('image/png').split(',')[1]

    window.overlayApi.complete({ x, y, w, h, imageBase64 })
  }

  const selRect = selection ? {
    left: Math.min(selection.startX, selection.endX),
    top: Math.min(selection.startY, selection.endY),
    width: Math.abs(selection.endX - selection.startX),
    height: Math.abs(selection.endY - selection.startY)
  } : null

  return (
    <div
      style={{ width: '100vw', height: '100vh', position: 'relative', cursor: 'crosshair' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <img
        ref={imgRef}
        src={`data:image/png;base64,${screenshotB64}`}
        style={{ width: '100%', height: '100%', display: 'block', userSelect: 'none', pointerEvents: 'none' }}
        draggable={false}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', pointerEvents: 'none' }} />
      {selRect && (
        <>
          <div style={{
            position: 'absolute',
            left: selRect.left, top: selRect.top,
            width: selRect.width, height: selRect.height,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)',
            background: 'transparent',
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            left: selRect.left, top: selRect.top,
            width: selRect.width, height: selRect.height,
            border: '2px solid #00aaff',
            background: 'rgba(0,170,255,0.08)',
            pointerEvents: 'none',
            boxSizing: 'border-box'
          }} />
          <div style={{
            position: 'absolute',
            left: selRect.left + selRect.width / 2,
            top: selRect.top + selRect.height + 8,
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.75)',
            color: '#fff',
            padding: '3px 8px',
            borderRadius: 4,
            fontSize: 11,
            pointerEvents: 'none',
            whiteSpace: 'nowrap'
          }}>
            {selRect.width} × {selRect.height}
          </div>
        </>
      )}
      <div style={{
        position: 'absolute',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.75)',
        color: '#fff',
        padding: '7px 16px',
        borderRadius: 6,
        fontSize: 13,
        pointerEvents: 'none',
        whiteSpace: 'nowrap'
      }}>
        {mode === 'point' ? '클릭하여 좌표 선택' : '드래그하여 영역 선택'} · ESC 취소
      </div>
    </div>
  )
}
