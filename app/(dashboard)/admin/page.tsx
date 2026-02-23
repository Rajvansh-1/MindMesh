import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { BanUserButton } from '@/components/admin/BanUserButton'
import { Users, Brain, BarChart3, Shield } from 'lucide-react'

export const metadata = { title: 'Admin Dashboard' }

export default async function AdminPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/dashboard')

  const [users, rooms, activityLogs] = await Promise.all([
    db.user.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
    db.room.findMany({ orderBy: { updatedAt: 'desc' }, take: 20, include: { _count: { select: { members: true, nodes: true } } } }),
    db.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: 20, include: { user: { select: { name: true, email: true } } } }),
  ])

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'text-indigo-400' },
    { label: 'Total Rooms', value: rooms.length, icon: Brain, color: 'text-purple-400' },
    { label: 'Active Today', value: new Set(activityLogs.map((a) => a.userId)).size, icon: BarChart3, color: 'text-green-400' },
    { label: 'Banned Users', value: users.filter((u) => u.banned).length, icon: Shield, color: 'text-red-400' },
  ]

  return (
    <div className="max-w-7xl animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white flex items-center gap-3">
          <Shield className="w-8 h-8 text-indigo-400" />
          Admin Dashboard
        </h1>
        <p className="text-white/50 mt-1">Manage users, rooms, and platform activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card p-5">
            <Icon className={`w-6 h-6 ${color} mb-3`} />
            <div className="font-display font-black text-3xl text-white">{value}</div>
            <div className="text-white/50 text-sm mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Users Table */}
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" /> Users
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between glass p-3 rounded-xl">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                    {(user.name?.[0] ?? user.email?.[0] ?? '?').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user.name ?? 'Unnamed'}</p>
                    <p className="text-xs text-white/40 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${user.role === 'ADMIN' ? 'bg-indigo-600/30 text-indigo-300' : 'bg-white/10 text-white/40'}`}>
                    {user.role}
                  </span>
                  {user.banned && <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">Banned</span>}
                  {user.id !== session?.user?.id && (
                    <BanUserButton userId={user.id} isBanned={user.banned} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Log */}
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-green-400" /> Recent Activity
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {activityLogs.map((log) => (
              <div key={log.id} className="glass p-3 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-indigo-300 bg-indigo-600/20 px-2 py-0.5 rounded-lg">{log.action}</span>
                  <span className="text-xs text-white/30">{formatDate(log.createdAt)}</span>
                </div>
                {log.user && (
                  <p className="text-xs text-white/40 mt-1">{log.user.name ?? log.user.email}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
