import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { registerFlowHandlers } from './ipc/flowHandlers'
import { registerCaptureHandlers } from './ipc/captureHandlers'
import { registerActionHandlers } from './ipc/actionHandlers'
import { registerPythonHandlers } from './ipc/pythonHandlers'
import { registerTemplateHandlers } from './ipc/templateHandlers'
import { registerOcrHandlers, terminateOcrWorker } from './ipc/ocrHandlers'
import { registerOverlayHandlers } from './ipc/overlayHandlers'

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 600,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    title: 'NodeBasicTool',
    show: false
  })

  win.once('ready-to-show', () => win.show())

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  registerFlowHandlers()
  registerCaptureHandlers()
  registerActionHandlers()
  registerPythonHandlers()
  registerTemplateHandlers()
  registerOcrHandlers()
  registerOverlayHandlers()

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  terminateOcrWorker()
  if (process.platform !== 'darwin') app.quit()
})
