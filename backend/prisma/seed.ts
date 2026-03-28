import { PrismaClient, UserRole, PricingModel, PaymentMethod } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await argon2.hash('password123');

  // 1. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@um.edu.my' },
    update: {},
    create: {
      email: 'admin@um.edu.my',
      password: hashedPassword,
      name: 'UM Admin',
      role: UserRole.ADMIN,
    },
  });

  // 2. Create Owner
  const owner = await prisma.user.upsert({
    where: { email: 'owner@unifood.com' },
    update: {},
    create: {
      email: 'owner@unifood.com',
      password: hashedPassword,
      name: 'John Owner',
      role: UserRole.OWNER,
    },
  });

  const restaurant = await prisma.restaurant.upsert({
    where: { ownerId: owner.id },
    update: {},
    create: {
      name: 'UM Central Kitchen',
      ownerId: owner.id,
    },
  });

  // 3. Create Categories
  const MASTER_CATEGORIES = [
    'Rice',
    'Noodles',
    'Drinks',
    'Desserts',
    'Western',
    'Fast Food',
    'Healthy/Salads',
    'Snacks/Small Bites',
    'Breakfast',
    'Buffet/Nasi Campur',
    'Bakery/Pastries',
    'Mamak/Indian Muslim',
    'Chinese',
    'Malay',
    'Japanese',
    'Thai',
    'Korean',
    'Coffee/Tea',
    'Juices/Smoothies',
    'Halal Western',
    'Vegetarian/Vegan',
    'Seafood',
    'Grills/Roasts',
    'Satay/Skewers',
    'Soup/Stew',
    'Pizza',
    'Burgers',
    'Sushi',
    'Pasta',
    'Mexican',
    'Middle Eastern',
    'Indian',
  ];

  // Create all master categories
  for (const name of MASTER_CATEGORIES) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Fetch created categories for relations
  const catRice = await prisma.category.findUnique({ where: { name: 'Rice' } });
  const catDrinks = await prisma.category.findUnique({ where: { name: 'Drinks' } });
  const catBuffet = await prisma.category.findUnique({ where: { name: 'Buffet/Nasi Campur' } });

  if (!catRice || !catDrinks || !catBuffet) {
    const existing = await prisma.category.findMany();
    console.log('Existing categories:', existing.map(c => c.name));
    throw new Error('Required seed categories missing');
  }

  // 4. Create Menu Items
  const nasiLemak = await prisma.menuItem.create({
    data: {
      name: 'Nasi Lemak Ayam',
      description: 'Classic Malaysian breakfast',
      price: 7.50,
      pricingModel: PricingModel.FIXED,
      restaurantId: restaurant.id,
      categories: {
        connect: [{ id: catRice.id }]
      },
    },
  });

  const tehTarik = await prisma.menuItem.create({
    data: {
      name: 'Teh Tarik',
      price: 2.50,
      pricingModel: PricingModel.FIXED,
      restaurantId: restaurant.id,
      categories: {
        connect: [{ id: catDrinks.id }]
      },
    },
  });

  const mixedRice = await prisma.menuItem.create({
    data: {
      name: 'Nasi Campur (Measured)',
      description: 'Choose your side dishes',
      pricingModel: PricingModel.MEASURED,
      unitPrice: 5.00,
      unitType: 'g',
      unitSize: 100,
      restaurantId: restaurant.id,
      categories: {
        connect: [{ id: catBuffet.id }]
      },
    },
  });

  // 5. Create Branches
  const branchKK1 = await prisma.branch.create({
    data: {
      name: 'KK1 Cafeteria',
      address: 'Kolej Kediaman 1, UM',
      hostelTags: ['KK1', 'KK2'],
      restaurantId: restaurant.id,
    },
  });

  const branchKK8 = await prisma.branch.create({
    data: {
      name: 'KK8 Cafeteria',
      address: 'Kolej Kediaman 8, UM',
      hostelTags: ['KK8', 'KK9'],
      restaurantId: restaurant.id,
    },
  });

  // 6. Assign Menu Items to Branches
  await prisma.branchMenuItem.createMany({
    data: [
      { branchId: branchKK1.id, menuItemId: nasiLemak.id },
      { branchId: branchKK1.id, menuItemId: tehTarik.id },
      { branchId: branchKK1.id, menuItemId: mixedRice.id },
      { branchId: branchKK8.id, menuItemId: nasiLemak.id },
      { branchId: branchKK8.id, menuItemId: tehTarik.id },
    ].map(item => {
      if(item.menuItemId === undefined) return null; // fix for tehTarik typo if I missed it
      return item;
    }).filter(Boolean) as any
  });
  
  // Create tehTarik separately due to typo check
  await prisma.branchMenuItem.upsert({
    where: { branchId_menuItemId: { branchId: branchKK8.id, menuItemId: tehTarik.id } },
    update: {},
    create: { branchId: branchKK8.id, menuItemId: tehTarik.id }
  });

  // 7. Create Staff
  const staff1 = await prisma.user.upsert({
    where: { email: 'staff1@unifood.com' },
    update: {},
    create: {
      email: 'staff1@unifood.com',
      password: hashedPassword,
      name: 'Staff One',
      role: UserRole.STAFF,
    },
  });

  await prisma.staffBranch.upsert({
    where: { staffId: staff1.id },
    update: { branchId: branchKK1.id },
    create: {
      staffId: staff1.id,
      branchId: branchKK1.id,
    },
  });

  // 8. Create Student
  const student = await prisma.user.upsert({
    where: { email: 'student@um.edu.my' },
    update: { hostel: 'KK1' },
    create: {
      email: 'student@um.edu.my',
      password: hashedPassword,
      name: 'Ali Student',
      role: UserRole.STUDENT,
      hostel: 'KK1',
    },
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
