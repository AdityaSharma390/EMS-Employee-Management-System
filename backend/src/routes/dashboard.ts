import { Router, Response } from "express";
import { db } from "../lib/db";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

router.get("/", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const [
      totalEmployees,
      activeEmployees,
      totalDepartments,
      recentEmployees,
      departments,
      payrollWages,
      allEmployees
    ] = await Promise.all([
      db.employee.count(),
      db.employee.count({ where: { status: "Active" } }),
      db.department.count(),
      db.employee.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { department: true }
      }),
      db.department.findMany({
        include: {
          _count: { select: { employees: true } }
        }
      }),
      db.payroll.aggregate({
        where: { month: currentMonth, year: currentYear },
        _sum: { netSalary: true }
      }),
      db.employee.findMany({
        select: { salary: true, joiningDate: true }
      })
    ]);

    const inactiveEmployees = totalEmployees - activeEmployees;
    const monthlyWages = payrollWages._sum.netSalary || 0.0;

    // Headcount per department (matches departmentData: { name, count })
    const deptHeadcount = departments.map(d => ({
      name: d.departmentName,
      count: d._count?.employees || 0
    }));

    if (deptHeadcount.length === 0) {
      deptHeadcount.push({ name: "No Departments", count: 0 });
    }

    // Salary ranges buckets (matches salaryData: { range, count })
    const salaryRanges = [
      { range: "< $50k", count: 0 },
      { range: "$50k - $80k", count: 0 },
      { range: "$80k - $120k", count: 0 },
      { range: "$120k+", count: 0 }
    ];

    allEmployees.forEach(e => {
      if (e.salary < 50000) salaryRanges[0].count++;
      else if (e.salary <= 80000) salaryRanges[1].count++;
      else if (e.salary <= 120000) salaryRanges[2].count++;
      else salaryRanges[3].count++;
    });

    // Workforce Growth (matches growthData: { name, count })
    const sortedEmployees = [...allEmployees]
      .filter(e => e.joiningDate)
      .sort((a, b) => new Date(a.joiningDate).getTime() - new Date(b.joiningDate).getTime());

    const growthTrend: { name: string; count: number }[] = [];
    let cumulative = 0;
    sortedEmployees.forEach(e => {
      const dateStr = new Date(e.joiningDate).toLocaleDateString("en-US", { month: "short", year: "numeric" });
      cumulative++;
      const lastIndex = growthTrend.length - 1;
      if (lastIndex >= 0 && growthTrend[lastIndex].name === dateStr) {
        growthTrend[lastIndex].count = cumulative;
      } else {
        growthTrend.push({ name: dateStr, count: cumulative });
      }
    });

    if (growthTrend.length === 0) {
      growthTrend.push({ name: "No data", count: 0 });
    }

    // Take recent 6 entries of growth trend
    const recentGrowthTrend = growthTrend.slice(-6);

    return res.json({
      success: true,
      metrics: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        monthlyWages,
        totalDepartments
      },
      recentEmployees,
      charts: {
        deptHeadcount,
        salaryRanges,
        growthTrend: recentGrowthTrend
      }
    });
  } catch (error) {
    console.error("GET Dashboard Metrics Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
