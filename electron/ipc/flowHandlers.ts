import { ipcMain, app } from 'electron'
import { promises as fs } from 'fs'
import { join } from 'path'

let flowsDir = join(app.getPath('userData'), 'flows')

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true })
}

export function registerFlowHandlers(): void {
  ipcMain.handle('flow:save', async (_e, name: string, data: unknown) => {
    await ensureDir(flowsDir)
    const filePath = join(flowsDir, `${name}.flow.json`)
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
    return { ok: true }
  })

  ipcMain.handle('flow:load', async (_e, name: string) => {
    const filePath = join(flowsDir, `${name}.flow.json`)
    const raw = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(raw)
  })

  ipcMain.handle('flow:list', async () => {
    await ensureDir(flowsDir)
    const files = await fs.readdir(flowsDir)
    return files
      .filter(f => f.endsWith('.flow.json'))
      .map(f => f.replace('.flow.json', ''))
  })

  ipcMain.handle('flow:delete', async (_e, name: string) => {
    const filePath = join(flowsDir, `${name}.flow.json`)
    await fs.unlink(filePath)
    return { ok: true }
  })

  ipcMain.handle('flow:setPath', async (_e, newPath: string) => {
    await ensureDir(newPath)
    flowsDir = newPath
    return { ok: true, path: flowsDir }
  })
}
