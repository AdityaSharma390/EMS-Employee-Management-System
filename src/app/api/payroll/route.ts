import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { payrollSchema } from "@/validations";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") ? parseInt(searchParams.get("month")!) : undefined;
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;

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

    return NextResponse.json({ success: true, payrolls });
  } catch (error) {
    console.error("GET Payrolls Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = payrollSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { employeeId, basicSalary, bonus, deductions, tax, month, year } = result.data;

    const employee = await db.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Verify uniqueness for employee + month + year
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
      return NextResponse.json(
        { error: "A payroll record already exists for this employee for the selected month and year." },
        { status: 400 }
      );
    }

    // Calculate Net Salary = Basic + Bonus - Deductions - Tax
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
        employee: true,
      },
    });

    return NextResponse.json({ success: true, payroll }, { status: 201 });
  } catch (error) {
    console.error("POST Payroll Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
