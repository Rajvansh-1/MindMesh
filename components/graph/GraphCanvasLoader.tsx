'use client'

// GraphCanvasLoader — Client Component wrapper around GraphCanvas
// This MUST be a client component because dynamic() with ssr:false
// is not allowed in Server Components (Next.js 15 App Router rule)

import dynamic from 'next/dynamic'
import { GraphSkeleton } from '@/components/graph/GraphSkeleton'

const GraphCanvas = dynamic(
  () => import('@/components/graph/GraphCanvas').then((m) => ({ default: m.GraphCanvas })),
  { ssr: false, loading: () => <GraphSkeleton /> },
)

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

interface Props {
  roomId: string
  initialNodes: DbNode[]
  initialEdges: DbEdge[]
  canEdit: boolean
}

export function GraphCanvasLoader(props: Props) {
  return <GraphCanvas {...props} />
}
