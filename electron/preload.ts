import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  // Flow
  flow: {
    save: (name: string, data: unknown) => ipcRenderer.invoke('flow:save', name, data),
    load: (name: string) => ipcRenderer.invoke('flow:load', name),
    list: () => ipcRenderer.invoke('flow:list'),
    delete: (name: string) => ipcRenderer.invoke('flow:delete', name),
    rename: (oldName: string, newName: string) => ipcRenderer.invoke('flow:rename', oldName, newName),
    setPath: (newPath: string) => ipcRenderer.invoke('flow:setPath', newPath)
  },
  // Capture
  capture: {
    screen: () => ipcRenderer.invoke('capture:screen'),
    region: (x: number, y: number, w: number, h: number) =>
      ipcRenderer.invoke('capture:region', x, y, w, h),
    openOverlay: (mode: 'point' | 'region') =>
      ipcRenderer.invoke('capture:openOverlay', mode)
  },
  // Action
  action: {
    click: (x: number, y: number, clickType?: 'single' | 'double' | 'right') =>
      ipcRenderer.invoke('action:click', x, y, clickType),
    keyInput: (keys: string[]) => ipcRenderer.invoke('action:keyInput', keys),
    drag: (fromX: number, fromY: number, toX: number, toY: number) =>
      ipcRenderer.invoke('action:drag', fromX, fromY, toX, toY),
    focusWindow: (title: string, delayAfter?: number) =>
      ipcRenderer.invoke('action:focusWindow', title, delayAfter),
    listWindows: () => ipcRenderer.invoke('action:listWindows')
  },
  // Python
  python: {
    match: (screenB64: string, templateB64: string, threshold?: number) =>
      ipcRenderer.invoke('python:match', screenB64, templateB64, threshold),
    ocr: (imageB64: string, region?: { x: number; y: number; w: number; h: number }) =>
      ipcRenderer.invoke('python:ocr', imageB64, region)
  },
  // App lifecycle
  app: {
    onBeforeClose: (cb: () => void) => {
      ipcRenderer.on('app:before-close', cb)
      return () => ipcRenderer.removeListener('app:before-close', cb)
    },
    confirmClose: () => ipcRenderer.send('app:confirm-close')
  },
  // Template
  template: {
    openDialog: () => ipcRenderer.invoke('template:openDialog'),
    list: () => ipcRenderer.invoke('template:list'),
    load: (name: string) => ipcRenderer.invoke('template:load', name),
    delete: (name: string) => ipcRenderer.invoke('template:delete', name),
    saveCapture: (imageBase64: string, suggestedName?: string) =>
      ipcRenderer.invoke('template:saveCapture', imageBase64, suggestedName)
  }
})
