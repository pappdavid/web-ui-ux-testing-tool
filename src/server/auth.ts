import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from './db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        try {
          // Check if DATABASE_URL is configured
          if (!process.env.DATABASE_URL) {
            throw new Error('Database not configured')
          }

          const user = await db.user.findUnique({
            where: { email: credentials.email },
          })

          if (!user) {
            return null // Invalid credentials
          }

          const isValid = await bcrypt.compare(credentials.password, user.passwordHash)

          if (!isValid) {
            return null // Invalid credentials
          }

          return {
            id: user.id,
            email: user.email,
          }
        } catch (error: any) {
          console.error('Authentication error:', error)
          throw new Error('Authentication service error. Please try again later.')
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
      }
      return session
    },
  },
}

