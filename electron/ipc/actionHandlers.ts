import { ipcMain } from 'electron'
import { mouse, keyboard, Key, Button, straightTo, Point } from '@nut-tree-fork/nut-js'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export function registerActionHandlers(): void {
  ipcMain.handle('action:click', async (_e, x: number, y: number, clickType: 'single' | 'double' | 'right' = 'single') => {
    await mouse.setPosition(new Point(x, y))
    if (clickType === 'double') {
      await mouse.doubleClick(Button.LEFT)
    } else {
      const btn = clickType === 'right' ? Button.RIGHT : Button.LEFT
      await mouse.click(btn)
    }
    return { ok: true }
  })

  ipcMain.handle('action:keyInput', async (_e, keys: string[]) => {
    const mapped = keys.map(k => Key[k as keyof typeof Key]).filter(Boolean)
    if (mapped.length === 1) {
      await keyboard.pressKey(mapped[0])
      await keyboard.releaseKey(mapped[0])
    } else {
      await keyboard.pressKey(...mapped)
      await keyboard.releaseKey(...mapped)
    }
    return { ok: true }
  })

  ipcMain.handle('action:drag', async (_e, fromX: number, fromY: number, toX: number, toY: number) => {
    await mouse.setPosition(new Point(fromX, fromY))
    await mouse.pressButton(Button.LEFT)
    await mouse.move(straightTo(new Point(toX, toY)))
    await mouse.releaseButton(Button.LEFT)
    return { ok: true }
  })

  ipcMain.handle('action:focusWindow', async (_e, windowTitle: string, delayAfter = 300) => {
    const ps = `(New-Object -ComObject WScript.Shell).AppActivate('${windowTitle.replace(/'/g, "''")}')`
    const encoded = Buffer.from(ps, 'utf16le').toString('base64')
    await execAsync(`powershell -EncodedCommand ${encoded}`)
    await new Promise(r => setTimeout(r, delayAfter))
    return { ok: true }
  })

  ipcMain.handle('action:listWindows', async () => {
    const ps = `Get-Process | Where-Object { $_.MainWindowTitle -ne '' } | Select-Object -ExpandProperty MainWindowTitle`
    const encoded = Buffer.from(ps, 'utf16le').toString('base64')
    const { stdout } = await execAsync(`powershell -EncodedCommand ${encoded}`)
    return stdout.split('\n').map(s => s.trim()).filter(Boolean)
  })
}
