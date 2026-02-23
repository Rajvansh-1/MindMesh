import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { GraphSkeleton } from '@/components/graph/GraphSkeleton'
import { RoomHeader } from '@/components/graph/RoomHeader'
import { AnalysisPanel } from '@/components/analytics/AnalysisPanel'
import { SimulationPanel } from '@/components/analytics/SimulationPanel'

// Lazy-load heavy graph component
const GraphCanvas = dynamic(() => import('@/components/graph/GraphCanvas').then(m => ({ default: m.GraphCanvas })), {
  ssr: false,
  loading: () => <GraphSkeleton />,
})

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function RoomPage({ params, searchParams }: Props) {
  const [{ id }, { tab = 'graph' }, session] = await Promise.all([
    params,
    searchParams,
    auth(),
  ])

  if (!session?.user?.id) redirect('/login')

  // Verify access
  const membership = await db.roomMember.findUnique({
    where: { roomId_userId: { roomId: id, userId: session.user.id } },
  })
  if (!membership) notFound()

  // Fetch room data
  const [room, nodes, edges, latestReport] = await Promise.all([
    db.room.findUnique({
      where: { id },
      include: { members: { include: { user: { select: { id: true, name: true, email: true } } } } },
    }),
    db.node.findMany({ where: { roomId: id }, orderBy: { createdAt: 'asc' } }),
    db.edge.findMany({ where: { roomId: id } }),
    db.analysisReport.findFirst({ where: { roomId: id }, orderBy: { createdAt: 'desc' } }),
  ])

  if (!room) notFound()

  const canEdit = membership.role !== 'VIEWER'

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col -m-8">
      <RoomHeader room={room} canEdit={canEdit} memberRole={membership.role} />

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {tab === 'graph' && (
          <Suspense fallback={<GraphSkeleton />}>
            <GraphCanvas
              roomId={id}
              initialNodes={nodes}
              initialEdges={edges}
              canEdit={canEdit}
            />
          </Suspense>
        )}
        {tab === 'analysis' && (
          <div className="h-full overflow-y-auto p-6">
            <AnalysisPanel roomId={id} latestReport={latestReport} />
          </div>
        )}
        {tab === 'simulation' && (
          <div className="h-full overflow-y-auto p-6">
            <SimulationPanel roomId={id} roomName={room.name} />
          </div>
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const room = await db.room.findUnique({ where: { id }, select: { name: true, emoji: true } })
  if (!room) return { title: 'Room Not Found' }
  return { title: `${room.emoji} ${room.name}` }
}
