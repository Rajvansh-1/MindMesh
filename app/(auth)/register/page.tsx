'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, User, Mail, Lock } from 'lucide-react'
import { registerUser } from '@/actions/auth'
import { signIn } from 'next-auth/react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    try {
      await registerUser(formData)
      // Auto-login after registration
      const result = await signIn('credentials', {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        redirect: false,
      })
      if (result?.error) throw new Error(result.error)
      toast.success('Account created! Welcome to MindMesh 🚀')
      router.push('/dashboard')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="glass rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-2xl text-white">Create your account</h1>
          <p className="text-white/50 text-sm mt-1">Start building your ideas for free</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/70 text-sm mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                name="name"
                type="text"
                required
                placeholder="Jane Smith"
                className="w-full bg-white/5 border border-white/10 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/30 text-sm outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/30 text-sm outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="Min. 6 characters"
                className="w-full bg-white/5 border border-white/10 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/30 text-sm outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 text-white rounded-xl py-3 font-semibold text-sm transition-all btn-glow flex items-center justify-center gap-2 mt-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Creating account…' : 'Create Free Account'}
          </button>
        </form>

        <p className="text-center text-white/40 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
