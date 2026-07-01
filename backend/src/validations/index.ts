import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const departmentSchema = z.object({
  departmentName: z.string().min(2, "Department name must be at least 2 characters"),
  departmentHead: z.string().min(2, "Department head name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
});

export const employeeSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number must be at least 5 characters"),
  gender: z.enum(["Male", "Female", "Other"], {
    message: "Please select a gender",
  }),
  dob: z.coerce.date({
    message: "Invalid date of birth format",
  }),
  departmentId: z.string().min(1, "Please select a department"),
  designation: z.string().min(2, "Designation must be at least 2 characters"),
  salary: z.coerce.number().min(0, "Salary must be a positive number"),
  joiningDate: z.coerce.date({
    message: "Invalid joining date format",
  }),
  status: z.enum(["Active", "On Leave", "Resigned", "Suspended"], {
    message: "Please select an employment status",
  }),
  address: z.string().min(5, "Address must be at least 5 characters"),
  emergencyContact: z.string().min(5, "Emergency contact must be at least 5 characters"),
  profilePhoto: z.string().optional(),
});

export const payrollSchema = z.object({
  employeeId: z.string().min(1, "Please select an employee"),
  basicSalary: z.coerce.number().min(0, "Basic salary must be a positive number"),
  bonus: z.coerce.number().min(0, "Bonus must be a positive number").default(0),
  deductions: z.coerce.number().min(0, "Deductions must be a positive number").default(0),
  tax: z.coerce.number().min(0, "Tax must be a positive number").default(0),
  month: z.coerce.number().min(1).max(12, "Month must be between 1 and 12"),
  year: z.coerce.number().min(2000).max(2100, "Year must be between 2000 and 2100"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type DepartmentInput = z.infer<typeof departmentSchema>;
export type EmployeeInput = z.infer<typeof employeeSchema>;
export type PayrollInput = z.infer<typeof payrollSchema>;
