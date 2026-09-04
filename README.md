# 💈 Barber Booking System

A modern, full-stack, multi-tenant barber shop web application built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, and **Prisma ORM with PostgreSQL**.

Designed with a high-end, dark & gold premium aesthetic, this application provides a seamless online booking experience for clients, comprehensive management tools for shop owners and barbers, and zero online payment overhead (**pay in person at the shop**).

---

## 🚀 Key Features

### 🌐 Customer Website
- **Sleek Dark Theme**: Premium aesthetic styled with Tailwind CSS, Lucide icons, and shadcn UI components.
- **Dynamic Shop Profile**: Shop hours, barber roster, service pricing, custom branding, and client reviews.
- **SEO & Structured Data**: Built-in Schema.org JSON-LD microdata (`BarberShop`, `Service`, `FAQPage`, `BreadcrumbList`) for optimal search engine ranking.
- **Legal & Compliance**: Complete Privacy Policy, Terms of Service, Booking Policy, and WCAG 2.1 AA Accessibility Statement pages.

### 📅 Booking Engine
- **6-Step Frictionless Flow**: Service Selection ➔ Barber Selection ➔ Date Selection ➔ Time Slot Picker ➔ Customer Details ➔ Instant Confirmation.
- **Real-time Availability Calculation**: Dynamically computes open slots based on barber weekly schedules, break times, existing appointments, and blocked time off.
- **Double-Booking Protection**: Database transactions and strict interval overlap checks prevent overbooking.
- **No Online Payment Needed**: Clients book without upfront deposits or credit cards; payment is collected in person after service.
- **Confirmation & Management**: Instant confirmation code (e.g., `BRB-8F42K`), transactional email notifications, and self-service cancellation links.

### 🛡️ Owner & Barber Dashboard
- **Role-Based Access Control (RBAC)**: Distinct permissions for Shop Owners (`OWNER`) and Barbers (`BARBER`) authenticated via NextAuth.js.
- **Appointment Management**: View today's agenda, filter by status or barber, create manual walk-in appointments, reschedule, or cancel bookings.
- **Barber & Schedule Controls**: Custom working hours per day of week, lunch breaks, and blocked vacation time.
- **Service & Menu Management**: Add, edit, reorder, or toggle active status for haircut and beard services.
- **Customer CRM**: Client list with booking history, contact info, notes, and SMS opt-in status.

