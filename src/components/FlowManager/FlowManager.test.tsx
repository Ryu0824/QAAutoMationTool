import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FlowManager from './FlowManager'

// useFlowStore mock
const mockStore = {
  nodes: [],
  edges: [],
  currentFlowName: null as string | null,
  isDirty: false,
  loadFlow: vi.fn(),
  resetFlow: vi.fn(),
  setCurrentFlowName: vi.fn(),
  markSaved: vi.fn(),
}

vi.mock('../../store/flowStore', () => ({
  useFlowStore: () => mockStore,
}))

// window.api mock
const mockApi = {
  flow: {
    list: vi.fn().mockResolvedValue(['flow-a', 'flow-b']),
    save: vi.fn().mockResolvedValue({ ok: true }),
    load: vi.fn().mockResolvedValue({ nodes: [], edges: [] }),
    delete: vi.fn().mockResolvedValue({ ok: true }),
    rename: vi.fn().mockResolvedValue({ ok: true }),
    setPath: vi.fn().mockResolvedValue({ ok: true, path: '' }),
  },
  capture: { screen: vi.fn(), region: vi.fn() },
  action: { click: vi.fn(), keyInput: vi.fn(), drag: vi.fn() },
  python: { match: vi.fn(), ocr: vi.fn() },
  template: { openDialog: vi.fn(), list: vi.fn(), load: vi.fn(), delete: vi.fn() },
  app: { onBeforeClose: vi.fn(() => vi.fn()), confirmClose: vi.fn() },
}

Object.defineProperty(window, 'api', { value: mockApi, writable: true })

function renderFlowManager() {
  return render(<FlowManager />)
}

describe('FlowManager — 이름 변경 버튼 노출', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStore.currentFlowName = null
    mockStore.isDirty = false
    mockApi.flow.list.mockResolvedValue(['flow-a', 'flow-b'])
    mockApi.flow.rename.mockResolvedValue({ ok: true })
  })

  it('currentFlowName 이 없으면 이름 변경 버튼이 렌더링되지 않는다', () => {
    mockStore.currentFlowName = null
    renderFlowManager()
    expect(screen.queryByRole('button', { name: '이름 변경' })).toBeNull()
  })

  it('currentFlowName 이 있으면 이름 변경 버튼이 렌더링된다', async () => {
    mockStore.currentFlowName = 'flow-a'
    renderFlowManager()
    expect(await screen.findByRole('button', { name: '이름 변경' })).toBeInTheDocument()
  })
})

describe('FlowManager — 이름 변경 인라인 입력 모드', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStore.currentFlowName = 'flow-a'
    mockStore.isDirty = false
    mockApi.flow.list.mockResolvedValue(['flow-a', 'flow-b'])
    mockApi.flow.rename.mockResolvedValue({ ok: true })
  })

  it('이름 변경 버튼 클릭 시 input 이 표시되고 currentFlowName 으로 초기화된다', async () => {
    const user = userEvent.setup()
    renderFlowManager()
    await user.click(await screen.findByRole('button', { name: '이름 변경' }))
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input).toBeInTheDocument()
    expect(input.value).toBe('flow-a')
  })

  it('새 이름 입력 후 Enter 키로 rename API 를 호출한다', async () => {
    const user = userEvent.setup()
    renderFlowManager()
    await user.click(await screen.findByRole('button', { name: '이름 변경' }))
    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, 'flow-renamed')
    await user.keyboard('{Enter}')
    expect(mockApi.flow.rename).toHaveBeenCalledWith('flow-a', 'flow-renamed')
  })

  it('확인 버튼 클릭으로도 rename API 를 호출한다', async () => {
    const user = userEvent.setup()
    renderFlowManager()
    await user.click(await screen.findByRole('button', { name: '이름 변경' }))
    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, 'flow-renamed')
    await user.click(screen.getByRole('button', { name: '확인' }))
    expect(mockApi.flow.rename).toHaveBeenCalledWith('flow-a', 'flow-renamed')
  })

  it('rename 성공 후 store.setCurrentFlowName 이 새 이름으로 호출된다', async () => {
    const user = userEvent.setup()
    renderFlowManager()
    await user.click(await screen.findByRole('button', { name: '이름 변경' }))
    await user.clear(screen.getByRole('textbox'))
    await user.type(screen.getByRole('textbox'), 'flow-new')
    await user.keyboard('{Enter}')
    await waitFor(() =>
      expect(mockStore.setCurrentFlowName).toHaveBeenCalledWith('flow-new')
    )
  })

  it('rename 성공 후 입력 모드가 닫히고 기본 UI 로 복귀한다', async () => {
    const user = userEvent.setup()
    renderFlowManager()
    await user.click(await screen.findByRole('button', { name: '이름 변경' }))
    await user.clear(screen.getByRole('textbox'))
    await user.type(screen.getByRole('textbox'), 'flow-new')
    await user.keyboard('{Enter}')
    await waitFor(() =>
      expect(screen.queryByRole('textbox')).toBeNull()
    )
  })
})

