# Web-Based UI/UX Testing Tool

A comprehensive web-based testing tool for UI/UX validation with admin panel verification. Built with Next.js, Playwright, PostgreSQL, and TypeScript.

## Features

- **Test Builder UI**: Create and manage test cases through a web interface
- **Cloud Agentic Browser** 🤖: AI-driven test exploration using OpenAI + Playwright on RunPod ([docs](docs/AGENTIC_BROWSER_RUNPOD.md))
- **Playwright Automation**: Execute tests using headless browser automation
- **UX Metrics**: Collect navigation timing, LCP, and accessibility metrics
- **Admin Verification**: Verify test results via API or UI in admin panels
- **Visual Regression**: Compare screenshots with baselines (optional)
- **Test Reports**: Comprehensive reports with screenshots, logs, and metrics
- **Multi-User Support**: User authentication and test isolation

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Browser Automation**: Playwright
- **Authentication**: NextAuth.js
- **Validation**: Zod

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- Playwright browsers (installed via `npm run test:install`)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required environment variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/testing_tool"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
PLAYWRIGHT_BROWSERS_PATH="./.playwright"
STORAGE_PATH="./storage"
```

Generate a secure `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 3. Set Up Database

#### Option A: Using Docker (Recommended)

```bash
docker-compose up -d
```

This will start a PostgreSQL container on port 5432.

#### Option B: Local PostgreSQL

Create a database:

```sql
CREATE DATABASE testing_tool;
```

### 4. Run Database Migrations

```bash
npm run db:generate
npm run db:push
```

Or use migrations:

```bash
npm run db:migrate
```

### 5. Seed Database (Optional)

```bash
npm run db:seed
```

This creates a sample user (`test@example.com` / `password123`) and a sample test.

### 6. Install Playwright Browsers

```bash
npm run test:install
```

### 7. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Usage

### Creating a Test

1. Register/Login at `/register` or `/login`
2. Navigate to Dashboard
3. Click "New Test"
4. Fill in test details:
   - Test name
   - Target URL
   - Admin panel URL (optional)
   - Device profile (desktop/mobile/tablet)
   - Admin verification config (optional)
5. Add test steps using the step builder
6. Save the test

### Running a Test

1. Go to the test edit page
2. Click "Run Test" or navigate to `/tests/[id]/run`
3. Click "Start Test Run"
4. Monitor the execution in real-time
5. View results, screenshots, and logs

### Viewing Reports

1. Navigate to `/test-runs/[id]/report` for a detailed report
2. Reports include:
   - Test summary
   - UX metrics
   - Step execution timeline
   - Screenshots
   - Admin verification results
   - Execution logs

### Admin Verification

#### API Verification

Call the API verification endpoint:

```bash
POST /api/test-runs/[runId]/verify-admin-api
{
  "baseUrl": "https://api.example.com",
  "authMethod": "bearer",
  "credentials": {
    "token": "your-api-token"
  },
  "endpoint": "/api/users/123",
  "method": "GET",
  "expectedData": {
    "email": "user@example.com",
    "status": "active"
  }
}
```

#### UI Verification

Call the UI verification endpoint:

```bash
POST /api/test-runs/[runId]/verify-admin-ui
{
  "adminPanelUrl": "https://admin.example.com",
  "loginSelector": {
    "emailSelector": "input[name='email']",
    "passwordSelector": "input[name='password']",
    "submitSelector": "button[type='submit']"
  },
  "credentials": {
    "email": "admin@example.com",
    "password": "admin-password"
  },
  "navigationPath": "/users/123",
  "extractionSelectors": {
    "email": ".user-email",
    "status": ".user-status"
  },
  "expectedData": {
    "email": "user@example.com",
    "status": "active"
  }
}
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run test:install` - Install Playwright browsers
- `npm run test:ui` - Run Playwright tests
- `npm run run-test` - Run a test via CLI script

## CI/CD Integration

Use the CI script to run tests headlessly:

```bash
# Run by test ID (creates a new test run)
tsx scripts/ci-run-test.ts <testId>

# Run by test run ID
tsx scripts/ci-run-test.ts <testRunId> --run-id
```

Example GitHub Actions workflow:

```yaml
name: Run Tests

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run db:generate
      - run: npm run test:install
      - run: tsx scripts/ci-run-test.ts ${{ secrets.TEST_ID }}
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/             # API routes
│   │   ├── dashboard/       # Dashboard page
│   │   ├── tests/           # Test management pages
│   │   └── test-runs/       # Test run pages
│   ├── components/          # React components
│   ├── lib/                 # Shared utilities
│   ├── server/              # Server-side code
│   │   ├── adminVerification/  # Admin verification services
│   │   └── services/        # Business logic services
│   └── tests/               # Test engine
│       ├── engine/          # Playwright test execution
│       └── models/          # Test model types
├── prisma/                  # Prisma schema and migrations
├── scripts/                 # Utility scripts
└── storage/                 # File storage (screenshots, etc.)
```

