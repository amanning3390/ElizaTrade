# ElizaTrade - Trading Platform Webapp

A Next.js 14 web application for automatic opportunity identification and trading using ElizaOS.

## Features

- **Multi-user Authentication**: Secure user accounts with NextAuth.js
- **Trading Agents**: Create and manage AI-powered trading agents
- **Real-time Market Data**: Live price updates and market indicators
- **Opportunity Scanning**: Automated detection of trading opportunities
- **Trade Execution**: Execute trades with risk management
- **Portfolio Tracking**: Monitor positions and performance
- **Agent Learning**: Agents learn from trade outcomes and improve over time

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Vercel Postgres with Drizzle ORM
- **Authentication**: NextAuth.js v5
- **AI Framework**: ElizaOS
- **UI**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 23.x
- Bun 1.2.x
- Vercel Postgres database (or local PostgreSQL)

### Installation

1. Install dependencies:
```bash
bun install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random secret for NextAuth
- `NEXTAUTH_URL` - Your app URL
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` - LLM provider key
- `CRON_SECRET` - Secret for cron job authentication

3. Run database migrations:
```bash
bunx drizzle-kit push
```

4. Start development server:
```bash
bun run dev
```

## Project Structure

```
packages/trading-webapp/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   └── api/               # API routes
├── src/
│   ├── components/        # React components
│   ├── lib/              # Utilities and integrations
│   │   ├── eliza/        # ElizaOS integration
│   │   ├── db/           # Database schema
│   │   └── auth/         # Authentication config
│   └── hooks/            # React hooks
└── plugins/
    └── trading-plugin/   # Custom trading plugin
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Create Vercel Postgres database
4. Deploy!

Vercel will automatically:
- Build the Next.js app
- Set up cron jobs
- Configure the database connection

## Usage

1. **Sign Up**: Create a new account
2. **Create Agent**: Set up your first trading agent
3. **Start Agent**: Activate the agent to begin trading
4. **Monitor**: View opportunities, trades, and portfolio
5. **Configure**: Adjust risk parameters and trading settings

## Trading Plugin

The custom trading plugin includes:

- **Market Data Providers**: Real-time prices, technical indicators, sentiment
- **Trading Actions**: Scan opportunities, execute trades, set alerts
- **Services**: Trading execution, opportunity detection, risk management
- **Evaluators**: Trade performance analysis, pattern recognition

## License

MIT

## Contributing

Contributions welcome! Please read our contributing guidelines first.
