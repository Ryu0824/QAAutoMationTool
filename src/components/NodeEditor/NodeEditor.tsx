import React, { useCallback } from 'react'
import ReactFlow, { Background, Controls, MiniMap, BackgroundVariant, type Node } from 'reactflow'
import 'reactflow/dist/style.css'
import { useFlowStore } from '../../store/flowStore'
import { NODE_TYPES } from '../../nodes'

export default function NodeEditor(): React.ReactElement {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, selectNode, execNodeId } = useFlowStore()

  const styledNodes = nodes.map((n) =>
    n.id === execNodeId
      ? { ...n, style: { ...n.style, outline: '2px solid #f0c040', borderRadius: 6 } }
      : n
  )

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    const type = event.dataTransfer.getData('application/nodebasictool')
    if (!type) return

    const bounds = (event.target as HTMLElement).getBoundingClientRect?.() ?? { left: 0, top: 0 }
    const position = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }

    useFlowStore.getState().setNodes([
      ...useFlowStore.getState().nodes,
      { id: `${type}-${Date.now()}`, type, position, data: { label: type } }
    ])
  }, [])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    selectNode(node.id)
  }, [selectNode])

  const onPaneClick = useCallback(() => {
    selectNode(null)
  }, [selectNode])

  return (
    <div style={{ flex: 1, height: '100%' }}>
      <ReactFlow
        nodes={styledNodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={16} color="#0f3460" />
        <Controls />
        <MiniMap nodeColor="#e94560" maskColor="rgba(22,33,62,0.8)" />
      </ReactFlow>
    </div>
  )
}
