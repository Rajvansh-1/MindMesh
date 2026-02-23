'use client'

// CustomNode — Styled React Flow node card with type-specific colors, handles, and content

import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import { cn } from '@/lib/utils'

interface NodeData {
  label: string
  type: string
  content?: string | null
  icon: string
  colors: {
    bg: string
    border: string
    text: string
  }
  [key: string]: unknown  // Required by @xyflow/react NodeProps
}

export const CustomNode = memo(function CustomNode({ data, selected }: NodeProps) {
  const { label, content, icon, colors } = data as unknown as NodeData

  return (
    <div className={cn(
      'relative px-4 py-3 rounded-2xl border min-w-[140px] max-w-[210px] transition-all cursor-grab active:cursor-grabbing',
      (colors?.bg) ?? 'bg-gray-500/20',
      (colors?.border) ?? 'border-gray-500/40',
      selected ? 'ring-2 ring-white/40 shadow-xl shadow-white/10 scale-105' : 'hover:scale-102',
    )}>
      <Handle type="target" position={Position.Left}
        className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-white/40 !rounded-full" />

      <div className="flex items-start gap-2">
        <span className="text-xl flex-shrink-0 leading-tight">{String(icon)}</span>
        <div className="flex-1 min-w-0">
          <p className={cn('font-semibold text-sm leading-tight break-words', (colors?.text) ?? 'text-gray-300')}>
            {String(label)}
          </p>
          {content && (
            <p className="text-white/40 text-xs mt-1 line-clamp-2 leading-relaxed">
              {String(content)}
            </p>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Right}
        className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-white/40 !rounded-full" />
    </div>
  )
})
