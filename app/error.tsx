'use client'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen animated-bg flex items-center justify-center">
      <div className="glass rounded-3xl p-10 text-center max-w-md">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="font-display font-bold text-2xl text-white mb-2">Something went wrong</h2>
        <p className="text-white/50 text-sm mb-6">{error.message}</p>
        <button onClick={reset} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all">
          Try again
        </button>
      </div>
    </div>
  )
}
