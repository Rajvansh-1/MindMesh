import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { userId, ban } = await req.json()
  await db.user.update({ where: { id: userId }, data: { banned: Boolean(ban) } })
  return NextResponse.json({ success: true })
}
