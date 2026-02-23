'use client'

// RoomHeader — tab navigation bar for the room page
// MUST be wrapped in Suspense because useSearchParams is used

import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Cpu, BarChart3, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Room {
  id: string
  name: string
  emoji: string
  members: Array<{ user: { id: string; name: string | null; email: string | null } }>
}

interface Props {
  room: Room
  canEdit: boolean
  memberRole: string
}

const TABS = [
  { key: 'graph', label: 'Graph', icon: Cpu },
  { key: 'analysis', label: 'AI Analysis', icon: BarChart3 },
  { key: 'simulation', label: 'Simulation', icon: TrendingUp },
]

function RoomHeaderInner({ room, canEdit, memberRole }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') ?? 'graph'

  function switchTab(tab: string) {
    router.push(`/room/${room.id}?tab=${tab}`, { scroll: false })
  }

  return (
    <div className="glass border-b border-white/10 px-6 py-3 flex items-center gap-6 flex-shrink-0">
      <Link href="/dashboard" className="text-white/40 hover:text-white transition-colors flex-shrink-0">
        <ArrowLeft className="w-5 h-5" />
      </Link>

      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="text-2xl">{room.emoji}</span>
        <div className="min-w-0">
          <h1 className="font-display font-bold text-white truncate text-base leading-tight">{room.name}</h1>
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full',
            canEdit ? 'bg-indigo-600/20 text-indigo-300' : 'bg-white/10 text-white/40',
          )}>
            {memberRole}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => switchTab(key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
              activeTab === key
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                : 'text-white/50 hover:text-white hover:bg-white/10',
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center -space-x-2 flex-shrink-0">
        {room.members.slice(0, 4).map(({ user }) => (
          <div key={user.id} title={user.name ?? user.email ?? ''}
            className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white border-2 border-black/40">
            {(user.name?.[0] ?? user.email?.[0] ?? '?').toUpperCase()}
          </div>
        ))}
        {room.members.length > 4 && (
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/60 border-2 border-black/40">
            +{room.members.length - 4}
          </div>
        )}
      </div>
    </div>
  )
}

// Export wrapped in Suspense — required whenever useSearchParams is used in a client component
import { Suspense } from 'react'

export function RoomHeader(props: Props) {
  return (
    <Suspense fallback={
      <div className="glass border-b border-white/10 px-6 py-3 flex items-center gap-4 flex-shrink-0 h-14">
        <div className="skeleton w-24 h-4 rounded-full" />
        <div className="skeleton w-48 h-4 rounded-full" />
      </div>
    }>
      <RoomHeaderInner {...props} />
    </Suspense>
  )
}
