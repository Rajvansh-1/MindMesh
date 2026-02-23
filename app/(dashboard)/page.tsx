import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import Link from 'next/link'
import { Plus, Brain, Zap, TrendingUp, Users } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { CreateRoomModal } from '@/components/dashboard/CreateRoomModal'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  // Fetch user's rooms (owned + member)
  const memberships = await db.roomMember.findMany({
    where: { userId: session.user.id },
    include: { room: { include: { _count: { select: { nodes: true, members: true } } } } },
    orderBy: { room: { updatedAt: 'desc' } },
    take: 20,
  })

  const rooms = memberships.map((m) => m.room)

  // Quick stats
  const totalNodes = rooms.reduce((s, r) => s + r._count.nodes, 0)
  const totalReports = await db.analysisReport.count({ where: { roomId: { in: rooms.map((r) => r.id) } } })

  const stats = [
    { label: 'Idea Rooms', value: rooms.length, icon: Brain, color: 'text-indigo-400' },
    { label: 'Graph Nodes', value: totalNodes, icon: Zap, color: 'text-yellow-400' },
    { label: 'AI Analyses', value: totalReports, icon: TrendingUp, color: 'text-green-400' },
    {
      label: 'Collaborators', value: memberships.reduce((s, m) => s + m.room._count.members, 0),
      icon: Users, color: 'text-purple-400'
    },
  ]

  return (
    <div className="max-w-6xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">
            Welcome back, {session.user.name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="text-white/50 mt-1">Here&apos;s what&apos;s happening with your ideas</p>
        </div>
        <CreateRoomModal />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card p-5">
            <Icon className={`w-6 h-6 ${color} mb-3`} />
            <div className="font-display font-black text-3xl text-white">{value}</div>
            <div className="text-white/50 text-sm mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Rooms */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-xl text-white">Your Idea Rooms</h2>
      </div>

      {rooms.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="text-6xl mb-4">💡</div>
          <h3 className="font-display font-bold text-xl text-white mb-2">No rooms yet</h3>
          <p className="text-white/50 mb-6">Create your first idea room and start building</p>
          <CreateRoomModal />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <Link key={room.id} href={`/room/${room.id}`}
              className="glass-card p-6 block group">
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{room.emoji}</span>
                <span className="text-xs text-white/30 bg-white/5 px-2 py-1 rounded-lg">
                  {room._count.nodes} nodes
                </span>
              </div>
              <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors mb-1 truncate">
                {room.name}
              </h3>
              {room.description && (
                <p className="text-white/40 text-sm line-clamp-2 mb-4">{room.description}</p>
              )}
              <div className="flex items-center justify-between text-xs text-white/30">
                <span>{room._count.members} member{room._count.members !== 1 ? 's' : ''}</span>
                <span>{formatDate(room.updatedAt)}</span>
              </div>
            </Link>
          ))}

          {/* Create new room card */}
          <CreateRoomModal asCard />
        </div>
      )}
    </div>
  )
}
