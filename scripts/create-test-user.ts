#!/usr/bin/env tsx

/**
 * Script to create a test user for login testing
 * Usage: tsx scripts/create-test-user.ts [email] [password]
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2] || 'test@example.com'
  const password = process.argv[3] || 'password123'

  console.log(`Creating test user: ${email}`)

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
    },
    create: {
      email,
      passwordHash,
    },
  })

  console.log(`✅ Test user created successfully!`)
  console.log(`   Email: ${user.email}`)
  console.log(`   Password: ${password}`)
  console.log(`   User ID: ${user.id}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Error creating test user:', e)
    await prisma.$disconnect()
    process.exit(1)
  })

