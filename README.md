# Employee Management System (EMS) - Separated Repo Structure

This repository has been decoupled into two separate standalone applications for easy evaluation, deployment, and submission.

---

## Folder Architecture

- **`/frontend`**: Next.js 15 App Router web client. Uses Tailwind CSS, shadcn/ui, Recharts, and React Hook Form. It requests data from the backend server.
- **`/backend`**: Node.js + Express.js API server running Prisma ORM with MongoDB. Handles JWT sessions, password hashing, validations, and database mutations.

---

## 1. Backend Setup & Startup (`/backend`)

The backend requires a MongoDB connection string. We recommend using a free cluster on **MongoDB Atlas** (which supports Replica Sets out-of-the-box, required by Prisma for database writes).

### Installation & Run Steps:
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside `/backend` and add your database URL & port details:
   ```env
   DATABASE_URL="mongodb+srv://<username>:<password>@cluster.mongodb.net/ems?retryWrites=true&w=majority"
   JWT_SECRET="super-secret-jwt-key-for-employee-management-system-2026"
   PORT=5000
   ```
4. Generate the database client:
   ```bash
   npx prisma generate
   ```
5. Seed the database with default administrator login and initial mock profiles:
   ```bash
   npx tsx prisma/seed.ts
   ```
6. Launch development server:
   ```bash
   npm run dev
   ```
   *The server will start listening at `http://localhost:5000`.*

---

## 2. Frontend Setup & Startup (`/frontend`)

The frontend is a Next.js client that requests data from the Express backend.

### Installation & Run Steps:
1. Open a terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside `/frontend` and configure your API endpoint matching the backend port:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:5000"
   JWT_SECRET="super-secret-jwt-key-for-employee-management-system-2026"
   ```
4. Start development client:
   ```bash
   npm run dev
   ```
   *The application will boot at `http://localhost:3000`.*

---

## 3. Demo Credentials for Login

Use these default credentials to log in once both servers are running:
- **Email**: `admin@ems.com`
- **Password**: `admin123`

---

## 4. Deployment Instructions

### Backend (Render, Heroku, or Railway)
- Set build command: `npx prisma generate && npm run build`
- Start command: `npm run start`
- Inject environment variables `DATABASE_URL` and `JWT_SECRET` in your provider's dashboard.

### Frontend (Vercel)
- Target directory: `/frontend`
- Build command: `npm run build`
- Inject environment variable `NEXT_PUBLIC_API_URL` pointing to your deployed backend URL.
