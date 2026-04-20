import { ipcMain, app } from 'electron'
import { spawn } from 'child_process'
import { join } from 'path'

const pythonScriptDir = app.isPackaged
  ? join(process.resourcesPath, 'python')
  : join(__dirname, '../../python')

function callPython(script: string, payload: unknown): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const proc = spawn('python', [join(pythonScriptDir, script)])
    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (d: Buffer) => { stdout += d.toString() })
    proc.stderr.on('data', (d: Buffer) => { stderr += d.toString() })

    proc.on('close', (code) => {
      if (code !== 0) return reject(new Error(`Python error: ${stderr}`))
      try {
        resolve(JSON.parse(stdout))
      } catch {
        reject(new Error(`Invalid JSON from Python: ${stdout}`))
      }
    })

    proc.stdin.write(JSON.stringify(payload))
    proc.stdin.end()
  })
}

export function registerPythonHandlers(): void {
  ipcMain.handle('python:match', async (_e, screenB64: string, templateB64: string, threshold = 0.8) => {
    return callPython('template_match.py', { action: 'template_match', screen: screenB64, template: templateB64, threshold })
  })
}