describe('FlowManager — 이름 변경 취소', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStore.currentFlowName = 'flow-a'
    mockApi.flow.list.mockResolvedValue(['flow-a', 'flow-b'])
  })

  it('Escape 키를 누르면 API 호출 없이 입력 모드가 닫힌다', async () => {
    const user = userEvent.setup()
    renderFlowManager()
    await user.click(await screen.findByRole('button', { name: '이름 변경' }))
    await user.keyboard('{Escape}')
    expect(mockApi.flow.rename).not.toHaveBeenCalled()
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('취소 버튼 클릭 시 API 호출 없이 입력 모드가 닫힌다', async () => {
    const user = userEvent.setup()
    renderFlowManager()
    await user.click(await screen.findByRole('button', { name: '이름 변경' }))
    await user.click(screen.getByRole('button', { name: '취소' }))
    expect(mockApi.flow.rename).not.toHaveBeenCalled()
    expect(screen.queryByRole('textbox')).toBeNull()
  })
})

describe('FlowManager — 이름 변경 엣지 케이스', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStore.currentFlowName = 'flow-a'
    mockApi.flow.list.mockResolvedValue(['flow-a', 'flow-b'])
    mockApi.flow.rename.mockResolvedValue({ ok: true })
  })

  it('같은 이름으로 변경 시도 시 API 를 호출하지 않고 닫힌다', async () => {
    const user = userEvent.setup()
    renderFlowManager()
    await user.click(await screen.findByRole('button', { name: '이름 변경' }))
    // input 에 이미 'flow-a' 가 들어있으므로 그냥 Enter
    await user.keyboard('{Enter}')
    expect(mockApi.flow.rename).not.toHaveBeenCalled()
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('공백만 입력 시 API 를 호출하지 않는다', async () => {
    const user = userEvent.setup()
    renderFlowManager()
    await user.click(await screen.findByRole('button', { name: '이름 변경' }))
    await user.clear(screen.getByRole('textbox'))
    await user.type(screen.getByRole('textbox'), '   ')
    await user.keyboard('{Enter}')
    expect(mockApi.flow.rename).not.toHaveBeenCalled()
  })

  it('rename 후 목록에서 oldName 이 newName 으로 교체된다', async () => {
    const user = userEvent.setup()
    renderFlowManager()
    // 초기 목록에 'flow-a' 가 있는지 확인
    expect(await screen.findByRole('option', { name: 'flow-a' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '이름 변경' }))
    await user.clear(screen.getByRole('textbox'))
    await user.type(screen.getByRole('textbox'), 'flow-renamed')
    await user.keyboard('{Enter}')
    await waitFor(() => {
      expect(screen.queryByRole('option', { name: 'flow-a' })).toBeNull()
      expect(screen.getByRole('option', { name: 'flow-renamed' })).toBeInTheDocument()
    })
  })
})
