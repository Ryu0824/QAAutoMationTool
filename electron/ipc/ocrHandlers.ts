import { ipcMain, app } from 'electron'
import { createWorker, type Worker } from 'tesseract.js'
import { join } from 'path'
import Jimp from 'jimp'

let worker: Worker | null = null
const cachePath = join(app.getPath('userData'), 'tessdata')

async function getWorker(): Promise<Worker> {
  if (!worker) {
    console.log('[OCR] worker 초기화 중... (최초 실행 시 언어 데이터 다운로드)')
    worker = await createWorker('kor+eng', 1, {
      cachePath,
      logger: (m) => {
        if (m.status === 'loading tesseract core' || m.status === 'initializing tesseract') {
          console.log(`[OCR] ${m.status}`)
        }
      }
    })
    console.log('[OCR] worker 준비 완료')
  }
  return worker
}

async function preprocessImage(buf: Buffer): Promise<Buffer> {
  const img = await Jimp.read(buf)
  img.greyscale().contrast(0.3)
  return img.getBuffer('image/png')
}

export function registerOcrHandlers(): void {
  ipcMain.handle('python:ocr', async (_e, imageB64: string, region?: { x: number; y: number; w: number; h: number }) => {
    try {
      const raw = Buffer.from(imageB64, 'base64')
      const buf = await preprocessImage(raw)
      const w = await getWorker()

      const options = region
        ? { rectangle: { left: region.x, top: region.y, width: region.w, height: region.h } }
        : {}

      const result = await w.recognize(buf, options)
      const text = result.data.text.trim()
      console.log(`[OCR] 결과: "${text.slice(0, 80)}"`)
      return { text }
    } catch (e) {
      console.error('[OCR] 오류:', e)
      return { text: '', error: (e as Error).message }
    }
  })
}

export async function terminateOcrWorker(): Promise<void> {
  if (worker) {
    await worker.terminate()
    worker = null
  }
}
