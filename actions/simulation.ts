'use server'

// Simulation Server Action
// Calculates revenue projections based on pricing, country, and audience size

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const simulationSchema = z.object({
  roomId: z.string().cuid(),
  pricing: z.number().min(1).max(10000),
  country: z.string().min(1).max(60),
  audienceSize: z.number().min(100).max(10_000_000),
})

export interface SimulationResult {
  monthly: number[]   // 12-month revenue projection
  breakEvenMonth: number
  totalRevenue: number
  growthRate: number     // month-over-month %
  cac: number     // estimated customer acquisition cost
  ltv: number     // lifetime value estimate
}

// Country-based market penetration factors (simplified)
const COUNTRY_FACTORS: Record<string, number> = {
  'United States': 0.035,
  'United Kingdom': 0.028,
  'Germany': 0.025,
  'India': 0.012,
  'Brazil': 0.010,
  'Canada': 0.030,
  'Australia': 0.027,
  'France': 0.022,
  'Japan': 0.018,
}

function getCountryFactor(country: string): number {
  return COUNTRY_FACTORS[country] ?? 0.015
}

export async function runSimulation(input: z.infer<typeof simulationSchema>): Promise<SimulationResult> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const parsed = simulationSchema.safeParse(input)
  if (!parsed.success) throw new Error(parsed.error.errors[0].message)

  const { roomId, pricing, country, audienceSize } = parsed.data

  // Verify room access
  const member = await db.roomMember.findUnique({
    where: { roomId_userId: { roomId, userId: session.user.id } },
  })
  if (!member) throw new Error('Forbidden')

  // Simulation model:
  // Start with a small % of audience adopting, growing each month via compounding
  const penetrationFactor = getCountryFactor(country)
  const initialCustomers = Math.floor(audienceSize * penetrationFactor * 0.05)
  const monthlyGrowthRate = 0.12  // 12% MoM growth (early stage SaaS)

  const monthly: number[] = []
  let customers = initialCustomers

  for (let month = 0; month < 12; month++) {
    const revenue = Math.round(customers * pricing)
    monthly.push(revenue)
    customers = Math.floor(customers * (1 + monthlyGrowthRate))
  }

  const totalRevenue = monthly.reduce((s, r) => s + r, 0)
  const breakEvenMonth = monthly.findIndex((r) => r > pricing * 200) + 1 // rough threshold
  const cac = Math.round(pricing * 3.5)
  const ltv = Math.round(pricing * 24)

  // Save to DB (upsert — one simulation per room)
  await db.simulation.upsert({
    where: { id: (await db.simulation.findFirst({ where: { roomId } }))?.id ?? 'new' },
    create: {
      roomId,
      pricing,
      country,
      audienceSize,
      projections: JSON.stringify({ monthly, breakEvenMonth, totalRevenue }),
    },
    update: {
      pricing,
      country,
      audienceSize,
      projections: JSON.stringify({ monthly, breakEvenMonth, totalRevenue }),
    },
  })

  revalidatePath(`/room/${roomId}`)

  return {
    monthly,
    breakEvenMonth: breakEvenMonth > 0 ? breakEvenMonth : 12,
    totalRevenue,
    growthRate: monthlyGrowthRate * 100,
    cac,
    ltv,
  }
}