### 🏢 Multi-Tenant Architecture
- Every business-scoped record is strictly linked to a `businessId`.
- Scalable database isolation guarantees data privacy across barbershops.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Components)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [lucide-react](https://lucide.react.dev/)
- **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) + [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (Credentials Provider with `bcryptjs`)
- **Email**: [Nodemailer](https://nodemailer.com/) (Transactional SMTP)
- **Date Utility**: [date-fns](https://date-fns.org/)
- **Seed & Runner**: [tsx](https://github.com/privatenumber/tsx)

---

## 📋 Prerequisites

Before running this project, ensure you have installed:
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: Local instance running on port 5432, or a hosted database (Neon, Supabase, Railway, Render)

---

## ⚡ Quick Start & Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-org/barber-booking-system.git
cd barber-booking-system
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your database URL and NextAuth secret in `.env`:
```env
# DATABASE_URL must be configured in your environment; do not commit a connection string.
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-key"

# Email is optional; the booking system works without these variables.
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@yourbarbershop.com"
```

`NEXT_PUBLIC_APP_URL` is the single public URL used for metadata, canonical links, Open Graph, sitemap, and robots. It may remain unset during local development (the app falls back to `http://localhost:3000`), but set it to the client's HTTPS domain before deployment.

### 4. Push Prisma database schema
```bash
npx prisma db push
```

### 5. Seed the database with demo data
```bash
npm run db:seed
```

### 6. Start the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗝️ Login Credentials & App Modes

The seed script behavior depends on `APP_MODE`:

### Production Mode (default — `APP_MODE` unset or `production`)

```bash
npm run db:seed
# or with real shop details:
SEED_BUSINESS_NAME="Mike's Cuts" SEED_OWNER_EMAIL="mike@mikescuts.com" npm run db:seed
```

- Creates only the real setup data: business, **owner account**, starter services & barbers.
- The owner password is **auto-generated and printed once** — or set via `SEED_OWNER_PASSWORD`.
- **Well-known weak passwords (e.g. `password123`) are rejected**, even when explicitly provided.
- **No demo accounts, no sample customers/appointments/reviews.**
- No barber login accounts are created — add real staff in Dashboard > Staff.
- All seeded users get `mustChangePassword = true` and must change their password via `/change-password` before reaching the dashboard.

### Demo Mode (`APP_MODE=demo`)

```bash
APP_MODE=demo npm run db:seed
```

- Adds the full demo dataset: sample customers, appointments, reviews, and barber login accounts — all clearly labeled as **DEMO DATA**.
- Uses the known demo password `password123` (override with `SEED_OWNER_PASSWORD`).
- Demo accounts are flagged `mustChangePassword = true` and must change their password on first login.
- **Intended for local development, testing, and client demos only — never deploy with `APP_MODE=demo`.**

### Forced password change

Any user with `mustChangePassword = true` (set by the seed script) is server-side redirected to `/change-password` and cannot reach `/dashboard` until the password is changed.

### Owner registration (`OWNER_REGISTRATION_MODE`)

Controls whether new owner accounts can be created on this deployment. The API enforces it server-side; the login page UI adapts automatically.

| Value | Behavior |
| --- | --- |
| `onboarding` (default) | Public owner sign-up enabled. After registering, the owner is signed in and sent straight into the 5-step onboarding wizard. |
| `invite_only` | No public sign-up. The register form is hidden and a notice explains that accounts are created by invitation (add users manually or via the seed script / admin tooling). |
| `disabled` | Registration hidden entirely — only existing users can log in. |

- Emails are normalized (trim + lowercase) so case variants cannot create duplicate accounts.
- Passwords use the shared policy: min 8 chars, at least one letter and one number.
- Registration is rate-limited, and error messages never expose internal system details.
- Unknown values **fail safe to `disabled`** — a typo never leaves sign-up accidentally open.

### First owner setup & onboarding

1. Set `OWNER_REGISTRATION_MODE=onboarding` (default) and create your owner account at `/login` → *Create one*, **or** seed an owner with `npm run db:seed` (see above).
2. After sign-in, the owner is routed into the onboarding wizard: **Business Basics → Branding → Services → Team (barbers + weekly schedules) → Booking Settings → Review**.
3. Progress is persisted in the database — the owner can leave and resume exactly where they stopped.
4. The **Review & Complete** step lists every server-side requirement and links back to the step that fixes it. Setup can only be completed when the business has: a name, a valid slug, a timezone, **≥ 1 active service**, **≥ 1 active barber**, and a weekly schedule for every active barber.
5. Clicking **Complete Setup** sets `onboardingCompleted = true` + `onboardingCompletedAt` and redirects to `/dashboard`.
6. Nothing is locked afterwards — services, barbers, branding, and settings stay editable from the dashboard.

### Password reset

Self-service password recovery is built in (`/forgot-password` → `/reset-password?token=…`):

- Always responds with the same generic message whether or not the account exists (no email enumeration).
- Reset tokens are random 256-bit values, **stored only as SHA-256 hashes**, expire after **1 hour**, and are **single-use** (invalidated the moment the password changes).
- A successful reset updates the password hash, clears the token fields, sets `passwordChangedAt`, clears `mustChangePassword`, and records an audit entry.
- **If SMTP is configured** (`SMTP_HOST`, `SMTP_USER`, `SMTP_FROM`), the reset email is sent.
- **If SMTP is not configured**: in development/demo the reset link is returned directly in the response (safe to test without a mail server); in **production the server refuses to pretend an email was sent** and answers honestly — tokens are never exposed in production.
- Both endpoints are rate-limited.

---

## 🗄️ Database Schema Overview

The database models in `prisma/schema.prisma` are designed with strict foreign key relations and cascade deletions:

```
[Business] (Tenant)
  ├── [User] (Role: OWNER | BARBER)
  ├── [Barber]
  │     ├── [Schedule] (Weekly recurring hours & breaks)
  │     ├── [BarberService] (Junction -> Service)
  │     └── [BlockedTime] (Vacation / Time off)
  ├── [Service] (Duration, Price, Order)
  ├── [Customer] (Contact info, SMS consent, Notes)
  ├── [Appointment] (Confirmation #, Start/End, Status)
  └── [Review] (Rating, Comment, Featured status)
```

### Core Models & Key Enums
- **`Business`**: Central multi-tenant entity holding branding, location, hours JSON, and policies.
- **`User`**: Admin users (Owners or Barbers) with hashed credentials (`passwordHash`).
- **`Barber`**: Individual barber profiles linked to working schedules and services.
- **`Schedule`**: Stores day-of-week working hours (`startTime`, `endTime`, `isOff`) and lunch breaks JSON.
- **`Service`**: Available haircut/beard offerings with durations in minutes and pricing in USD.
- **`BarberService`**: Many-to-many junction model specifying which barbers perform which services.
- **`Customer`**: Unique client records per business identified by email and phone.
- **`AppointmentStatus`**: Enum `[PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW, RESCHEDULED]`.
- **`BlockedTime`**: Barber-specific or shop-wide schedule blocks.

---

## 📂 Project Structure Overview

```
barber-booking-system/
├── prisma/
│   ├── schema.prisma       # Database schema & relations
│   └── seed.ts             # Demo data seeder script
├── src/
│   ├── app/
│   │   ├── (customer)/     # Customer website (home, services, legal pages)
│   │   │   ├── privacy/
│   │   │   ├── terms/
│   │   │   ├── booking-policy/
│   │   │   └── accessibility/
│   │   ├── (customer)/book/# 6-step booking flow
│   │   ├── (dashboard)/    # Admin & Barber dashboard pages
│   │   ├── api/            # REST API endpoints & NextAuth route
│   │   ├── layout.tsx      # Root application layout
│   │   ├── not-found.tsx   # Custom dark/gold 404 page
│   │   ├── error.tsx       # Global client error boundary
│   │   └── loading.tsx     # Route transition spinner
│   ├── components/
│   │   ├── ui/             # shadcn/ui primitives (Button, Card, Dialog, etc.)
│   │   ├── seo/            # StructuredData & JsonLd server components
│   │   ├── booking/        # Interactive booking steps & widgets
│   │   └── dashboard/      # Admin tables, calendar, forms
│   └── lib/
│       ├── prisma.ts       # Prisma Client singleton
│       ├── auth.ts         # NextAuth options & RBAC helpers
│       ├── availability.ts # Slot calculation engine
│       ├── seo.ts          # Schema.org JSON-LD generators
│       ├── notifications.ts# Email sender via Nodemailer
│       ├── constants.ts    # Statuses, defaults & UI constants
│       └── utils.ts        # Tailwind merge & formatting helpers
├── next.config.mjs
├── tailwind.config.ts
└── README.md
```

---

## 🔌 API Documentation

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/[...nextauth]` | Login / Logout authentication handlers | No |
| `GET` | `/api/availability` | Fetch open timeslots given `barberId`, `serviceId`, and `date` | No |
| `POST` | `/api/appointments` | Create new customer appointment reservation | No |
| `GET` | `/api/appointments/[id]` | Fetch appointment details by confirmation code | No |
| `PATCH` | `/api/appointments/[id]` | Cancel or reschedule an appointment | No / Code |
| `GET` | `/api/dashboard/appointments` | List shop appointments with date & status filters | Yes (Staff) |
| `POST` | `/api/dashboard/appointments` | Create manual walk-in or phone appointment | Yes (Staff) |
| `GET` | `/api/dashboard/barbers` | List barbers and working schedules | Yes (Staff) |
| `GET` | `/api/dashboard/services` | List shop services and pricing | Yes (Staff) |
| `GET` | `/api/dashboard/customers` | Query customer directory and booking history | Yes (Staff) |

---

## ⚙️ Core System Architecture

### 1. Booking Flow Logic
1. **Service Selection**: Client picks haircut or grooming service (determines slot duration).
2. **Barber Selection**: Client picks a specific barber or "First Available".
3. **Date Picker**: Client picks an available working day within shop hours.
4. **Time Slot Engine**: Calls `/api/availability`, which fetches the barber's `Schedule` for that weekday, subtracts `breaks`, subtracts `BlockedTime`, and subtracts existing `Appointment` intervals.
5. **Customer Info**: Client enters name, email, phone number, notes, and SMS preference.
6. **Confirmation**: Generates a unique `confirmationNumber`, records the appointment as `CONFIRMED` or `PENDING`, and triggers transactional email confirmation.

### 2. Double-Booking Protection
To prevent race conditions when two clients attempt to select the same slot simultaneously:
- Time slots are computed dynamically on submission against active database records.
- Overlap detection checks if `(NewStart < ExistingEnd) AND (NewEnd > ExistingStart)`.
- Database write transactions reject conflicting bookings and alert the client to select another time.

### 3. Multi-Tenant Data Isolation
- Queries in `src/lib/` explicitly enforce `where: { businessId }`.
- Staff sessions restrict data visibility strictly to their registered business.

---

## 🚀 Deployment Guide

### Deploying to Vercel + Managed PostgreSQL

1. **Database Setup**:
   Create a managed PostgreSQL database on [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Render](https://render.com).

2. **Deploy to Vercel**:
   Push your repository to GitHub and import it into Vercel.

3. **Configure Environment Variables**:
   In your Vercel Project Settings, add:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (your production URL, e.g. `https://yourbarbershop.com`)
   - `NEXTAUTH_SECRET`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

4. **Run Database Migrations during build**:
   Set your Vercel Build Command to:
   ```bash
   npx prisma generate && next build
   ```

For production database changes, run reviewed migrations separately with `npx prisma migrate deploy`. Do not run `prisma db push` against a client production database.

---

## 🎨 Customization Guide

- **Changing Colors & Aesthetics**:
  Update `primaryColor` and `accentColor` in the `Business` database table or modify `tailwind.config.ts`.
- **Modifying Services & Prices**:
  Shop owners can manage services directly through the Dashboard at `/dashboard/services`.
- **Managing Barbers & Schedules**:
  Barber profiles and individual weekly working hours can be edited at `/dashboard/team`.

---

## 📧 Email & 📱 SMS Setup

### Transactional Email (Nodemailer)
- Standard SMTP settings are configured via `src/lib/notifications.ts`.
- Supports Gmail, SendGrid, Mailgun, or Amazon SES credentials in `.env`.

### Optional SMS Reminders (Twilio)
- To enable SMS notifications, uncomment Twilio environment variables in `.env` and wire your Twilio client into `src/lib/notifications.ts`.

---

## 🗺️ Roadmap (Phase 2)

- [ ] Online credit card deposit processing via Stripe (optional opt-in per shop).
- [ ] Automated SMS reminders 2 hours before scheduled appointments.
- [ ] Advanced analytics dashboard (revenue per barber, peak hour charts, client retention rates).
- [ ] One-click customer rebooking via SMS link.
- [ ] Multi-location support for barbershop chains.

---

## Template and production modes

This repository is a reusable barber-booking template. It is intentionally not configured for a specific client.

### Template mode

Set `APP_MODE=demo` for local evaluation. Demo mode uses the seeded business and demo session flow so the customer site and dashboard can run without a client database. Demo credentials and seeded data are for development only and must never be reused for a client deployment.

### Production mode

Set `APP_MODE=production` for a client deployment. Production must use a real `DATABASE_URL`, `NEXTAUTH_URL`, and high-entropy `NEXTAUTH_SECRET`; dashboard access is fail-closed until a real authenticated production session is configured. Public tenants resolve from the request host/slug, while dashboard tenants resolve from the authenticated user membership—there is no demo-business fallback in production.

Client configuration belongs in the `Business` record and related settings models: name, description, contact details, timezone, branding, hours, policies, reminders, rebooking, customer verification, and waitlist behavior. Do not put client secrets or business-specific values in source code.

### Production checklist

1. Provision PostgreSQL and apply reviewed Prisma migrations (`npx prisma migrate deploy`).
2. Configure environment variables in the deployment provider, never in Git.
3. Create the client owner and business through the onboarding/admin path; verify the owner and barber memberships.
4. Configure SMTP and optional SMS credentials only when the client enables those channels.
5. Verify tenant isolation, booking conflict handling, customer token access, cancellation/rescheduling, and backup restoration before publishing the client domain.
6. Enable automated encrypted database backups with point-in-time recovery where supported; test a restore regularly in a separate database.

Detailed client-specific values should be supplied during onboarding rather than baked into this template.

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## ⚠️ Disclaimer

*The legal policy pages provided in this software (Privacy Policy, Terms of Service, Booking Policy, Accessibility Statement) serve as general templates and starting points. They do not constitute formal legal advice. Barbershop owners should consult a qualified attorney to review and customize contracts for their specific state and local jurisdiction.*
