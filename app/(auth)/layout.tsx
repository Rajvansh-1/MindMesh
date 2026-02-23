import type { Metadata } from 'next'
import Link from 'next/link'
import { Brain } from 'lucide-react'

export const metadata: Metadata = { title: 'Sign In' }

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen animated-bg flex flex-col">
      {/* Glowing orb */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/20 blur-[140px] rounded-full pointer-events-none" />

      <header className="relative z-10 p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors">
          <Brain className="w-6 h-6 text-indigo-400" />
          <span className="font-display font-bold">MindMesh</span>
        </Link>
      </header>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4">
        {children}
      </div>
    </div>
  )
}
