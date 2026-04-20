import { create } from 'zustand'
import { type Node, type Edge, addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow'
import type { Connection, NodeChange, EdgeChange } from 'reactflow'
import type { ExecutionStatus } from '../engine/executor'

interface FlowStore {
  nodes: Node[]
  edges: Edge[]
  currentFlowName: string | null
  selectedNodeId: string | null

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
  execStatus: 'idle',
  execNodeId: null,
  execLog: [],

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) =>
    set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) })),

  onEdgesChange: (changes) =>
    set((s) => ({ edges: applyEdgeChanges(changes, s.edges) })),

  onConnect: (connection) =>
    set((s) => ({ edges: addEdge(connection, s.edges) })),

  setCurrentFlowName: (name) => set({ currentFlowName: name }),

  loadFlow: (name, nodes, edges) =>
    set({ currentFlowName: name, nodes, edges, selectedNodeId: null }),

  resetFlow: () => set({ nodes: [], edges: [], currentFlowName: null, selectedNodeId: null }),

  selectNode: (id) => set({ selectedNodeId: id }),

  updateNodeData: (id, data) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      )
    })),

  setExecStatus: (status) => set({ execStatus: status }),
  setExecNodeId: (id) => set({ execNodeId: id }),
  appendLog: (msg) => set((s) => ({ execLog: [...s.execLog.slice(-199), msg] })),
  clearLog: () => set({ execLog: [] })
}))
