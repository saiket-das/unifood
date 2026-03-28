import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/modules/users/users.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const prisma = app.get(PrismaService);

  try {
    console.log('--- Verifying Background Recommendation Logic ---');

    // 1. Get test student
    const student = await prisma.user.findUnique({ where: { email: 'test-student@um.edu.my' } });
    if (!student) throw new Error('Test student not found. Run setup-test-data.ts first.');

    // 2. Clear previous orders for clean test
    await prisma.orderStatusEvent.deleteMany({ where: { order: { studentId: student.id } } });
    await prisma.paymentProof.deleteMany({ where: { order: { studentId: student.id } } });
    await prisma.orderItem.deleteMany({ where: { order: { studentId: student.id } } });
    await prisma.order.deleteMany({ where: { studentId: student.id } });

    console.log('\n1. Testing recommendations with NO history (Should return global trends or empty)');
    const initialRecs = await usersService.getRecommendedItems(student.id);
    console.log(`Recommendations found: ${initialRecs.length}`);

    // 3. Create a branch and some menu items if they don't exist
    const branch = await prisma.branch.findFirst();
    const menuItems = await prisma.menuItem.findMany({ take: 3 });
    
    if (!branch || menuItems.length < 2) {
      throw new Error('Not enough test data: need at least 1 branch and 2 menu items.');
    }

    // 4. Place some orders for specific items
    console.log('\n2. Placing orders to "teach" the background system...');
    
    // Order Item 0 twice
    for (let i = 0; i < 2; i++) {
        await prisma.order.create({
            data: {
                orderNumber: `TEST-REC-${Date.now()}-${i}`,
                status: OrderStatus.COMPLETED,
                studentId: student.id,
                branchId: branch.id,
                totalPrice: 10.0,
                paymentMethod: 'CASH',
                items: {
                    create: {
                        menuItemId: menuItems[0].id,
                        unitPrice: 5.0,
                        quantity: 1,
                        subtotal: 5.0
                    }
                }
            }
        });
    }

    // Order Item 1 once
    await prisma.order.create({
        data: {
            orderNumber: `TEST-REC-SINGLE-${Date.now()}`,
            status: OrderStatus.COMPLETED,
            studentId: student.id,
            branchId: branch.id,
            totalPrice: 10.0,
            paymentMethod: 'CASH',
            items: {
                create: {
                    menuItemId: menuItems[1].id,
                    unitPrice: 5.0,
                    quantity: 1,
                    subtotal: 5.0
                }
            }
        }
    });

    console.log('Orders created.');

    // 5. Check recommendations again
    console.log('\n3. Verifying recommendations AFTER history');
    const finalRecs = await usersService.getRecommendedItems(student.id);
    
    if (finalRecs.length > 0) {
        console.log('✅ Background recommendations retrieved.');
        console.log('Top recommendation:', finalRecs[0].name);
        
        if (finalRecs[0].id === menuItems[0].id) {
            console.log('✅ Logic correct: Item ordered 2x is ranked higher than item ordered 1x.');
        } else {
            console.log('❌ Logic error: Ranking is incorrect.');
        }
    } else {
        console.log('❌ No recommendations found after ordering.');
    }

    console.log('\n--- Verification Complete ---');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
