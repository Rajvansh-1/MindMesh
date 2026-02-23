import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SidebarNav } from '@/components/dashboard/SidebarNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  // Cast to our extended user type — role is always set via JWT callback
  const user = session.user as {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: string
  }

  return (
    <div className="min-h-screen animated-bg flex">
      {/* Ambient background glows */}
      <div className="fixed top-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[140px] rounded-full pointer-events-none z-0" />

      <SidebarNav user={user} />

      <main className="flex-1 ml-64 p-8 relative z-10 min-h-screen">
        {children}
      </main>
    </div>
  )
}
