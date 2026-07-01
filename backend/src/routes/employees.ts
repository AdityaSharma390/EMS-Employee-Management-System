import { Router, Response } from "express";
import { db } from "../lib/db";
import { employeeSchema } from "../validations";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth";
import { Prisma } from "@prisma/client";

const router = Router();

// GET all employees (with filters, pagination, sorting)
router.get("/", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const search = (req.query.search as string) || "";
    const departmentId = (req.query.departmentId as string) || "";
    const status = (req.query.status as string) || "";
    const minSalary = req.query.minSalary ? parseFloat(req.query.minSalary as string) : undefined;
    const maxSalary = req.query.maxSalary ? parseFloat(req.query.maxSalary as string) : undefined;
    const page = parseInt((req.query.page as string) || "1");
    const limit = parseInt((req.query.limit as string) || "10");
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) || "desc";

    const skip = (page - 1) * limit;
    const where: Prisma.EmployeeWhereInput = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { employeeId: { contains: search, mode: "insensitive" } },
      ];
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (status) {
      where.status = status;
    }

    if (minSalary !== undefined || maxSalary !== undefined) {
      where.salary = {};
      if (minSalary !== undefined) where.salary.gte = minSalary;
      if (maxSalary !== undefined) where.salary.lte = maxSalary;
    }

    const [employees, total] = await Promise.all([
      db.employee.findMany({
        where,
        include: {
          department: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      db.employee.count({ where }),
    ]);

    return res.json({
      success: true,
      employees,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET Employees Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET single employee details
router.get("/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await db.employee.findUnique({
      where: { id },
      include: {
        department: true,
      },
    });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    return res.json({ success: true, employee });
  } catch (error) {
    console.error("GET Employee Details Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST create employee
router.post("/", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = employeeSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const existingEmployee = await db.employee.findUnique({
      where: { email: result.data.email },
    });

    if (existingEmployee) {
      return res.status(400).json({ error: "An employee with this email already exists" });
    }

    // Generate custom Employee ID: EMP-XXXXX
    const lastEmployee = await db.employee.findFirst({
      orderBy: { employeeId: "desc" },
    });
    let nextId = 10001;
    if (lastEmployee && lastEmployee.employeeId.startsWith("EMP-")) {
      const lastNum = parseInt(lastEmployee.employeeId.replace("EMP-", ""));
      if (!isNaN(lastNum)) {
        nextId = lastNum + 1;
      }
    }
    const employeeId = `EMP-${nextId}`;

    const employee = await db.employee.create({
      data: {
        ...result.data,
        employeeId,
      },
      include: {
        department: true,
      },
    });

    return res.status(201).json({ success: true, employee });
  } catch (error) {
    console.error("CREATE Employee Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT update employee
router.put("/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = employeeSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const existing = await db.employee.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const emailCheck = await db.employee.findFirst({
      where: {
        email: result.data.email,
        id: { not: id },
      },
    });

    if (emailCheck) {
      return res.status(400).json({ error: "An employee with this email already exists" });
    }

    const employee = await db.employee.update({
      where: { id },
      data: result.data,
      include: {
        department: true,
      },
    });

    return res.json({ success: true, employee });
  } catch (error) {
    console.error("UPDATE Employee Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE employee
router.delete("/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await db.employee.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Employee not found" });
    }

    await db.employee.delete({
      where: { id },
    });

    return res.json({ success: true, message: "Employee deleted successfully" });
  } catch (error) {
    console.error("DELETE Employee Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
