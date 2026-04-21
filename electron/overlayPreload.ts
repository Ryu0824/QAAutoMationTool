import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('overlayApi', {
  onInit: (cb: (data: { screenshotB64: string; mode: 'point' | 'region' }) => void) => {
    ipcRenderer.on('overlay:init', (_e, data) => cb(data))
  },
  complete: (result: unknown) => ipcRenderer.send('overlay:complete', result),
  cancel: () => ipcRenderer.send('overlay:cancel')
})
