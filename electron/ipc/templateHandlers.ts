import { ipcMain, app, dialog } from 'electron'
import { promises as fs } from 'fs'
import { join, basename } from 'path'

const templatesDir = () => join(app.getPath('userData'), 'NodeBasicTool', 'templates')

async function ensureDir() {
  await fs.mkdir(templatesDir(), { recursive: true })
}

export function registerTemplateHandlers(): void {
  ipcMain.handle('template:openDialog', async () => {
    const result = await dialog.showOpenDialog({
      title: '템플릿 이미지 선택',
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'bmp'] }],
      properties: ['openFile']
    })
    if (result.canceled || !result.filePaths.length) return null

    await ensureDir()
    const src = result.filePaths[0]
    const name = basename(src)
    const dest = join(templatesDir(), name)
    await fs.copyFile(src, dest)
    return name
  })

  ipcMain.handle('template:list', async () => {
    await ensureDir()
    const files = await fs.readdir(templatesDir())
    return files.filter(f => /\.(png|jpe?g|bmp)$/i.test(f))
  })

  ipcMain.handle('template:load', async (_e, name: string) => {
    const filePath = join(templatesDir(), name)
    const buf = await fs.readFile(filePath)
    return buf.toString('base64')
  })

  ipcMain.handle('template:delete', async (_e, name: string) => {
    const filePath = join(templatesDir(), name)
    await fs.unlink(filePath)
    return { ok: true }
  })

  ipcMain.handle('template:saveCapture', async (_e, imageBase64: string, suggestedName?: string) => {
    await ensureDir()
    const name = suggestedName ?? `capture_${Date.now()}.png`
    const dest = join(templatesDir(), name)
    await fs.writeFile(dest, Buffer.from(imageBase64, 'base64'))
    return name
  })
}
