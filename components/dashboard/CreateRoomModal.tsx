'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createRoom } from '@/actions/room'
import { Plus, Loader2, X } from 'lucide-react'
import toast from 'react-hot-toast'

const EMOJIS = ['💡', '🚀', '🧠', '🔥', '⚡', '🌟', '💎', '🎯', '🌊', '🦄']

export function CreateRoomModal({ asCard }: { asCard?: boolean }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emoji, setEmoji] = useState('💡')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.set('emoji', emoji)

    try {
      const room = await createRoom(formData)
      toast.success('Room created!')
      setOpen(false)
      router.push(`/room/${room.id}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  const trigger = asCard ? (
    <button onClick={() => setOpen(true)}
      className="glass-card p-6 flex flex-col items-center justify-center gap-3 text-white/40 hover:text-indigo-300 border-2 border-dashed border-white/10 hover:border-indigo-500/40 min-h-[160px]">
      <Plus className="w-8 h-8" />
      <span className="text-sm font-medium">New Idea Room</span>
    </button>
  ) : (
    <button onClick={() => setOpen(true)}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all btn-glow">
      <Plus className="w-4 h-4" />
      New Room
    </button>
  )

  return (
    <>
      {trigger}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative glass rounded-3xl p-8 w-full max-w-md shadow-2xl animate-slide-up">
            <button onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all">
              <X className="w-4 h-4" />
            </button>

            <h2 className="font-display font-bold text-xl text-white mb-6">Create Idea Room</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Emoji picker */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Pick an emoji</label>
                <div className="flex gap-2 flex-wrap">
                  {EMOJIS.map((e) => (
                    <button key={e} type="button" onClick={() => setEmoji(e)}
                      className={`text-2xl p-2 rounded-xl transition-all ${emoji === e ? 'bg-indigo-600/40 ring-2 ring-indigo-500' : 'hover:bg-white/10'}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Room Name *</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. AI Tutoring Startup"
                  className="w-full bg-white/5 border border-white/10 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-3 px-4 text-white placeholder-white/30 text-sm outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Brief description of your idea..."
                  className="w-full bg-white/5 border border-white/10 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-3 px-4 text-white placeholder-white/30 text-sm outline-none transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 text-white rounded-xl py-3 font-semibold text-sm transition-all btn-glow flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Creating…' : 'Create Room'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
