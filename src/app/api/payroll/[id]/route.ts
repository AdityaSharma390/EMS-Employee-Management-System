import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { payrollSchema } from "@/validations";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = payrollSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { employeeId, basicSalary, bonus, deductions, tax, month, year } = result.data;

    const existing = await db.payroll.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Payroll record not found" }, { status: 404 });
    }

    // Verify uniqueness for employee + month + year excluding current record
    const duplicate = await db.payroll.findFirst({
      where: {
        employeeId,
        month,
        year,
        NOT: { id },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "A payroll record already exists for this employee for the selected month and year." },
        { status: 400 }
      );
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
        employee: true,
      },
    });

    return NextResponse.json({ success: true, payroll });
  } catch (error) {
    console.error("PUT Payroll ID Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.payroll.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Payroll record not found" }, { status: 404 });
    }

    await db.payroll.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Payroll record deleted successfully" });
  } catch (error) {
    console.error("DELETE Payroll ID Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
