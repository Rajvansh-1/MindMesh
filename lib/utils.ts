// Shared utility functions used across the application

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Merge Tailwind classes cleanly
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format a date to a readable string
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

// Truncate a string to a max length
export function truncate(str: string, max: number): string {
  if (str.length <= max) return str
  return str.slice(0, max - 3) + '...'
}

// Generate initials from a name
export function getInitials(name?: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Get a color for a node type
export const NODE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  PROBLEM: { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-300' },
  SOLUTION: { bg: 'bg-green-500/20', border: 'border-green-500/50', text: 'text-green-300' },
  REVENUE: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-300' },
  COMPETITOR: { bg: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-300' },
  MARKET: { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-300' },
  TEAM: { bg: 'bg-purple-500/20', border: 'border-purple-500/50', text: 'text-purple-300' },
  CUSTOM: { bg: 'bg-gray-500/20', border: 'border-gray-500/50', text: 'text-gray-300' },
}

export const NODE_ICONS: Record<string, string> = {
  PROBLEM: '⚡',
  SOLUTION: '✅',
  REVENUE: '💰',
  COMPETITOR: '🥊',
  MARKET: '📊',
  TEAM: '👥',
  CUSTOM: '🔷',
}
