import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Clean existing data
  await prisma.payroll.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Admin User
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@ems.com",
      password: adminPassword,
      role: "admin",
    },
  });
  console.log("Created admin user:", admin.email);

  // 3. Create Departments
  const deptEngineering = await prisma.department.create({
    data: {
      departmentName: "Engineering",
      departmentHead: "John Doe",
      description: "Software engineering, product development, and operations.",
    },
  });

  const deptHR = await prisma.department.create({
    data: {
      departmentName: "Human Resources",
      departmentHead: "Sarah Smith",
      description: "Recruitment, onboarding, compliance, and employee success.",
    },
  });

  const deptSales = await prisma.department.create({
    data: {
      departmentName: "Sales & Marketing",
      departmentHead: "Michael Johnson",
      description: "Customer acquisition, digital marketing, and revenue generation.",
    },
  });

  console.log("Created departments: Engineering, Human Resources, Sales & Marketing");

  // 4. Create Employees
  const employeesData = [
    {
      employeeId: "EMP-10001",
      fullName: "Alice Vance",
      email: "alice@ems.com",
      phone: "+1 555-0101",
      gender: "Female",
      dob: new Date("1993-04-12"),
      departmentId: deptEngineering.id,
      designation: "Senior Frontend Engineer",
      salary: 95000,
      joiningDate: new Date("2022-03-15"),
      status: "Active",
      address: "123 Tech Lane, San Francisco, CA",
      emergencyContact: "Bob Vance (+1 555-0102)",
    },
    {
      employeeId: "EMP-10002",
      fullName: "Bob Chen",
      email: "bob@ems.com",
      phone: "+1 555-0103",
      gender: "Male",
      dob: new Date("1990-11-23"),
      departmentId: deptEngineering.id,
      designation: "Principal Architect",
      salary: 140000,
      joiningDate: new Date("2021-06-01"),
      status: "Active",
      address: "456 Silicon Valley Blvd, San Jose, CA",
      emergencyContact: "Claire Chen (+1 555-0104)",
    },
    {
      employeeId: "EMP-10003",
      fullName: "Catherine Miller",
      email: "catherine@ems.com",
      phone: "+1 555-0105",
      gender: "Female",
      dob: new Date("1995-07-08"),
      departmentId: deptHR.id,
      designation: "HR Manager",
      salary: 75000,
      joiningDate: new Date("2023-01-10"),
      status: "Active",
      address: "789 Pine Ave, Seattle, WA",
      emergencyContact: "David Miller (+1 555-0106)",
    },
    {
      employeeId: "EMP-10004",
      fullName: "David Kross",
      email: "david@ems.com",
      phone: "+1 555-0107",
      gender: "Male",
      dob: new Date("1988-02-28"),
      departmentId: deptSales.id,
      designation: "Sales Executive",
      salary: 60000,
      joiningDate: new Date("2023-08-15"),
      status: "Active",
      address: "101 Maple Rd, Austin, TX",
      emergencyContact: "Emma Kross (+1 555-0108)",
    },
    {
      employeeId: "EMP-10005",
      fullName: "Emma Watson",
      email: "emma@ems.com",
      phone: "+1 555-0109",
      gender: "Female",
      dob: new Date("1997-09-30"),
      departmentId: deptEngineering.id,
      designation: "Junior Developer",
      salary: 65000,
      joiningDate: new Date("2024-02-01"),
      status: "Active",
      address: "202 Elm St, Boston, MA",
      emergencyContact: "Frank Watson (+1 555-0110)",
    },
    {
      employeeId: "EMP-10006",
      fullName: "Frank Castle",
      email: "frank@ems.com",
      phone: "+1 555-0111",
      gender: "Male",
      dob: new Date("1985-05-15"),
      departmentId: deptSales.id,
      designation: "Marketing Lead",
      salary: 85000,
      joiningDate: new Date("2020-10-12"),
      status: "On Leave",
      address: "303 Dark Alley, New York, NY",
      emergencyContact: "Grace Castle (+1 555-0112)",
    },
    {
      employeeId: "EMP-10007",
      fullName: "Grace Hopper",
      email: "grace@ems.com",
      phone: "+1 555-0113",
      gender: "Female",
      dob: new Date("1991-12-09"),
      departmentId: deptEngineering.id,
      designation: "Security Engineer",
      salary: 110000,
      joiningDate: new Date("2022-11-01"),
      status: "Active",
      address: "404 Cipher Dr, Washington, DC",
      emergencyContact: "Henry Hopper (+1 555-0114)",
    },
    {
      employeeId: "EMP-10008",
      fullName: "Henry Cavill",
      email: "henry@ems.com",
      phone: "+1 555-0115",
      gender: "Male",
      dob: new Date("1983-05-05"),
      departmentId: deptSales.id,
      designation: "Director of Sales",
      salary: 150000,
      joiningDate: new Date("2019-01-20"),
      status: "Suspended",
      address: "505 Metropolis Way, Chicago, IL",
      emergencyContact: "Martha Cavill (+1 555-0116)",
    },
    {
      employeeId: "EMP-10009",
      fullName: "Ivy Thorne",
      email: "ivy@ems.com",
      phone: "+1 555-0117",
      gender: "Female",
      dob: new Date("1996-03-22"),
      departmentId: deptHR.id,
      designation: "Recruiting Coordinator",
      salary: 50000,
      joiningDate: new Date("2024-05-10"),
      status: "Active",
      address: "606 Oak Dr, Atlanta, GA",
      emergencyContact: "Jack Thorne (+1 555-0118)",
    },
    {
      employeeId: "EMP-10010",
      fullName: "Jack Ryan",
      email: "jack@ems.com",
      phone: "+1 555-0119",
      gender: "Male",
      dob: new Date("1989-08-14"),
      departmentId: deptEngineering.id,
      designation: "DevOps Engineer",
      salary: 105000,
      joiningDate: new Date("2023-05-15"),
      status: "Resigned",
      address: "707 CIA Blvd, Arlington, VA",
      emergencyContact: "Cathy Ryan (+1 555-0120)",
    },
  ];

  const employees = [];
  for (const empData of employeesData) {
    const emp = await prisma.employee.create({
      data: empData,
    });
    employees.push(emp);
  }
  console.log(`Created ${employees.length} employees.`);

  // 5. Create Payroll Records for May and June 2026
  const payrollMonths = [
    { month: 5, year: 2026 },
    { month: 6, year: 2026 },
  ];

  let payrollCount = 0;
  for (const emp of employees) {
    // Only pay employees who are Active or On Leave (Resigned or Suspended employees aren't paid this month)
    if (emp.status === "Resigned" || emp.status === "Suspended") continue;

    for (const { month, year } of payrollMonths) {
      const basic = emp.salary / 12;
      const bonus = month === 6 ? basic * 0.1 : 0; // June mid-year bonus
      const deductions = basic * 0.05; // 5% deductions (pension, health)
      const tax = (basic + bonus) * 0.15; // 15% flat tax
      const net = basic + bonus - deductions - tax;

      await prisma.payroll.create({
        data: {
          employeeId: emp.id,
          basicSalary: Math.round(basic * 100) / 100,
          bonus: Math.round(bonus * 100) / 100,
          deductions: Math.round(deductions * 100) / 100,
          tax: Math.round(tax * 100) / 100,
          netSalary: Math.round(net * 100) / 100,
          month,
          year,
        },
      });
      payrollCount++;
    }
  }
  console.log(`Created ${payrollCount} payroll history records.`);
  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
