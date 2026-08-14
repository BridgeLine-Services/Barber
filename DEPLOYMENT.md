# 🚀 Deploying to Vercel

This guide walks you through deploying the Barber Booking System to Vercel.

---

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. A [PostgreSQL database](https://vercel.com/docs/storage/vercel-postgres) (Vercel Postgres, Neon, Supabase, Railway, or any external PostgreSQL instance)
3. An SMTP email provider for notifications (Gmail with App Password, Resend, Postmark, etc.)

---

## Step 1: Create the Project on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the `BridgeLine-Services/Barber` repository
3. Vercel will auto-detect Next.js — keep the default framework preset

## Step 2: Set Environment Variables

In the Vercel dashboard, go to **Settings → Environment Variables** and add:

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql://...` | Your PostgreSQL connection string |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | Your Vercel deployment URL (no trailing slash) |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` | Used to sign JWT tokens |
| `SMTP_HOST` | `smtp.gmail.com` | Your SMTP host |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_USER` | `your-email@gmail.com` | SMTP username |
| `SMTP_PASS` | `your-app-password` | SMTP password (App Password for Gmail) |
| `SMTP_FROM` | `noreply@yourbarbershop.com` | From email address |
| `NEXT_PUBLIC_APP_NAME` | `BarberOS` | Public app name |

> ⚠️ **Important:** Set `NEXTAUTH_URL` to your final production URL once you have a custom domain. Otherwise use the Vercel-generated URL.

## Step 3: Deploy

1. Click **Deploy**
2. Vercel will run `npm install` and `prisma generate && next build`
3. Wait for the build to complete

## Step 4: Initialize the Database

After the first deployment, run the seed script to populate demo data.

### Option A: Local seeding (recommended for first setup)
```bash
# Clone and install locally
git clone https://github.com/BridgeLine-Services/Barber.git
cd Barber
npm install

# Use your production DATABASE_URL
DATABASE_URL="your-production-connection-string" npx prisma db push
DATABASE_URL="your-production-connection-string" npm run db:seed
```

### Option B: Vercel Postgres CLI
```bash
npm i -g vercel
vercel env pull .env.local   # Pull env vars locally
npx prisma db push             # Push schema to Vercel Postgres
npm run db:seed                # Seed demo data
```

## Step 5: Set Up a Custom Domain (Optional)

1. In Vercel: **Settings → Domains**
2. Add your domain (e.g., `book.fadefactory.com`)
3. Update your DNS records as instructed
4. Update the `NEXTAUTH_URL` environment variable to match

---

## Database Provider Recommendations

| Provider | Free Tier | Notes |
|---|---|---|
| [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) | ✅ | Native integration, easiest setup |
| [Neon](https://neon.tech) | ✅ | Serverless Postgres, great cold-start |
| [Supabase](https://supabase.com) | ✅ | Postgres + extras (auth, storage) |
| [Railway](https://railway.app) | ✅ | Simple Postgres, good for small apps |

---

## Post-Deployment Checklist

- [ ] Database schema pushed (`prisma db push`)
- [ ] Seed data loaded (`npm run db:seed`)
- [ ] Login works at `/login` with demo credentials
- [ ] Customer booking flow works end-to-end
- [ ] `NEXTAUTH_URL` matches production domain
- [ ] Email notifications sent on booking
- [ ] SEO structured data validated (Google Rich Results Test)
- [ ] SSL/HTTPS active (automatic on Vercel)

---

## Troubleshooting

### Build fails: "Prisma Client not generated"
The `vercel.json` build command runs `prisma generate` before `next build`. If issues persist, add a `postinstall` script:
```json
"postinstall": "prisma generate"
```

### 500 error: "Database connection failed"
- Verify `DATABASE_URL` is set in Vercel env vars
- Check that your database allows connections from Vercel's IP ranges
- For Neon/Supabase, ensure the connection pooler URL is used

### Login redirects to error page
- Ensure `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your deployment URL exactly (no trailing slash)
- Check browser console for cookie/domain mismatch errors
