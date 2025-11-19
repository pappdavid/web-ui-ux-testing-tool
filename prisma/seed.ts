import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create a sample user
  const passwordHash = await bcrypt.hash('password123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      passwordHash,
    },
  })

  console.log('Created user:', user.email)

  // Create a sample test
  const test = await prisma.test.upsert({
    where: { id: 'sample-test-1' },
    update: {},
    create: {
      id: 'sample-test-1',
      userId: user.id,
      name: 'Sample E-commerce Test',
      targetUrl: 'https://example.com',
      adminPanelUrl: 'https://admin.example.com',
      deviceProfile: 'desktop',
      status: 'pending',
      adminConfig: JSON.stringify({
        mode: 'api',
        baseUrl: 'https://api.example.com',
        credentials: {
          // TODO: Encrypt this properly with KMS/vault
          apiKey: 'sample-api-key',
        },
      }), // JSON stored as string in SQLite
    },
  })

  console.log('Created test:', test.name)

  // Create sample test steps
  const steps = [
    {
      testId: test.id,
      orderIndex: 0,
      type: 'waitForSelector',
      selector: 'body',
      value: null,
      assertionType: null,
      assertionExpected: null,
      meta: JSON.stringify({ timeout: 5000 }), // JSON stored as string in SQLite
    },
    {
      testId: test.id,
      orderIndex: 1,
      type: 'click',
      selector: 'button[data-testid="add-to-cart"]',
      value: null,
      assertionType: null,
      assertionExpected: null,
      meta: undefined,
    },
    {
      testId: test.id,
      orderIndex: 2,
      type: 'input',
      selector: 'input[name="email"]',
      value: 'test@example.com',
      assertionType: null,
      assertionExpected: null,
      meta: undefined,
    },
    {
      testId: test.id,
      orderIndex: 3,
      type: 'screenshot',
      selector: null,
      value: null,
      assertionType: null,
      assertionExpected: null,
      meta: JSON.stringify({ name: 'checkout-page' }), // JSON stored as string in SQLite
    },
    {
      testId: test.id,
      orderIndex: 4,
      type: 'assert',
      selector: 'h1',
      value: null,
      assertionType: 'contains',
      assertionExpected: 'Checkout',
      meta: undefined,
    },
  ]

  for (const step of steps) {
    await prisma.testStep.create({
      data: step,
    })
  }

  console.log(`Created ${steps.length} test steps`)

  console.log('Seeding completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

