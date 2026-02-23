'use server'

// Room Server Actions
// All mutations for rooms go through here — uses Zod validation + auth checks

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const createRoomSchema = z.object({
  name: z.string().min(1, 'Name required').max(80),
  description: z.string().max(300).optional(),
  emoji: z.string().max(4).default('💡'),
})

const inviteSchema = z.object({
  roomId: z.string().cuid(),
  email: z.string().email(),
  role: z.enum(['EDITOR', 'VIEWER']).default('EDITOR'),
})

// ─── Create ───────────────────────────────────────────────────────────────

export async function createRoom(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const parsed = createRoomSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    emoji: formData.get('emoji') || '💡',
  })
  if (!parsed.success) throw new Error(parsed.error.errors[0].message)

  const room = await db.room.create({
    data: {
      ...parsed.data,
      ownerId: session.user.id,
      members: {
        create: { userId: session.user.id, role: 'OWNER' },
      },
    },
  })

  // Seed with a starter node so the graph isn't empty
  await db.node.create({
    data: {
      roomId: room.id,
      type: 'PROBLEM',
      label: 'Core Problem',
      content: 'Define the main problem you are solving',
      posX: 250,
      posY: 200,
    },
  })

  await db.activityLog.create({
    data: {
      userId: session.user.id,
      roomId: room.id,
      action: 'room.created',
      metadata: JSON.stringify({ name: room.name }),
    },
  })

  revalidatePath('/dashboard')
  return room
}

// ─── Update ───────────────────────────────────────────────────────────────

export async function updateRoom(roomId: string, data: { name?: string; description?: string; emoji?: string }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  await assertRoomOwner(roomId, session.user.id)

  const room = await db.room.update({
    where: { id: roomId },
    data,
  })

  revalidatePath(`/room/${roomId}`)
  return room
}

// ─── Delete ───────────────────────────────────────────────────────────────

export async function deleteRoom(roomId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  await assertRoomOwner(roomId, session.user.id)

  await db.room.delete({ where: { id: roomId } })

  revalidatePath('/dashboard')
  return { success: true }
}

// ─── Invite ───────────────────────────────────────────────────────────────

export async function inviteCollaborator(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const parsed = inviteSchema.safeParse({
    roomId: formData.get('roomId'),
    email: formData.get('email'),
    role: formData.get('role') || 'EDITOR',
  })
  if (!parsed.success) throw new Error(parsed.error.errors[0].message)

  const { roomId, email, role } = parsed.data

  await assertRoomEditor(roomId, session.user.id)

  const invitee = await db.user.findUnique({ where: { email } })
  if (!invitee) throw new Error('No user found with that email')

  const existing = await db.roomMember.findUnique({
    where: { roomId_userId: { roomId, userId: invitee.id } },
  })
  if (existing) throw new Error('User is already a member')

  await db.roomMember.create({
    data: { roomId, userId: invitee.id, role },
  })

  revalidatePath(`/room/${roomId}`)
  return { success: true }
}

// ─── Leave Room ───────────────────────────────────────────────────────────

export async function leaveRoom(roomId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const room = await db.room.findUnique({ where: { id: roomId } })
  if (!room) throw new Error('Room not found')
  if (room.ownerId === session.user.id) throw new Error('Owner cannot leave — transfer or delete the room')

  await db.roomMember.delete({
    where: { roomId_userId: { roomId, userId: session.user.id } },
  })

  revalidatePath('/dashboard')
}

// ─── Helpers ──────────────────────────────────────────────────────────────

async function assertRoomOwner(roomId: string, userId: string) {
  const room = await db.room.findUnique({ where: { id: roomId } })
  if (!room) throw new Error('Room not found')
  if (room.ownerId !== userId) throw new Error('Forbidden')
}

async function assertRoomEditor(roomId: string, userId: string) {
  const member = await db.roomMember.findUnique({
    where: { roomId_userId: { roomId, userId } },
  })
  if (!member || member.role === 'VIEWER') throw new Error('Forbidden')
}