## Database Schema

- **User**: User accounts
- **Test**: Test definitions
- **TestStep**: Individual test steps
- **TestRun**: Test execution instances
- **TestLog**: Execution logs
- **AdminCheck**: Admin verification results
- **Attachment**: Screenshots, videos, DOM snapshots

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (via NextAuth)

### Tests
- `GET /api/tests` - List user's tests
- `POST /api/tests` - Create new test
- `GET /api/tests/[id]` - Get test details
- `PUT /api/tests/[id]` - Update test
- `POST /api/tests/[id]/steps` - Update test steps
- `POST /api/tests/[id]/run` - Start test run
- `POST /api/tests/generate` - Generate test steps (AI)

### Test Runs
- `GET /api/test-runs/[runId]` - Get test run details
- `GET /api/test-runs/[runId]/logs` - Get test logs
- `GET /api/test-runs/[runId]/report` - Get test report
- `POST /api/test-runs/[runId]/verify-admin-api` - API verification
- `POST /api/test-runs/[runId]/verify-admin-ui` - UI verification

## Security Notes

⚠️ **Important Security Considerations:**

1. **Admin Credentials**: Currently stored with basic encryption. TODO: Integrate with KMS/vault for production.
2. **Authentication**: Uses NextAuth.js with JWT. Consider additional security measures for production.
3. **API Keys**: Store sensitive credentials in environment variables, never in code.
4. **Database**: Use strong passwords and restrict access in production.
5. **File Storage**: Local filesystem for dev. TODO: Use S3/Vercel Blob for production.

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Ensure database exists: `CREATE DATABASE testing_tool;`

### Playwright Issues

- Run `npm run test:install` to install browsers
- Check `PLAYWRIGHT_BROWSERS_PATH` in `.env`

### Test Execution Fails

- Check logs in the test run view
- Verify target URL is accessible
- Check selectors are correct
- Review browser console for errors

## Cloud Agentic Browser (RunPod)

The application includes an advanced AI-driven test exploration feature that uses OpenAI and Playwright to automatically explore web applications and generate test steps.

### Architecture

- **Railway**: Hosts the Next.js app and manages agent sessions
- **RunPod**: Runs containerized agent workers with Playwright + OpenAI
- **Worker polls** Railway for pending sessions, explores apps, posts traces back

### Quick Start

1. **On Railway**: Set `RAILWAY_INTERNAL_API_TOKEN` environment variable
   ```bash
   openssl rand -hex 32
   ```

2. **Deploy RunPod Worker**:
   ```bash
   cd src/agentWorker
   docker build -t agent-worker .
   docker push your-username/agent-worker:latest
   ```

3. **Configure RunPod** with environment variables:
   - `RAILWAY_API_BASE_URL`
   - `RAILWAY_INTERNAL_API_TOKEN`
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` (optional, defaults to gpt-4o-mini)

4. **Use in UI**:
   - Go to test edit page
   - Find "Cloud Agentic Recorder" section
   - Enter scenario description
   - Click "Start Cloud Agent Exploration"
   - Wait for completion
   - Click "Compile to Steps"

### Documentation

Full documentation: **[docs/AGENTIC_BROWSER_RUNPOD.md](docs/AGENTIC_BROWSER_RUNPOD.md)**

Includes:
- Complete lifecycle explanation
- API reference
- Deployment guides
- Troubleshooting
- Example scenarios

## Development

### Adding New Step Types

1. Add step type to `TestStepType` in `src/tests/models/TestStep.ts`
2. Add handler in `src/tests/engine/stepHandlers.ts`
3. Update validation schema in `src/lib/validations.ts`
4. Update step builder UI in `src/components/StepBuilder.tsx`

### Extending Metrics

1. Add metric collection in `src/tests/engine/metricsCollector.ts`
2. Update `UXMetrics` interface
3. Update report components to display new metrics

## TODO / Future Enhancements

- [ ] Visual regression with pixel-perfect comparison
- [ ] AI test generation with actual LLM integration
- [ ] Video recording for test runs
- [ ] Real device testing integration
- [ ] S3/Vercel Blob storage integration
- [ ] KMS/vault integration for credentials
- [ ] Advanced scheduling and queuing
- [ ] Team collaboration features
- [ ] Export reports as PDF
- [ ] Webhook notifications

## License

MIT

## Contributing

Contributions welcome! Please open an issue or submit a pull request.

