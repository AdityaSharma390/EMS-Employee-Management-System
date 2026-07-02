import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import Routers
import authRouter from "./routes/auth";
import employeesRouter from "./routes/employees";
import departmentsRouter from "./routes/departments";
import payrollRouter from "./routes/payroll";
import dashboardRouter from "./routes/dashboard";

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS to support frontend cookies transmission
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost, vercel subdomains, or custom FRONTEND_URL
      if (
        !origin ||
        process.env.NODE_ENV !== "production" ||
        origin === "http://localhost:3000" ||
        origin.endsWith(".vercel.app") ||
        (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL)
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Base Route
app.get("/", (req, res) => {
  res.json({ message: "Employee Management System (EMS) API Server Running." });
});

// Mount API Routers
app.use("/api/auth", authRouter);
app.use("/api/employees", employeesRouter);
app.use("/api/departments", departmentsRouter);
app.use("/api/payroll", payrollRouter);
app.use("/api/dashboard", dashboardRouter);

// Start Server
app.listen(PORT, () => {
  console.log(`[server] Server listening on http://localhost:${PORT}`);
});
