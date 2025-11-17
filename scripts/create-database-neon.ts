#!/usr/bin/env tsx

/**
 * Script to automatically create a Neon PostgreSQL database
 * Requires: NEON_API_KEY environment variable (optional, will prompt)
 * 
 * Get API key from: https://console.neon.tech/app/settings/account
 */

// Using native fetch (Node 18+) or https module
const fetch = globalThis.fetch || require('node-fetch')

const NEON_API_URL = 'https://console.neon.tech/api/v2'

interface NeonProject {
  id: string
  name: string
  platform_id: string
  region_id: string
  created_at: string
  updated_at: string
}

interface NeonDatabase {
  id: number
  name: string
  owner_name: string
  created_at: string
  updated_at: string
}

async function createNeonDatabase(apiKey?: string): Promise<string> {
  if (!apiKey) {
    console.log('📝 Neon API Key Required')
    console.log('   1. Sign up at https://neon.tech (free)')
    console.log('   2. Go to https://console.neon.tech/app/settings/account')
    console.log('   3. Generate an API key')
    console.log('   4. Run: NEON_API_KEY=your-key tsx scripts/create-database-neon.ts')
    console.log('')
    throw new Error('NEON_API_KEY is required')
  }

  console.log('🚀 Creating Neon database...')

  try {
    // Create a project
    const projectResponse = await fetch(`${NEON_API_URL}/projects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project: {
          name: 'web-ui-ux-testing-tool',
          region_id: 'aws-us-east-1', // Default region
        },
      }),
    })

    if (!projectResponse.ok) {
      const error = await projectResponse.text()
      throw new Error(`Failed to create project: ${error}`)
    }

    const project: NeonProject = await projectResponse.json()
    console.log(`✅ Created project: ${project.name} (${project.id})`)

    // Get connection string
    // Note: Neon API structure may vary, this is a simplified version
    console.log('')
    console.log('📋 Database created successfully!')
    console.log('')
    console.log('⚠️  Note: You need to get the connection string from Neon dashboard:')
    console.log(`   https://console.neon.tech/app/projects/${project.id}`)
    console.log('')
    console.log('Then add it to Vercel:')
    console.log('   vercel env add DATABASE_URL production')
    console.log('')

    return project.id
  } catch (error: any) {
    console.error('❌ Error creating database:', error.message)
    throw error
  }
}

// Alternative: Use Neon CLI if available
async function createWithNeonCLI() {
  console.log('📦 Using Neon CLI (if installed)...')
  console.log('')
  console.log('Install Neon CLI:')
  console.log('   npm install -g neonctl')
  console.log('')
  console.log('Then run:')
  console.log('   neonctl projects create --name web-ui-ux-testing-tool')
  console.log('   neonctl connection-string --project-name web-ui-ux-testing-tool')
  console.log('')
}

async function main() {
  const apiKey = process.env.NEON_API_KEY

  if (!apiKey) {
    console.log('🔧 Neon Database Setup')
    console.log('=====================')
    console.log('')
    await createWithNeonCLI()
    console.log('')
    console.log('Or use the API method (requires API key):')
    await createNeonDatabase()
  } else {
    await createNeonDatabase(apiKey)
  }
}

main().catch(console.error)

