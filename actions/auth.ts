'use server'

// User registration action
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function registerUser(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message)
  }

  const { name, email, password } = parsed.data

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) throw new Error('An account with this email already exists')

  const hashed = await bcrypt.hash(password, 12)

  await db.user.create({
    data: { name, email, password: hashed },
  })

  return { success: true }
}
