import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.hoisted: vi.mock 팩토리보다 먼저 실행되도록 mock 객체 선언
const fsMock = vi.hoisted(() => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn().mockResolvedValue('{}'),
  readdir: vi.fn().mockResolvedValue([]),
  unlink: vi.fn().mockResolvedValue(undefined),
  rename: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('electron', () => ({
  app: { getPath: vi.fn(() => '/test/userData') },
  ipcMain: { handle: vi.fn() },
}))

vi.mock('fs', () => ({
  default: { promises: fsMock },
  promises: fsMock,
}))

import { ipcMain } from 'electron'
import { registerFlowHandlers } from './flowHandlers'

function getHandler(channel: string): (...args: unknown[]) => Promise<unknown> {
  const calls = (ipcMain.handle as ReturnType<typeof vi.fn>).mock.calls
  const call = calls.find(([ch]: [string]) => ch === channel)
  if (!call) throw new Error(`핸들러 미등록: ${channel}`)
  return call[1] as (...args: unknown[]) => Promise<unknown>
}

describe('flow:rename IPC 핸들러', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    registerFlowHandlers()
  })

  it('oldName → newName 으로 fs.rename 을 올바른 경로로 호출한다', async () => {
    const handler = getHandler('flow:rename')
    const result = await handler(null, 'old-flow', 'new-flow')

    expect(fsMock.rename).toHaveBeenCalledOnce()
    const [oldPath, newPath] = fsMock.rename.mock.calls[0]
    expect(oldPath).toContain('old-flow.flow.json')
    expect(newPath).toContain('new-flow.flow.json')
    expect(result).toEqual({ ok: true })
  })

  it('경로는 flowsDir 하위에 위치한다', async () => {
    const handler = getHandler('flow:rename')
    await handler(null, 'alpha', 'beta')

    const [oldPath, newPath] = fsMock.rename.mock.calls[0]
    expect(oldPath).toMatch(/flows[/\\]alpha\.flow\.json$/)
    expect(newPath).toMatch(/flows[/\\]beta\.flow\.json$/)
  })

  it('원본 파일이 없으면 fs.rename 에러를 그대로 전파한다', async () => {
    const enoent = Object.assign(new Error('ENOENT'), { code: 'ENOENT' })
    fsMock.rename.mockRejectedValueOnce(enoent)

    const handler = getHandler('flow:rename')
    await expect(handler(null, 'ghost', 'new-name')).rejects.toThrow('ENOENT')
  })

  it('대상 이름 충돌 시 fs.rename 에러를 전파한다', async () => {
    const eexist = Object.assign(new Error('EEXIST'), { code: 'EEXIST' })
    fsMock.rename.mockRejectedValueOnce(eexist)

    const handler = getHandler('flow:rename')
    await expect(handler(null, 'flow-a', 'flow-b')).rejects.toThrow('EEXIST')
  })
})
