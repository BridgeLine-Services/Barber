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
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/barber_booking?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-key"

SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@yourbarbershop.com"
```

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

## 🗝️ Default Login Credentials

After seeding the database, you can log in to the dashboard at `/dashboard` with these credentials:

| Role | Email | Password | Access / Notes |
| :--- | :--- | :--- | :--- |
| **Owner** | `owner@fadefactory.com` | `password123` | Full shop management, services, team, schedule & CRM |
| **Barber** | `marcus@fadefactory.com` | `password123` | Marcus Vance schedule & appointment agenda |
| **Barber** | `derrick@fadefactory.com` | `password123` | Derrick Reed schedule & appointment agenda |
| **Barber** | `jay@fadefactory.com` | `password123` | Jay Miller schedule & appointment agenda |

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
   npx prisma generate && npx prisma db push && next build
   ```

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

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## ⚠️ Disclaimer

*The legal policy pages provided in this software (Privacy Policy, Terms of Service, Booking Policy, Accessibility Statement) serve as general templates and starting points. They do not constitute formal legal advice. Barbershop owners should consult a qualified attorney to review and customize contracts for their specific state and local jurisdiction.*
