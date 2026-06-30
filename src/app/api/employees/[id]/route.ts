import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { employeeSchema } from "@/validations";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const employee = await db.employee.findUnique({
      where: { id },
      include: { department: true },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, employee });
  } catch (error) {
    console.error("GET Employee ID Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = employeeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const existing = await db.employee.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Verify email uniqueness excluding current employee
    const emailCheck = await db.employee.findFirst({
      where: {
        email: result.data.email,
        NOT: { id },
      },
    });

    if (emailCheck) {
      return NextResponse.json({ error: "An employee with this email already exists" }, { status: 400 });
    }

    const employee = await db.employee.update({
      where: { id },
      data: result.data,
      include: { department: true },
    });

    return NextResponse.json({ success: true, employee });
  } catch (error) {
    console.error("PUT Employee ID Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.employee.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    await db.employee.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Employee deleted successfully" });
  } catch (error) {
    console.error("DELETE Employee ID Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
