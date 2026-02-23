import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

export const metadata: Metadata = {
  title: { default: 'MindMesh | AI-Powered Idea Collaboration', template: '%s | MindMesh' },
  description: 'Build, analyze, and pitch your startup ideas with AI-powered insights and real-time collaboration.',
  keywords: ['startup', 'AI', 'idea', 'collaboration', 'pitch deck', 'SWOT analysis'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(15, 12, 41, 0.9)',
              color: '#f1f5f9',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              backdropFilter: 'blur(16px)',
              borderRadius: '0.75rem',
            },
          }}
        />
      </body>
    </html>
  )
}
