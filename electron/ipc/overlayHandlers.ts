import { ipcMain, IpcMainEvent } from 'electron'
import { createOverlayWindow } from '../overlayWindow'
import { captureScreenBase64 } from './captureHandlers'

export function registerOverlayHandlers(): void {
  ipcMain.handle('capture:openOverlay', (_e, mode: 'point' | 'region') => {
    return new Promise<unknown>(async (resolve) => {
      const screenshotB64 = await captureScreenBase64()
      const win = createOverlayWindow()

      win.webContents.once('did-finish-load', () => {
        win.webContents.send('overlay:init', { screenshotB64, mode })
      })

      const onComplete = (_ev: IpcMainEvent, result: unknown) => {
        ipcMain.removeListener('overlay:cancel', onCancel)
        win.removeAllListeners('closed')
        if (!win.isDestroyed()) win.close()
        resolve(result)
      }

      const onCancel = () => {
        ipcMain.removeListener('overlay:complete', onComplete)
        win.removeAllListeners('closed')
        if (!win.isDestroyed()) win.close()
        resolve(null)
      }

      ipcMain.once('overlay:complete', onComplete)
      ipcMain.once('overlay:cancel', onCancel)

      win.once('closed', () => {
        ipcMain.removeListener('overlay:complete', onComplete)
        ipcMain.removeListener('overlay:cancel', onCancel)
        resolve(null)
      })
    })
  })
}
