# Deployment Guide

## Vercel Deployment

### Prerequisites

1. Vercel account
2. Vercel Postgres database
3. Environment variables configured

### Steps

1. **Connect Repository**
   - Import your repository to Vercel
   - Select the `packages/trading-webapp` directory as the root

2. **Set Environment Variables**
   - `DATABASE_URL` - Vercel Postgres connection string
   - `NEXTAUTH_SECRET` - Random secret for NextAuth
   - `NEXTAUTH_URL` - Your deployment URL
   - `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` - LLM provider key
   - `CRON_SECRET` - Secret for cron job authentication
   - Exchange API keys (optional for demo mode)

3. **Database Setup**
   - Create Vercel Postgres database
   - Run migrations: `bun run migrate` (or use Drizzle Kit)
   - The schema will be created automatically on first run

4. **Deploy**
   - Vercel will automatically detect Next.js and deploy
   - Cron jobs are configured in `vercel.json`

### Cron Jobs

The following cron jobs are configured:
- Market Scan: Every 5 minutes (`*/5 * * * *`)
- Portfolio Rebalance: Weekly on Sunday (`0 0 * * 0`)
- Alert Check: Every minute (`*/1 * * * *`)

### Post-Deployment

1. Create your first user account
2. Create and start a trading agent
3. Configure agent settings
4. Begin trading!

