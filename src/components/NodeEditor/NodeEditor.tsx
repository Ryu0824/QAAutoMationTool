import React, { useCallback } from 'react'
import ReactFlow, { Background, Controls, MiniMap, BackgroundVariant, ReactFlowProvider, useReactFlow, type Node } from 'reactflow'
import 'reactflow/dist/style.css'
import { useFlowStore } from '../../store/flowStore'
import { NODE_TYPES } from '../../nodes'

function NodeEditorInner(): React.ReactElement {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, selectNode, execNodeId } = useFlowStore()
  const reactFlowInstance = useReactFlow()

  const styledNodes = nodes.map((n) =>
    n.id === execNodeId
      ? { ...n, style: { ...n.style, outline: '2px solid #f0c040', borderRadius: 6 } }
      : n
  )

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    const type = event.dataTransfer.getData('application/nodebasictool')
    if (!type) return

    const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY })

    useFlowStore.getState().setNodes([
      ...useFlowStore.getState().nodes,
      { id: `${type}-${Date.now()}`, type, position, data: { label: type } }
    ])
  }, [reactFlowInstance])

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
  )
}

export default function NodeEditor(): React.ReactElement {
  return (
    <div style={{ flex: 1, height: '100%' }}>
      <ReactFlowProvider>
        <NodeEditorInner />
      </ReactFlowProvider>
    </div>
  )
}
