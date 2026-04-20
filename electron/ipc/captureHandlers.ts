import { ipcMain } from 'electron'
import { exec } from 'child_process'
import { promisify } from 'util'
import { join } from 'path'
import { tmpdir } from 'os'
import { readFile, unlink } from 'fs/promises'
import Jimp from 'jimp'

const execAsync = promisify(exec)

async function captureToFile(): Promise<string> {
  const tmpPath = join(tmpdir(), `nbt_${Date.now()}.png`)
  const escaped = tmpPath.replace(/\\/g, '\\\\')
  const ps = [
    'Add-Type -AssemblyName System.Windows.Forms,System.Drawing',
    '$b=[System.Windows.Forms.Screen]::PrimaryScreen.Bounds',
    '$bmp=New-Object System.Drawing.Bitmap($b.Width,$b.Height)',
    '$g=[System.Drawing.Graphics]::FromImage($bmp)',
    '$g.CopyFromScreen($b.Location,[System.Drawing.Point]::Empty,$b.Size)',
    `$bmp.Save('${escaped}',[System.Drawing.Imaging.ImageFormat]::Png)`
  ].join(';')

  await execAsync(`powershell -Command "${ps}"`)
  return tmpPath
}

export function registerCaptureHandlers(): void {
  ipcMain.handle('capture:screen', async () => {
    const tmpPath = await captureToFile()
    const buf = await readFile(tmpPath)
    await unlink(tmpPath)
    return buf.toString('base64')
  })

  ipcMain.handle('capture:region', async (_e, x: number, y: number, w: number, h: number) => {
    const tmpPath = await captureToFile()
    const buf = await readFile(tmpPath)
    await unlink(tmpPath)
    const jimg = await Jimp.read(buf)
    jimg.crop({ x, y, w, h })
    return (await jimg.getBuffer('image/png')).toString('base64')
  })
}
