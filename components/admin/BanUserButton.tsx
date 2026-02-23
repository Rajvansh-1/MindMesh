'use client'

// BanUserButton — calls an API route (NOT a direct DB import)
// Client components CANNOT import Prisma — must go through an API route

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, ShieldOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  userId: string
  isBanned: boolean
}

export function BanUserButton({ userId, isBanned }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handle() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ban: !isBanned }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? 'Request failed')
      }
      toast.success(isBanned ? 'User unbanned' : 'User banned')
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      title={isBanned ? 'Unban user' : 'Ban user'}
      className={`p-1.5 rounded-lg transition-all disabled:opacity-50 ${isBanned
          ? 'text-green-400 hover:bg-green-500/10'
          : 'text-red-400 hover:bg-red-500/10'
        }`}
    >
      {loading
        ? <Loader2 className="w-4 h-4 animate-spin" />
        : isBanned
          ? <ShieldOff className="w-4 h-4" />
          : <Shield className="w-4 h-4" />
      }
    </button>
  )
}
