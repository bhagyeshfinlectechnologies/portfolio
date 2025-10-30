# Deployment Guide

This guide will help you deploy your Dhan Portfolio Dashboard online.

## Option 1: Vercel (Recommended)

Vercel is the easiest and fastest way to deploy Next.js applications.

### Prerequisites
- GitHub repository (already set up ✓)
- Vercel account (free tier available)

### Step-by-Step Deployment

#### 1. Set Up Vercel Postgres Database

1. Go to [Vercel](https://vercel.com) and sign up/login
2. Create a new project and import your GitHub repository
3. Before deploying, go to the **Storage** tab
4. Click **Create Database** → **Postgres**
5. Follow the prompts to create a free Postgres database
6. Vercel will automatically add database environment variables

#### 2. Update Prisma Schema for Production

Replace `prisma/schema.prisma` with the PostgreSQL version:

```bash
# Backup current schema
cp prisma/schema.prisma prisma/schema.sqlite.prisma

# Use production schema
cp prisma/schema.production.prisma prisma/schema.prisma
```

Or manually update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

#### 3. Configure Environment Variables

In Vercel project settings → Environment Variables, add:

```env
DATABASE_URL=<automatically-added-by-vercel-postgres>
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=<generate-with-command-below>
```

Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

#### 4. Add Build Command

In Vercel project settings → General, set:

- **Build Command**: `npx prisma generate && npx prisma db push && npm run build`
- **Install Command**: `npm install`

#### 5. Deploy

1. Commit and push the Prisma schema changes:
```bash
git add prisma/schema.prisma
git commit -m "Update schema for PostgreSQL production deployment"
git push
```

2. Vercel will automatically deploy
3. Your app will be live at `https://your-app-name.vercel.app`

#### 6. Initialize Database

After first deployment:
1. Go to Vercel project → Settings → Functions
2. Run this command in Vercel CLI or add a setup script
3. Or simply visit your app and register - it will create tables automatically

---

## Option 2: Railway

Railway offers PostgreSQL and is very beginner-friendly.

### Steps:

1. **Sign up at [Railway](https://railway.app)**

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add PostgreSQL Database**
   - In your project, click "New"
   - Select "Database" → "PostgreSQL"
   - Railway will provide a `DATABASE_URL`

4. **Configure Environment Variables**
   ```env
   DATABASE_URL=<from-railway-postgres>
   NEXTAUTH_URL=https://your-app.railway.app
   NEXTAUTH_SECRET=<your-secret>
   ```

5. **Add Start Command**
   - Go to Settings → Deploy
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npx prisma db push && npm start`

6. **Deploy**
   - Railway will auto-deploy on push
   - You'll get a URL like `https://your-app.railway.app`

---

## Option 3: Render

Render offers free tier with PostgreSQL.

### Steps:

1. **Sign up at [Render](https://render.com)**

2. **Create PostgreSQL Database**
   - New → PostgreSQL
   - Note the Internal Database URL

3. **Create Web Service**
   - New → Web Service
   - Connect your GitHub repository
   - Configure:
     - **Build Command**: `npm install && npx prisma generate && npx prisma db push && npm run build`
     - **Start Command**: `npm start`

4. **Environment Variables**
   ```env
   DATABASE_URL=<from-render-postgres>
   NEXTAUTH_URL=https://your-app.onrender.com
   NEXTAUTH_SECRET=<your-secret>
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy

---

## Option 4: Self-Hosted (VPS)

For AWS, DigitalOcean, or any VPS:

### Requirements:
- Ubuntu/Debian server
- Node.js 18+
- PostgreSQL
- Nginx (recommended)

### Steps:

1. **Install Dependencies**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Install Nginx
sudo apt-get install nginx
```

2. **Set Up Database**
```bash
sudo -u postgres psql
CREATE DATABASE portfolio;
CREATE USER portfolio_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE portfolio TO portfolio_user;
\q
```

3. **Clone and Configure**
```bash
git clone <your-repo-url>
cd portfolio
npm install

# Create .env file
nano .env
```

Add:
```env
DATABASE_URL="postgresql://portfolio_user:your_password@localhost:5432/portfolio"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="<your-secret>"
NODE_ENV=production
```

4. **Build and Start**
```bash
npx prisma generate
npx prisma db push
npm run build
npm start
```

5. **Configure Nginx**
```bash
sudo nano /etc/nginx/sites-available/portfolio
```

Add:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

6. **Set Up SSL with Let's Encrypt**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

7. **Set Up PM2 for Process Management**
```bash
npm install -g pm2
pm2 start npm --name "portfolio" -- start
pm2 startup
pm2 save
```

---

## Database Migration

When switching from SQLite to PostgreSQL:

1. **Export data from SQLite** (if you have existing users):
```bash
sqlite3 prisma/dev.db .dump > backup.sql
```

2. **Update schema to PostgreSQL**
3. **Run migrations**:
```bash
npx prisma db push
```

4. **Import data manually** through the registration page or SQL

---

## Environment Variables Reference

All platforms need these environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | Provided by hosting platform |
| `NEXTAUTH_URL` | Your app's public URL | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Random secret for sessions | Generate with `openssl rand -base64 32` |
| `NODE_ENV` | Environment | `production` |

---

## Post-Deployment Checklist

- [ ] App is accessible at the deployed URL
- [ ] Can register a new user account
- [ ] Can login successfully
- [ ] Can save Dhan API credentials in Settings
- [ ] Dashboard loads portfolio data
- [ ] All pages (Holdings, Positions, Orders, Funds) work
- [ ] Real-time refresh is working
- [ ] Mobile responsive design works

---

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correctly set
- Check if database is running
- Ensure Prisma client is generated: `npx prisma generate`

### Build Failures
- Check Node.js version (needs 18+)
- Clear cache: `rm -rf .next node_modules && npm install`
- Check build logs for specific errors

### Authentication Not Working
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies and try again

### API Integration Failing
- Verify Dhan API credentials in Settings
- Check if Dhan API is accessible from your server
- Look at browser console and server logs

---

## Recommended: Start with Vercel

For the easiest deployment experience:

1. **Vercel** - Best for beginners, free tier, automatic SSL
2. **Railway** - Good alternative, simpler than AWS
3. **Render** - Free tier with PostgreSQL included
4. **Self-hosted** - Full control but requires more setup

Choose Vercel unless you have specific requirements for another platform.
