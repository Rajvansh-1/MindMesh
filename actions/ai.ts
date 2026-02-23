'use server'

// AI Server Actions
// Runs AI analysis and generates pitch decks, saving results to the DB

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { streamAIAnalysis, buildAnalysisPrompt, type AnalysisResult } from '@/lib/ai'
import { revalidatePath } from 'next/cache'

// ─── Analyze Idea ─────────────────────────────────────────────────────────

export async function analyzeIdea(roomId: string): Promise<AnalysisResult> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  // Verify access
  const membership = await db.roomMember.findUnique({
    where: { roomId_userId: { roomId, userId: session.user.id } },
  })
  if (!membership) throw new Error('Forbidden')

  // Gather nodes to build the analysis prompt
  const nodes = await db.node.findMany({ where: { roomId } })
  if (nodes.length === 0) {
    throw new Error('Add some nodes to your graph before analyzing')
  }

  const prompt = buildAnalysisPrompt(nodes)

  // Stream the response and collect it fully
  const stream = await streamAIAnalysis(prompt)
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }

  const text = new TextDecoder().decode(
    chunks.reduce((acc, chunk) => {
      const combined = new Uint8Array(acc.length + chunk.length)
      combined.set(acc)
      combined.set(chunk, acc.length)
      return combined
    }, new Uint8Array(0))
  )

  const result: AnalysisResult = JSON.parse(text)

  // Persist analysis report to DB
  await db.analysisReport.create({
    data: {
      roomId,
      strengths: JSON.stringify(result.strengths),
      weaknesses: JSON.stringify(result.weaknesses),
      opportunities: JSON.stringify(result.opportunities),
      threats: JSON.stringify(result.threats),
      riskScore: result.riskScore,
      marketViability: result.marketViability,
      revenueEstimate: result.revenueEstimate,
      competitorSummary: result.competitorSummary,
      prompt,
    },
  })

  await db.activityLog.create({
    data: {
      userId: session.user.id,
      roomId,
      action: 'analysis.run',
    },
  })

  revalidatePath(`/room/${roomId}`)
  return result
}

// ─── Generate Pitch Deck ──────────────────────────────────────────────────

export interface PitchSlide {
  slide: number
  title: string
  content: string
  bullets?: string[]
  icon: string
}

export async function generatePitchDeck(roomId: string): Promise<PitchSlide[]> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const [room, nodes, report] = await Promise.all([
    db.room.findUnique({ where: { id: roomId } }),
    db.node.findMany({ where: { roomId } }),
    db.analysisReport.findFirst({ where: { roomId }, orderBy: { createdAt: 'desc' } }),
  ])

  if (!room) throw new Error('Room not found')

  const nodesByType = nodes.reduce((acc, n) => {
    acc[n.type] = acc[n.type] || []
    acc[n.type].push(n.label)
    return acc
  }, {} as Record<string, string[]>)

  const strengths = report ? (JSON.parse(report.strengths) as string[]) : []
  const opportunities = report ? (JSON.parse(report.opportunities) as string[]) : []

  const deck: PitchSlide[] = [
    {
      slide: 1, icon: '🚀', title: room.name,
      content: room.description ?? 'An AI-powered idea collaboration platform',
    },
    {
      slide: 2, icon: '⚡', title: 'The Problem',
      content: 'We identified a critical gap in the market',
      bullets: nodesByType['PROBLEM'] ?? ['Problem not yet defined'],
    },
    {
      slide: 3, icon: '✅', title: 'Our Solution',
      content: 'We solve this with a targeted, scalable approach',
      bullets: nodesByType['SOLUTION'] ?? ['Solution not yet defined'],
    },
    {
      slide: 4, icon: '📊', title: 'Market Opportunity',
      content: report?.marketViability === 'HIGH'
        ? 'This is a high-viability market with strong growth potential'
        : 'A focused niche with room to expand',
      bullets: opportunities.slice(0, 3),
    },
    {
      slide: 5, icon: '💰', title: 'Business Model',
      content: 'Revenue streams and monetization strategy',
      bullets: nodesByType['REVENUE'] ?? ['Revenue model to be defined'],
    },
    {
      slide: 6, icon: '🥊', title: 'Competitive Landscape',
      content: report?.competitorSummary ?? 'Competitive analysis pending',
      bullets: nodesByType['COMPETITOR'] ?? [],
    },
    {
      slide: 7, icon: '📈', title: 'Traction & Validation',
      content: 'Early indicators of product-market fit',
      bullets: strengths.slice(0, 3),
    },
    {
      slide: 8, icon: '👥', title: 'The Team',
      content: 'Experienced founders building for scale',
      bullets: nodesByType['TEAM'] ?? ['Add team members to your graph'],
    },
    {
      slide: 9, icon: '🗓', title: 'Go-to-Market Strategy',
      content: 'Phased rollout starting with early adopters and expanding through partnerships',
      bullets: ['Phase 1: Product-led growth', 'Phase 2: Channel partnerships', 'Phase 3: Enterprise sales'],
    },
    {
      slide: 10, icon: '💎', title: 'The Ask',
      content: report?.revenueEstimate
        ? `Targeting ${report.revenueEstimate}`
        : 'Seeking seed funding to accelerate growth',
      bullets: ['Product development', 'Team hiring', 'Marketing & sales'],
    },
  ]

  return deck
}
