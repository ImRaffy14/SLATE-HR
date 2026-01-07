/**
 * Script to link a User account to an Employee record
 * 
 * Usage:
 *   npx ts-node src/scripts/linkUserToEmployee.ts <userEmail> <employeeId>
 * 
 * Or to create a new Employee and link:
 *   npx ts-node src/scripts/linkUserToEmployee.ts <userEmail> --create "Employee Name" [email] [department]
 */

import prisma from '../config/prisma';
import { EmployeeService } from '../services/employee.service';

async function linkUserToEmployee(userEmail: string, employeeId: string) {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      console.error(`❌ User with email "${userEmail}" not found`);
      process.exit(1);
    }

    // Find employee by ID
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      console.error(`❌ Employee with ID "${employeeId}" not found`);
      process.exit(1);
    }

    // Check if employee is already linked to another user
    const existingUser = await prisma.user.findFirst({
      where: { employeeId: employee.id }
    });

    if (existingUser && existingUser.id !== user.id) {
      console.error(`❌ Employee is already linked to user: ${existingUser.email}`);
      process.exit(1);
    }

    // Check if user already has an employeeId
    if (user.employeeId) {
      console.log(`⚠️  User already has employeeId: ${user.employeeId}`);
      console.log(`   Updating to new employeeId: ${employeeId}`);
    }

    // Link user to employee
    await prisma.user.update({
      where: { id: user.id },
      data: { employeeId: employee.id }
    });

    console.log(`✅ Successfully linked User "${userEmail}" to Employee "${employee.name}" (${employee.id})`);
  } catch (error) {
    console.error('❌ Error linking user to employee:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function createEmployeeAndLink(userEmail: string, employeeName: string, employeeEmail?: string, department?: string) {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      console.error(`❌ User with email "${userEmail}" not found`);
      process.exit(1);
    }

    // Create employee
    const employeeService = new EmployeeService();
    const employee = await employeeService.createEmployeeService({
      name: employeeName,
      email: employeeEmail || userEmail,
      department: department
    });

    // Link user to employee
    await prisma.user.update({
      where: { id: user.id },
      data: { employeeId: employee.id }
    });

    console.log(`✅ Successfully created Employee "${employee.name}" and linked to User "${userEmail}"`);
    console.log(`   Employee ID: ${employee.id}`);
  } catch (error) {
    console.error('❌ Error creating employee and linking:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log(`
Usage:
  Link existing employee:
    npx ts-node src/scripts/linkUserToEmployee.ts <userEmail> <employeeId>
  
  Create new employee and link:
    npx ts-node src/scripts/linkUserToEmployee.ts <userEmail> --create "Employee Name" [email] [department]

Examples:
  npx ts-node src/scripts/linkUserToEmployee.ts user@example.com 507f1f77bcf86cd799439011
  
  npx ts-node src/scripts/linkUserToEmployee.ts user@example.com --create "John Doe" john@example.com "Engineering"
  `);
  process.exit(1);
}

const userEmail = args[0];

if (args[1] === '--create') {
  const employeeName = args[2];
  if (!employeeName) {
    console.error('❌ Employee name is required when using --create');
    process.exit(1);
  }
  const employeeEmail = args[3];
  const department = args[4];
  createEmployeeAndLink(userEmail, employeeName, employeeEmail, department);
} else {
  const employeeId = args[1];
  linkUserToEmployee(userEmail, employeeId);
}

