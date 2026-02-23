// NextAuth v5 type augmentation
// Extends the default Session and JWT types to include id and role

import type { DefaultSession, DefaultUser } from 'next-auth'
import type { JWT as DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    role: string
  }
}
