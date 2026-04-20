import type { Node, Edge } from 'reactflow'

export type ExecutionStatus = 'idle' | 'running' | 'paused' | 'done' | 'error'

export interface ExecutionState {
  status: ExecutionStatus
  currentNodeId: string | null
  log: string[]
  error: string | null
}

type NodeData = Record<string, unknown>

// sourceNodeId -> { handleId -> targetNodeId }
type AdjMap = Map<string, Map<string, string>>

function buildAdjMap(edges: Edge[]): AdjMap {
  const map: AdjMap = new Map()
  for (const edge of edges) {
    if (!map.has(edge.source)) map.set(edge.source, new Map())
    const handleKey = edge.sourceHandle ?? 'default'
    map.get(edge.source)!.set(handleKey, edge.target)
  }
  return map
}

function getNextNodeId(nodeId: string, handleId: string, adjMap: AdjMap): string | null {
  const handles = adjMap.get(nodeId)
  if (!handles) return null
  return handles.get(handleId) ?? handles.get('default') ?? null
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export interface MatchResult { x: number; y: number; confidence: number }

export class FlowExecutor {
  private nodes: Node[]
  private edges: Edge[]
  private adjMap: AdjMap
  private stopped = false
  private context: Map<string, unknown> = new Map()

  onNodeStart?: (nodeId: string) => void
  onLog?: (msg: string) => void
  onError?: (msg: string) => void

  constructor(nodes: Node[], edges: Edge[], context?: Map<string, unknown>) {
    this.nodes = nodes
    this.edges = edges
    this.adjMap = buildAdjMap(edges)
    if (context) this.context = context
  }

  getVar<T>(name: string): T | undefined {
    return this.context.get(name) as T | undefined
  }

  setVar(name: string, value: unknown) {
    this.context.set(name, value)
  }

  stop() {
    this.stopped = true
  }

  private node(id: string): Node | undefined {
    return this.nodes.find((n) => n.id === id)
  }

  private log(msg: string) {
    this.onLog?.(msg)
  }

  async run(): Promise<void> {
    const startNode = this.nodes.find((n) => n.type === 'Start')
    if (!startNode) throw new Error('Start 노드가 없습니다. Start 노드를 배치해 주세요.')

    await this.executeNode(startNode.id, {})
  }

  private async executeNode(nodeId: string, loopCtx: Record<string, number>): Promise<string | null> {
    if (this.stopped) return null

    const node = this.node(nodeId)
    if (!node) return null

    this.onNodeStart?.(nodeId)
    const data = (node.data ?? {}) as NodeData
    this.log(`[${node.type}] ${(data.label as string) || node.type}`)

    let nextHandle = 'default'

    switch (node.type) {
      case 'Start':
        break

      case 'Click': {
        const clickType = (data.clickType as 'single' | 'double' | 'right') ?? 'single'
        const typeLabel = { single: '클릭', double: '더블클릭', right: '우클릭' }[clickType]

        let x: number
        let y: number

        if (data.useVar && data.varName) {
          const pos = this.getVar<MatchResult>(data.varName as string)
          if (!pos) {
            this.log(`  → 변수 "${data.varName}" 없음, 건너뜀`)
            break
          }
          x = pos.x
          y = pos.y
          this.log(`  → $${data.varName} (${x}, ${y}) ${typeLabel}`)
        } else {
          x = (data.x as number) ?? 0
          y = (data.y as number) ?? 0
          this.log(`  → (${x}, ${y}) ${typeLabel}`)
        }

        await window.api.action.click(x, y, clickType)
        break
      }

      case 'FocusWindow': {
        const title = data.windowTitle as string
        if (!title) { this.log('  → 창 제목 미설정, 건너뜀'); break }
        const delayAfter = (data.delayAfter as number) ?? 300
        await window.api.action.focusWindow(title, delayAfter)
        this.log(`  → "${title}" 포커스 (${delayAfter}ms 대기)`)
        break
      }

      case 'KeyInput': {
        const keys = (data.keys as string[]) ?? []
        if (keys.length) {
          await window.api.action.keyInput(keys)
          this.log(`  → 키 입력: ${keys.join(' + ')}`)
        }
        break
      }

      case 'Drag': {
        let fromX: number, fromY: number, toX: number, toY: number

        if (data.useFromVar && data.fromVar) {
          const pos = this.getVar<MatchResult>(data.fromVar as string)
          if (!pos) { this.log(`  → 변수 "${data.fromVar}" 없음, 건너뜀`); break }
          fromX = pos.x; fromY = pos.y
        } else {
          fromX = (data.fromX as number) ?? 0
          fromY = (data.fromY as number) ?? 0
        }

        if (data.useToVar && data.toVar) {
          const pos = this.getVar<MatchResult>(data.toVar as string)
          if (!pos) { this.log(`  → 변수 "${data.toVar}" 없음, 건너뜀`); break }
          toX = pos.x; toY = pos.y
        } else {
          toX = (data.toX as number) ?? 0
          toY = (data.toY as number) ?? 0
        }

        await window.api.action.drag(fromX, fromY, toX, toY)
        this.log(`  → (${fromX},${fromY}) → (${toX},${toY}) 드래그`)
        break
      }

      case 'Delay': {
        const ms = (data.ms as number) ?? 1000
        this.log(`  → ${ms}ms 대기`)
        await delay(ms)
        break
      }

      case 'ImageMatch': {
        const templateName = data.template as string
        if (!templateName) {
          this.log('  → 템플릿 미설정, 건너뜀')
          nextHandle = 'notFound'
          break
        }
        const templateB64 = await window.api.template.load(templateName)
        const region = this.buildRegion(data)
        const screenB64 = region
          ? await window.api.capture.region(region.x, region.y, region.w, region.h)
          : await window.api.capture.screen()
        const threshold = (data.threshold as number) ?? 0.8
        const result = await window.api.python.match(screenB64, templateB64, threshold)
        if (result.found) {
          this.log(`  → 이미지 발견 (${result.confidence.toFixed(2)}) at (${result.x}, ${result.y})`)
          if (data.varName) {
            this.setVar(data.varName as string, { x: result.x, y: result.y, confidence: result.confidence })
            this.log(`  → $${data.varName} 에 저장`)
          }
          nextHandle = 'found'
        } else {
          this.log(`  → 이미지 미발견 (최고 유사도: ${result.confidence?.toFixed(2) ?? '-'})`)
          nextHandle = 'notFound'
        }
        break
      }

      case 'OCRRead': {
        const region = this.buildRegion(data)
        const imageB64 = region
          ? await window.api.capture.region(region.x, region.y, region.w, region.h)
          : await window.api.capture.screen()
        const result = await window.api.python.ocr(imageB64)
        const text: string = result.text ?? ''
        const expect = (data.expect as string) ?? ''
        const mode = (data.matchMode as string) ?? 'contains'
        const matched = this.compareText(text, expect, mode)
        this.log(`  → OCR 결과: "${text.slice(0, 40)}" → ${matched ? '일치' : '불일치'}`)
        if (data.varName) {
          this.setVar(data.varName as string, text)
          this.log(`  → $${data.varName} 에 저장`)
        }
        nextHandle = matched ? 'match' : 'noMatch'
        break
      }

      case 'Loop': {
        const mode = (data.mode as string) ?? 'count'
        const count = (data.count as number) ?? 1
        const maxCount = (data.maxCount as number) ?? 100
        const bodyNextId = getNextNodeId(nodeId, 'body', this.adjMap)

        if (mode === 'count') {
          for (let i = 0; i < count && !this.stopped; i++) {
            this.log(`  → 루프 ${i + 1}/${count}`)
            if (bodyNextId) await this.runSequence(bodyNextId, loopCtx)
          }
        } else {
          for (let i = 0; i < maxCount && !this.stopped; i++) {
            this.log(`  → 루프 ${i + 1}/${maxCount} (조건 대기)`)
            if (bodyNextId) {
              const result = await this.runSequence(bodyNextId, loopCtx)
              if (result === '__break__') break
            }
          }
        }
        nextHandle = 'done'
        break
      }

      case 'Sequence':
        break

      case 'SubFlow': {
        const flowName = data.flowName as string
        if (flowName) {
          this.log(`  → 서브플로우: ${flowName}`)
          const flowData = await window.api.flow.load(flowName)
          const sub = new FlowExecutor(flowData.nodes as Node[], flowData.edges as Edge[], this.context)
          sub.onLog = this.onLog
          sub.onNodeStart = this.onNodeStart
          await sub.run()
        }
        break
      }
    }

    const nextId = getNextNodeId(nodeId, nextHandle, this.adjMap)
    if (nextId) return this.executeNode(nextId, loopCtx)
    return null
  }

  private async runSequence(startId: string, loopCtx: Record<string, number>): Promise<string | null> {
    return this.executeNode(startId, loopCtx)
  }

  private buildRegion(data: NodeData): { x: number; y: number; w: number; h: number } | null {
    const x = data.regionX as number
    const y = data.regionY as number
    const w = data.regionW as number
    const h = data.regionH as number
    if (!x && !y && !w && !h) return null
    return { x: x ?? 0, y: y ?? 0, w: w ?? 100, h: h ?? 100 }
  }

  private compareText(text: string, expect: string, mode: string): boolean {
    if (!expect) return true
    switch (mode) {
      case 'exact': return text.trim() === expect.trim()
      case 'regex': return new RegExp(expect).test(text)
      default: return text.includes(expect)
    }
  }
}
