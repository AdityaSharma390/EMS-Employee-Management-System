# Full-Stack Employee Management System (EMS)

A premium, highly secure, full-stack Employee Management System (EMS) built with Next.js 15 (App Router), TypeScript, Tailwind CSS, Prisma ORM, and Recharts.

---

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide React, React Hook Form, Zod, Recharts, next-themes.
- **Backend**: Next.js API Routes (Route Handlers), Prisma ORM, JWT (cookie-based session validation), bcrypt (password hashing).
- **Database**: SQLite (local development), PostgreSQL (production-ready).
- **Deployment**: Vercel.

---

## Key Features

1. **Authentication**: JWT token storage in secure HTTP-only cookies, password hashing with bcrypt, page & API route interception middleware.
2. **Interactive Dashboard**: KPI metrics cards and data analytics charts (Workforce growth trends, Salary distribution, Department staffing size) using Recharts.
3. **Employee Directory (CRUD)**: Create, read, update, and delete employees with comprehensive profiles.
4. **Interactive Filters**: Quick search by name, email, or employee ID, and filters for department, status, and salary range.
5. **Salary Management**: Generate, update, and delete monthly payroll slips. Computes Net Salaries in real time based on basic, bonus, deductions, and tax values.
6. **Departments Management (CRUD)**: Manage departments, heads of departments, and live headcount statistics.
7. **Reports & Exports**: Compile workforce directory list reports, payroll statements, department summaries, and salary logs. Supports one-click CSV export and clean PDF printing.
8. **Dark & Light Mode**: Seamless theme switching with next-themes and customized tailwind colors.

---

## Folder Structure

```
src/
├── app/                  # Next.js Pages & API Route Handlers
│   ├── (dashboard)/      # Protected workspace pages (Dashboard, Employees, Departments, Payroll, Reports)
│   ├── api/              # API route endpoints (Auth, Employee, Department, Payroll CRUDs)
│   └── login/            # Fullscreen LoginPage layout
├── components/           # Reusable UI components (Sidebar, Navbar, ThemeToggle, Charts, Providers)
├── lib/                  # Shared database (Prisma Client) and authentication helpers (JWT/bcrypt)
├── validations/          # Zod input validation schemas for forms and API routes
├── middleware.ts         # Edge-runtime JWT route protection middleware
prisma/
├── schema.prisma         # Prisma data model definition (configured for SQLite/PostgreSQL)
└── seed.ts               # Database seed script for quick bootstrapping
```

---

## Installation & Local Setup

### 1. Clone & Install Dependencies
Navigate to the project directory:
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Keep the default `DATABASE_URL="file:./dev.db"` to run with SQLite locally. Make sure you set a secure string for `JWT_SECRET`.

### 3. Initialize Database & Seed
Push the schema to the local SQLite database and populate it with mock corporate data (Admin account, departments, employees, and payroll history):
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 4. Run Development Server
Start the local server:
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## Demo Credentials (Admin Account)

- **Email**: `admin@ems.com`
- **Password**: `admin123`

---

## Deployment to Vercel (PostgreSQL)

To deploy the Employee Management System to Vercel using a PostgreSQL database (e.g., Supabase or Neon):

### 1. Database Configuration
In `prisma/schema.prisma`, edit the `datasource db` block:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Set Vercel Environment Variables
Set the following environment variables in your Vercel Project Dashboard:
- `DATABASE_URL`: Your PostgreSQL connection string.
- `JWT_SECRET`: A secure random secret key.

### 3. Configure Deployment Commands
Ensure Vercel runs Prisma migrations during build by editing your build command or package.json scripts:
```bash
# In Vercel build configuration:
prisma generate && prisma migrate deploy && next build
```
