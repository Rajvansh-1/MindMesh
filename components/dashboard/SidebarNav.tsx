'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Brain, LayoutDashboard, Users, Settings, LogOut, Shield } from 'lucide-react'
import { getInitials, cn } from '@/lib/utils'

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role: string
}

export function SidebarNav({ user }: { user: User }) {
  const pathname = usePathname()

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/rooms', label: 'My Rooms', icon: Users },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ...(user.role === 'ADMIN' ? [{ href: '/admin', label: 'Admin', icon: Shield }] : []),
  ]

  return (
    <aside className="fixed left-0 top-0 h-full w-64 glass border-r border-white/10 flex flex-col z-20">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Brain className="w-7 h-7 text-indigo-400" />
          <span className="font-display font-bold text-lg text-white">MindMesh</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
              pathname === href || (href !== '/dashboard' && pathname?.startsWith(href))
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/8'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {getInitials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name ?? 'User'}</p>
            <p className="text-xs text-white/40 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
