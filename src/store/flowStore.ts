import { create } from 'zustand'
import { type Node, type Edge, addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow'
import type { Connection, NodeChange, EdgeChange } from 'reactflow'
import type { ExecutionStatus } from '../engine/executor'

interface FlowStore {
  nodes: Node[]
  edges: Edge[]
  currentFlowName: string | null
  selectedNodeId: string | null
  isDirty: boolean

  // 실행 상태
  execStatus: ExecutionStatus
  execNodeId: string | null
  execLog: string[]

  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void

  setCurrentFlowName: (name: string | null) => void
  loadFlow: (name: string, nodes: Node[], edges: Edge[]) => void
  resetFlow: () => void
  markSaved: () => void

  selectNode: (id: string | null) => void
  updateNodeData: (id: string, data: Record<string, unknown>) => void

  setExecStatus: (status: ExecutionStatus) => void
  setExecNodeId: (id: string | null) => void
  appendLog: (msg: string) => void
  clearLog: () => void
}

export const useFlowStore = create<FlowStore>((set) => ({
  nodes: [],
  edges: [],
  currentFlowName: null,
  selectedNodeId: null,
  isDirty: false,
  execStatus: 'idle',
  execNodeId: null,
  execLog: [],

  setNodes: (nodes) => set({ nodes, isDirty: true }),
  setEdges: (edges) => set({ edges, isDirty: true }),

  onNodesChange: (changes) =>
    set((s) => ({
      nodes: applyNodeChanges(changes, s.nodes),
      isDirty: s.isDirty || changes.some((c) => c.type !== 'select'),
    })),

  onEdgesChange: (changes) =>
    set((s) => ({
      edges: applyEdgeChanges(changes, s.edges),
      isDirty: s.isDirty || changes.some((c) => c.type !== 'select'),
    })),

  onConnect: (connection) =>
    set((s) => ({ edges: addEdge(connection, s.edges), isDirty: true })),

  setCurrentFlowName: (name) => set({ currentFlowName: name }),

  loadFlow: (name, nodes, edges) =>
    set({ currentFlowName: name, nodes, edges, selectedNodeId: null, isDirty: false }),

  resetFlow: () => set({ nodes: [], edges: [], currentFlowName: null, selectedNodeId: null, isDirty: false }),

  markSaved: () => set({ isDirty: false }),

  selectNode: (id) => set({ selectedNodeId: id }),

  updateNodeData: (id, data) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
      isDirty: true,
    })),

  setExecStatus: (status) => set({ execStatus: status }),
  setExecNodeId: (id) => set({ execNodeId: id }),
  appendLog: (msg) => set((s) => ({ execLog: [...s.execLog.slice(-199), msg] })),
  clearLog: () => set({ execLog: [] })
}))
