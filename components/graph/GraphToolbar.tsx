'use client'

// GraphToolbar - Floating toolbar above the graph for adding nodes

import { useState } from 'react'
import { Plus, ChevronDown } from 'lucide-react'
import { NODE_ICONS, NODE_COLORS } from '@/lib/utils'

const NODE_TYPES = ['PROBLEM', 'SOLUTION', 'REVENUE', 'COMPETITOR', 'MARKET', 'TEAM', 'CUSTOM']

interface Props {
  onAddNode: (type: string, label: string) => void
}

export function GraphToolbar({ onAddNode }: Props) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState('PROBLEM')
  const [label, setLabel] = useState('')

  function handleAdd() {
    const l = label.trim() || `New ${selected.charAt(0) + selected.slice(1).toLowerCase()}`
    onAddNode(selected, l)
    setLabel('')
    setOpen(false)
  }

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
      {/* Node type selector */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="glass flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white font-medium border border-white/15 hover:bg-white/10 transition-all"
        >
          <span>{NODE_ICONS[selected]}</span>
          <span>{selected.charAt(0) + selected.slice(1).toLowerCase()}</span>
          <ChevronDown className="w-3.5 h-3.5 text-white/50" />
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-2 glass rounded-2xl p-2 min-w-[180px] shadow-2xl border border-white/15">
            {NODE_TYPES.map((t) => {
              const c = NODE_COLORS[t]
              return (
                <button
                  key={t}
                  onClick={() => { setSelected(t); setOpen(false) }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${selected === t ? `${c.bg} ${c.text}` : 'text-white/70 hover:bg-white/8'
                    }`}
                >
                  <span>{NODE_ICONS[t]}</span>
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Label input */}
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        placeholder="Node label…"
        className="glass px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 border border-white/15 outline-none focus:border-indigo-500/60 w-48 transition-all"
      />

      {/* Add button */}
      <button
        onClick={handleAdd}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all btn-glow"
      >
        <Plus className="w-4 h-4" />
        Add Node
      </button>
    </div>
  )
}
