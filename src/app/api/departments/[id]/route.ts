import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { departmentSchema } from "@/validations";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = departmentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const existing = await db.department.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    const nameCheck = await db.department.findFirst({
      where: {
        departmentName: result.data.departmentName,
        NOT: { id },
      },
    });

    if (nameCheck) {
      return NextResponse.json({ error: "A department with this name already exists" }, { status: 400 });
    }

    const department = await db.department.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json({ success: true, department });
  } catch (error) {
    console.error("PUT Department ID Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.department.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    // Check if department has employees assigned
    const employeeCount = await db.employee.count({
      where: { departmentId: id },
    });

    if (employeeCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete department because it still has employees assigned to it." },
        { status: 400 }
      );
    }

    await db.department.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Department deleted successfully" });
  } catch (error) {
    console.error("DELETE Department ID Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
