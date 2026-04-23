import { ipcMain, app } from 'electron'
import { promises as fs } from 'fs'
import { join } from 'path'

let flowsDir = join(app.getPath('userData'), 'flows')

function getFlowPath(name: string): string {
  return join(flowsDir, `${name}.flow.json`)
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true })
}

export function registerFlowHandlers(): void {
  ipcMain.handle('flow:save', async (_e, name: string, data: unknown) => {
    await ensureDir(flowsDir)
    await fs.writeFile(getFlowPath(name), JSON.stringify(data, null, 2), 'utf-8')
    return { ok: true }
  })

  ipcMain.handle('flow:load', async (_e, name: string) => {
    const raw = await fs.readFile(getFlowPath(name), 'utf-8')
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
    await fs.unlink(getFlowPath(name))
    return { ok: true }
  })

  ipcMain.handle('flow:rename', async (_e, oldName: string, newName: string) => {
    await fs.rename(getFlowPath(oldName), getFlowPath(newName))
    return { ok: true }
  })

  ipcMain.handle('flow:setPath', async (_e, newPath: string) => {
    await ensureDir(newPath)
    flowsDir = newPath
    return { ok: true, path: flowsDir }
  })
}
