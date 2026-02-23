'use server'

// Graph Server Actions
// Handles node and edge CRUD with auth checks and Zod validation

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const nodeSchema = z.object({
  roomId: z.string().cuid(),
  type: z.enum(['PROBLEM', 'SOLUTION', 'REVENUE', 'COMPETITOR', 'MARKET', 'TEAM', 'CUSTOM']),
  label: z.string().min(1).max(100),
  content: z.string().max(500).optional(),
  posX: z.number().default(200),
  posY: z.number().default(200),
})

const edgeSchema = z.object({
  roomId: z.string().cuid(),
  sourceId: z.string().cuid(),
  targetId: z.string().cuid(),
  label: z.string().max(80).optional(),
  animated: z.boolean().default(true),
})

const positionSchema = z.object({
  nodeId: z.string().cuid(),
  posX: z.number(),
  posY: z.number(),
})

// ─── Nodes ────────────────────────────────────────────────────────────────

export async function addNode(input: z.infer<typeof nodeSchema>) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const parsed = nodeSchema.safeParse(input)
  if (!parsed.success) throw new Error(parsed.error.errors[0].message)

  await assertRoomAccess(parsed.data.roomId, session.user.id)

  const node = await db.node.create({ data: parsed.data })

  revalidatePath(`/room/${parsed.data.roomId}`)
  return node
}

export async function updateNodePosition(input: z.infer<typeof positionSchema>) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const node = await db.node.findUnique({ where: { id: input.nodeId } })
  if (!node) throw new Error('Node not found')

  await assertRoomAccess(node.roomId, session.user.id)

  return await db.node.update({
    where: { id: input.nodeId },
    data: { posX: input.posX, posY: input.posY },
  })
}

export async function updateNodeLabel(nodeId: string, label: string, content?: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const node = await db.node.findUnique({ where: { id: nodeId } })
  if (!node) throw new Error('Node not found')

  await assertRoomAccess(node.roomId, session.user.id)

  const updated = await db.node.update({
    where: { id: nodeId },
    data: { label: label.slice(0, 100), content: content?.slice(0, 500) },
  })

  revalidatePath(`/room/${node.roomId}`)
  return updated
}

export async function deleteNode(nodeId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const node = await db.node.findUnique({ where: { id: nodeId } })
  if (!node) throw new Error('Node not found')

  await assertRoomAccess(node.roomId, session.user.id)

  // Cascade handles edge deletion via schema
  await db.node.delete({ where: { id: nodeId } })

  revalidatePath(`/room/${node.roomId}`)
  return { success: true }
}

// ─── Edges ────────────────────────────────────────────────────────────────

export async function addEdge(input: z.infer<typeof edgeSchema>) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const parsed = edgeSchema.safeParse(input)
  if (!parsed.success) throw new Error(parsed.error.errors[0].message)

  await assertRoomAccess(parsed.data.roomId, session.user.id)

  // Prevent self-loops
  if (parsed.data.sourceId === parsed.data.targetId) {
    throw new Error('Cannot connect a node to itself')
  }

  const edge = await db.edge.create({ data: parsed.data })

  revalidatePath(`/room/${parsed.data.roomId}`)
  return edge
}

export async function deleteEdge(edgeId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const edge = await db.edge.findUnique({ where: { id: edgeId } })
  if (!edge) throw new Error('Edge not found')

  await assertRoomAccess(edge.roomId, session.user.id)
  await db.edge.delete({ where: { id: edgeId } })

  revalidatePath(`/room/${edge.roomId}`)
  return { success: true }
}

// ─── Helper ───────────────────────────────────────────────────────────────

async function assertRoomAccess(roomId: string, userId: string) {
  const member = await db.roomMember.findUnique({
    where: { roomId_userId: { roomId, userId } },
  })
  if (!member) throw new Error('Forbidden — not a room member')
  if (member.role === 'VIEWER') throw new Error('Forbidden — viewers cannot edit')
}
