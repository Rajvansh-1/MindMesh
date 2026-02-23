'use client'

// GraphCanvas — React Flow v12 (@xyflow/react) graph editor
// Drag nodes, connect them, save to DB via server actions

import { useCallback, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  type Connection,
  type NodeTypes,
  type Node as FlowNode,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  addNode as addNodeAction,
  updateNodePosition,
  deleteNode,
  addEdge as addEdgeAction,
} from '@/actions/graph'
import { GraphToolbar } from '@/components/graph/GraphToolbar'
import { CustomNode } from '@/components/graph/CustomNode'
import { NODE_ICONS, NODE_COLORS } from '@/lib/utils'
import toast from 'react-hot-toast'

const nodeTypes: NodeTypes = { custom: CustomNode }

interface DbNode {
  id: string
  type: string
  label: string
  content?: string | null
  posX: number
  posY: number
}

interface DbEdge {
  id: string
  sourceId: string
  targetId: string
  animated: boolean
  label?: string | null
}

type AppNode = FlowNode<{
  label: string
  type: string
  content?: string | null
  icon: string
  colors: { bg: string; border: string; text: string }
}>

function toFlowNode(n: DbNode): AppNode {
  return {
    id: n.id,
    type: 'custom',
    position: { x: n.posX, y: n.posY },
    data: {
      label: n.label,
      type: n.type,
      content: n.content,
      icon: NODE_ICONS[n.type] ?? '🔷',
      colors: NODE_COLORS[n.type] ?? { bg: 'bg-gray-500/20', border: 'border-gray-500/40', text: 'text-gray-300' },
    },
  }
}

function toFlowEdge(e: DbEdge) {
  return {
    id: e.id,
    source: e.sourceId,
    target: e.targetId,
    animated: e.animated,
    label: e.label ?? undefined,
  }
}

interface Props {
  roomId: string
  initialNodes: DbNode[]
  initialEdges: DbEdge[]
  canEdit: boolean
}

export function GraphCanvas({ roomId, initialNodes, initialEdges, canEdit }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(initialNodes.map(toFlowNode))
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges.map(toFlowEdge))

  const onNodeDragStop = useCallback(
    async (_: React.MouseEvent, node: AppNode) => {
      if (!canEdit) return
      try {
        await updateNodePosition({ nodeId: node.id, posX: node.position.x, posY: node.position.y })
      } catch {
        // Non-critical — position will be lost on refresh but that's acceptable
      }
    },
    [canEdit],
  )

  const onConnect = useCallback(
    async (params: Connection) => {
      if (!canEdit) return toast.error('Viewers cannot edit')
      if (!params.source || !params.target) return
      try {
        const edge = await addEdgeAction({
          roomId,
          sourceId: params.source,
          targetId: params.target,
          animated: true,
        })
        setEdges((eds) => addEdge({ id: edge.id, ...params, animated: true }, eds))
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to connect nodes')
      }
    },
    [canEdit, roomId, setEdges],
  )

  const onAddNode = useCallback(
    async (type: string, label: string) => {
      if (!canEdit) return toast.error('Viewers cannot edit')
      try {
        const node = await addNodeAction({
          roomId,
          type: type as 'PROBLEM' | 'SOLUTION' | 'REVENUE' | 'COMPETITOR' | 'MARKET' | 'TEAM' | 'CUSTOM',
          label,
          posX: 150 + Math.random() * 400,
          posY: 80 + Math.random() * 300,
        })
        setNodes((ns) => [...ns, toFlowNode(node)])
        toast.success(`${NODE_ICONS[type] ?? '🔷'} Node added`)
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to add node')
      }
    },
    [canEdit, roomId, setNodes],
  )

  const onDeleteNode = useCallback(
    async (nodeId: string) => {
      if (!canEdit) return
      try {
        await deleteNode(nodeId)
        setNodes((ns) => ns.filter((n) => n.id !== nodeId))
        toast.success('Node deleted')
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to delete node')
      }
    },
    [canEdit, setNodes],
  )

  return (
    <div className="h-full w-full relative">
      {canEdit && <GraphToolbar onAddNode={onAddNode} />}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={canEdit ? onNodesChange : undefined}
        onEdgesChange={canEdit ? onEdgesChange : undefined}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={2}
      >
        <Background variant={BackgroundVariant.Dots} color="rgba(255,255,255,0.07)" gap={24} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(n) => {
            const map: Record<string, string> = {
              PROBLEM: '#ef4444', SOLUTION: '#22c55e', REVENUE: '#eab308',
              COMPETITOR: '#f97316', MARKET: '#3b82f6', TEAM: '#a855f7', CUSTOM: '#6b7280',
            }
            return map[String(n.data?.type)] ?? '#6366f1'
          }}
          maskColor="rgba(0,0,0,0.4)"
          style={{ borderRadius: '1rem' }}
        />
      </ReactFlow>

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-6xl mb-4">🧠</div>
            <p className="text-white/40 text-sm">
              {canEdit ? 'Use the toolbar above to add nodes to your idea graph' : 'No nodes yet'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
