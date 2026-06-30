import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { employeeSchema } from "@/validations";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const departmentId = searchParams.get("departmentId") || "";
    const status = searchParams.get("status") || "";
    const minSalary = searchParams.get("minSalary") ? parseFloat(searchParams.get("minSalary")!) : undefined;
    const maxSalary = searchParams.get("maxSalary") ? parseFloat(searchParams.get("maxSalary")!) : undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    const where: Prisma.EmployeeWhereInput = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { employeeId: { contains: search } },
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
        include: { department: true },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.employee.count({ where }),
    ]);

    return NextResponse.json({
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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = employeeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    // Verify email is unique
    const existingEmployee = await db.employee.findUnique({
      where: { email: result.data.email },
    });

    if (existingEmployee) {
      return NextResponse.json({ error: "An employee with this email already exists" }, { status: 400 });
    }

    // Generate custom Employee ID: EMP-XXXXX
    const lastEmployee = await db.employee.findFirst({
      orderBy: { employeeId: "desc" },
    });

    let nextNum = 10001;
    if (lastEmployee && lastEmployee.employeeId.startsWith("EMP-")) {
      const numPart = parseInt(lastEmployee.employeeId.replace("EMP-", ""));
      if (!isNaN(numPart)) {
        nextNum = numPart + 1;
      }
    }
    const employeeId = `EMP-${nextNum}`;

    const employee = await db.employee.create({
      data: {
        ...result.data,
        employeeId,
      },
      include: { department: true },
    });

    return NextResponse.json({ success: true, employee }, { status: 201 });
  } catch (error) {
    console.error("POST Employee Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
