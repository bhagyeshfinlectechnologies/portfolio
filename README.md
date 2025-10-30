# Dhan Portfolio Dashboard

A beautiful, real-time portfolio dashboard for Dhan broker users. Track your holdings, positions, orders, and funds with live updates and comprehensive analytics.

## Features

- **Real-time Portfolio Tracking**: Monitor your investments with live price updates
- **Holdings Management**: View detailed holdings with P&L calculations
- **Position Monitoring**: Track your intraday and overnight positions
- **Order History**: Complete order book with execution details
- **Funds & Margins**: Monitor your account balance and available funds
- **Beautiful Charts**: Visual representation of your portfolio distribution
- **Secure Authentication**: Password-based login with encrypted API key storage
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14 with React and TypeScript
- **Styling**: Tailwind CSS with custom components
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **Charts**: Recharts
- **API Integration**: Dhan API v2

## Prerequisites

- Node.js 18+ installed
- Dhan demat account
- Dhan API credentials (Client ID and Access Token)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

The `.env` file is already configured. Update the `NEXTAUTH_SECRET` for production:

```bash
openssl rand -base64 32
```

### 3. Initialize the database

```bash
npx prisma generate
npx prisma db push
```

This will create the SQLite database and generate the Prisma client.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

### Getting Dhan API Credentials

1. Login to your [Dhan account](https://dhan.co)
2. Navigate to Settings → API Management
3. Click on "Create New API" or "Generate Token"
4. Copy your **Client ID** and **Access Token**
5. In the dashboard, go to Settings and paste your credentials

### First Time Setup

1. Click on "Sign up" to create a new account
2. Enter your email, password, and name
3. Login with your credentials
4. Go to Settings and configure your Dhan API credentials
5. Your portfolio data will now be fetched automatically

## Project Structure

```
portfolio/
├── app/                      # Next.js app directory
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── dhan/           # Dhan API integration
│   │   └── user/           # User management
│   ├── dashboard/          # Dashboard pages
│   │   ├── holdings/       # Holdings view
│   │   ├── positions/      # Positions view
│   │   ├── orders/         # Order history
│   │   ├── funds/          # Funds & margins
│   │   └── settings/       # Settings page
│   ├── login/              # Login page
│   └── register/           # Registration page
├── components/              # React components
│   ├── ui/                 # UI components (Button, Card, etc.)
│   └── dashboard-nav.tsx   # Dashboard navigation
├── lib/                     # Utility functions and configs
│   ├── auth.ts             # NextAuth configuration
│   ├── dhan-api.ts         # Dhan API client
│   ├── prisma.ts           # Prisma client
│   └── utils.ts            # Helper functions
└── prisma/                  # Database schema
    └── schema.prisma       # Prisma schema definition
```

## Deployment

Want to deploy this dashboard online? See the complete [Deployment Guide](DEPLOYMENT.md) for step-by-step instructions for:

- **Vercel** (Recommended - Easiest, free tier)
- **Railway** (Simple PostgreSQL hosting)
- **Render** (Free tier with database)
- **Self-hosted** (VPS/AWS/DigitalOcean)

Quick start for Vercel:
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add Vercel Postgres database from Storage tab
4. Set environment variables (NEXTAUTH_SECRET, NEXTAUTH_URL)
5. Deploy!

## Security

- Passwords are hashed using bcrypt
- API keys are stored encrypted in the database
- Session-based authentication with NextAuth.js
- Secure API routes with authentication middleware

## Troubleshooting

### Database Issues
```bash
rm -rf prisma/dev.db
npx prisma db push
```

### API Errors
- Verify your Dhan API credentials in Settings
- Check if your API token is still valid

## Disclaimer

This dashboard is for informational purposes only. Always verify data with your broker before making trading decisions.
