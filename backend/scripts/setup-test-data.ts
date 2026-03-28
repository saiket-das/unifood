import { PrismaClient, UserRole, PaymentMethod } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await argon2.hash('testpass123');

  console.log('--- Creating Test Users ---');
  
  // 1. Admin
  const admin = await prisma.user.upsert({
    where: { email: 'test-admin@um.edu.my' },
    update: {},
    create: {
      email: 'test-admin@um.edu.my',
      password: hashedPassword,
      name: 'Test Admin',
      role: UserRole.ADMIN,
    },
  });
  console.log('Admin created:', admin.email);

  // 2. Owner
  const owner = await prisma.user.upsert({
    where: { email: 'test-owner@unifood.com' },
    update: {},
    create: {
      email: 'test-owner@unifood.com',
      password: hashedPassword,
      name: 'Test Owner',
      role: UserRole.OWNER,
    },
  });
  console.log('Owner created:', owner.email);

  // 3. Student
  const student = await prisma.user.upsert({
    where: { email: 'test-student@um.edu.my' },
    update: { hostel: 'KK1' },
    create: {
      email: 'test-student@um.edu.my',
      password: hashedPassword,
      name: 'Test Student',
      role: UserRole.STUDENT,
      hostel: 'KK1',
    },
  });
  console.log('Student created:', student.email);

  // 4. Restaurant for Owner
  const restaurant = await prisma.restaurant.upsert({
    where: { ownerId: owner.id },
    update: {},
    create: {
      name: 'Test Restaurant',
      ownerId: owner.id,
    },
  });
  console.log('Restaurant created:', restaurant.name);

  // 5. "Test" Branch
  // We'll delete existing one if it exists to start fresh
  const existingBranch = await prisma.branch.findFirst({
    where: { name: 'Test Branch', restaurantId: restaurant.id }
  });
  
  if (existingBranch) {
    await prisma.branch.delete({ where: { id: existingBranch.id } });
  }

  const branch = await prisma.branch.create({
    data: {
      name: 'Test Branch',
      address: 'Test Address, UM',
      restaurantId: restaurant.id,
    },
  });
  console.log('Branch created:', branch.name);

  // Verify Default Payment Option (Cash)
  const defaultOptions = await prisma.branchPaymentOption.findMany({
    where: { branchId: branch.id }
  });
  console.log('Default payment options (should be empty as we created via direct prisma create):', defaultOptions.length);

  // Note: Since we bypass the service and use direct Prisma create, 
  // the 'Cash' default logic in BranchesService wasn't triggered.
  // This is actually a good test - we should verify if the service handles it.
  
  console.log('\n--- Setup Complete ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
