import { Router, Response } from "express";
import { db } from "../lib/db";
import { departmentSchema } from "../validations";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// GET all departments
router.get("/", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const departments = await db.department.findMany({
      include: {
        _count: {
          select: { employees: true },
        },
      },
      orderBy: { departmentName: "asc" },
    });
    return res.json({ success: true, departments });
  } catch (error) {
    console.error("GET Departments Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST create department
router.post("/", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = departmentSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const existing = await db.department.findUnique({
      where: { departmentName: result.data.departmentName },
    });

    if (existing) {
      return res.status(400).json({ error: "A department with this name already exists" });
    }

    const department = await db.department.create({
      data: result.data,
    });

    return res.status(201).json({ success: true, department });
  } catch (error) {
    console.error("CREATE Department Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT update department
router.put("/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = departmentSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const existing = await db.department.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Department not found" });
    }

    const nameCheck = await db.department.findFirst({
      where: {
        departmentName: result.data.departmentName,
        id: { not: id },
      },
    });

    if (nameCheck) {
      return res.status(400).json({ error: "A department with this name already exists" });
    }

    const department = await db.department.update({
      where: { id },
      data: result.data,
    });

    return res.json({ success: true, department });
  } catch (error) {
    console.error("UPDATE Department Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE department
router.delete("/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await db.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });

    if (!existing) {
      return res.status(404).json({ error: "Department not found" });
    }

    if (existing._count && existing._count.employees > 0) {
      return res
        .status(400)
        .json({ error: "Cannot delete department while it contains active employees" });
    }

    await db.department.delete({
      where: { id },
    });

    return res.json({ success: true, message: "Department deleted successfully" });
  } catch (error) {
    console.error("DELETE Department Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
