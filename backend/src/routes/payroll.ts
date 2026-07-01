import { Router, Response } from "express";
import { db } from "../lib/db";
import { payrollSchema } from "../validations";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth";
import { Prisma } from "@prisma/client";

const router = Router();

// GET all payroll records
router.get("/", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;

    const where: Prisma.PayrollWhereInput = {};
    if (month) where.month = month;
    if (year) where.year = year;

    const payrolls = await db.payroll.findMany({
      where,
      include: {
        employee: {
          include: {
            department: true,
          },
        },
      },
      orderBy: [
        { year: "desc" },
        { month: "desc" },
      ],
    });

    return res.json({ success: true, payrolls });
  } catch (error) {
    console.error("GET Payrolls Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST create payroll record
router.post("/", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = payrollSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { employeeId, basicSalary, bonus, deductions, tax, month, year } = result.data;

    // Check unique constraint: one slip per employee per month/year
    const existing = await db.payroll.findUnique({
      where: {
        employeeId_month_year: {
          employeeId,
          month,
          year,
        },
      },
    });

    if (existing) {
      return res.status(400).json({
        error: "A payroll record already exists for this employee in the selected month & year",
      });
    }

    const netSalary = basicSalary + bonus - deductions - tax;

    const payroll = await db.payroll.create({
      data: {
        employeeId,
        basicSalary,
        bonus,
        deductions,
        tax,
        netSalary,
        month,
        year,
      },
      include: {
        employee: {
          include: {
            department: true,
          },
        },
      },
    });

    return res.status(201).json({ success: true, payroll });
  } catch (error) {
    console.error("CREATE Payroll Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT update payroll record
router.put("/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = payrollSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { employeeId, basicSalary, bonus, deductions, tax, month, year } = result.data;

    const existing = await db.payroll.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Payroll record not found" });
    }

    // Check unique constraint excluding current record
    const duplicate = await db.payroll.findFirst({
      where: {
        employeeId,
        month,
        year,
        id: { not: id },
      },
    });

    if (duplicate) {
      return res.status(400).json({
        error: "A payroll record already exists for this employee in the selected month & year",
      });
    }

    const netSalary = basicSalary + bonus - deductions - tax;

    const payroll = await db.payroll.update({
      where: { id },
      data: {
        employeeId,
        basicSalary,
        bonus,
        deductions,
        tax,
        netSalary,
        month,
        year,
      },
      include: {
        employee: {
          include: {
            department: true,
          },
        },
      },
    });

    return res.json({ success: true, payroll });
  } catch (error) {
    console.error("UPDATE Payroll Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE payroll record
router.delete("/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await db.payroll.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Payroll record not found" });
    }

    await db.payroll.delete({
      where: { id },
    });

    return res.json({ success: true, message: "Payroll record deleted successfully" });
  } catch (error) {
    console.error("DELETE Payroll Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
