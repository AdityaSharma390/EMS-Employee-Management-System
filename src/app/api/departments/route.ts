import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { departmentSchema } from "@/validations";

export async function GET() {
  try {
    const departments = await db.department.findMany({
      include: {
        _count: {
          select: { employees: true },
        },
      },
      orderBy: { departmentName: "asc" },
    });

    return NextResponse.json({ success: true, departments });
  } catch (error) {
    console.error("GET Departments Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = departmentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const existing = await db.department.findUnique({
      where: { departmentName: result.data.departmentName },
    });

    if (existing) {
      return NextResponse.json({ error: "A department with this name already exists" }, { status: 400 });
    }

    const department = await db.department.create({
      data: result.data,
    });

    return NextResponse.json({ success: true, department }, { status: 201 });
  } catch (error) {
    console.error("POST Department Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
