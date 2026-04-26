import { describe, it, expect, beforeEach, vi } from 'vitest'
import { FlowExecutor } from './executor'
import type { Node, Edge } from 'reactflow'

function makeNode(id: string, type: string, data: Record<string, unknown> = {}): Node {
  return { id, type, position: { x: 0, y: 0 }, data }
}

function makeEdge(source: string, target: string, sourceHandle = 'default'): Edge {
  return { id: `${source}-${target}`, source, target, sourceHandle }
}

describe('IfNode — evaluateCondition', () => {
  let logs: string[]

  beforeEach(() => {
    logs = []
    vi.stubGlobal('window', { api: {} })
  })

  function run(nodes: Node[], edges: Edge[], ctx?: Map<string, unknown>) {
    const ex = new FlowExecutor(nodes, edges, ctx)
    ex.onLog = (m) => logs.push(m)
    return ex
  }

  it('exists: 변수가 있으면 true 분기', async () => {
    const nodes = [
      makeNode('s', 'Start'),
      makeNode('if', 'If', { varName: 'x', operator: 'exists' }),
      makeNode('t', 'Sequence'),
      makeNode('f', 'Sequence'),
    ]
    const edges = [
      makeEdge('s', 'if'),
      makeEdge('if', 't', 'true'),
      makeEdge('if', 'f', 'false'),
    ]
    const ctx = new Map<string, unknown>([['x', 42]])
    const ex = run(nodes, edges, ctx)
    await ex.run()
    expect(logs.some((l) => l.includes('참'))).toBe(true)
  })

  it('exists: 변수가 없으면 false 분기', async () => {
    const nodes = [
      makeNode('s', 'Start'),
      makeNode('if', 'If', { varName: 'missing', operator: 'exists' }),
      makeNode('t', 'Sequence'),
      makeNode('f', 'Sequence'),
    ]
    const edges = [
      makeEdge('s', 'if'),
      makeEdge('if', 't', 'true'),
      makeEdge('if', 'f', 'false'),
    ]
    const ex = run(nodes, edges)
    await ex.run()
    expect(logs.some((l) => l.includes('거짓'))).toBe(true)
  })

  it('== 숫자 비교 true', async () => {
    const nodes = [
      makeNode('s', 'Start'),
      makeNode('if', 'If', { varName: 'score', operator: '==', compareValue: '100' }),
      makeNode('t', 'Sequence'),
      makeNode('f', 'Sequence'),
    ]
    const edges = [makeEdge('s', 'if'), makeEdge('if', 't', 'true'), makeEdge('if', 'f', 'false')]
    const ex = run(nodes, edges, new Map([['score', 100]]))
    await ex.run()
    expect(logs.some((l) => l.includes('참'))).toBe(true)
  })

  it('> 숫자 비교 false', async () => {
    const nodes = [
      makeNode('s', 'Start'),
      makeNode('if', 'If', { varName: 'score', operator: '>', compareValue: '200' }),
      makeNode('t', 'Sequence'),
      makeNode('f', 'Sequence'),
    ]
    const edges = [makeEdge('s', 'if'), makeEdge('if', 't', 'true'), makeEdge('if', 'f', 'false')]
    const ex = run(nodes, edges, new Map([['score', 100]]))
    await ex.run()
    expect(logs.some((l) => l.includes('거짓'))).toBe(true)
  })

  it('contains 문자열 포함 true', async () => {
    const nodes = [
      makeNode('s', 'Start'),
      makeNode('if', 'If', { varName: 'text', operator: 'contains', compareValue: 'hello' }),
      makeNode('t', 'Sequence'),
      makeNode('f', 'Sequence'),
    ]
    const edges = [makeEdge('s', 'if'), makeEdge('if', 't', 'true'), makeEdge('if', 'f', 'false')]
    const ex = run(nodes, edges, new Map([['text', 'say hello world']]))
    await ex.run()
    expect(logs.some((l) => l.includes('참'))).toBe(true)
  })

  it('regex 정규식 매칭 false', async () => {
    const nodes = [
      makeNode('s', 'Start'),
      makeNode('if', 'If', { varName: 'text', operator: 'regex', compareValue: '^\\d+$' }),
      makeNode('t', 'Sequence'),
      makeNode('f', 'Sequence'),
    ]
    const edges = [makeEdge('s', 'if'), makeEdge('if', 't', 'true'), makeEdge('if', 'f', 'false')]
    const ex = run(nodes, edges, new Map([['text', 'abc123']]))
    await ex.run()
    expect(logs.some((l) => l.includes('거짓'))).toBe(true)
  })
})
