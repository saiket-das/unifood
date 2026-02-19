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
    console.log('--- Verifying Hybrid Favorites System ---');

    // 1. Get test student
    const student = await prisma.user.findUnique({ where: { email: 'test-student@um.edu.my' } });
    if (!student) throw new Error('Test student not found. Run setup-test-data.ts first.');

    // 2. Clear previous favorites and orders for clean test
    await prisma.favorite.deleteMany({ where: { userId: student.id } });
    await prisma.orderStatusEvent.deleteMany({ where: { order: { studentId: student.id } } });
    await prisma.paymentProof.deleteMany({ where: { order: { studentId: student.id } } });
    await prisma.orderItem.deleteMany({ where: { order: { studentId: student.id } } });
    await prisma.order.deleteMany({ where: { studentId: student.id } });

    // 3. Get some menu items
    const menuItems = await prisma.menuItem.findMany({ take: 2 });
    if (menuItems.length < 2) throw new Error('Not enough test data: need 2 menu items.');

    console.log('\n1. Testing MANUAL Favorite logic');
    // Toggle ON
    const addResult = await usersService.toggleFavorite(student.id, menuItems[0].id);
    console.log(`Add Item 1 result: favorited=${addResult.favorited}`);
    
    // Check favorites
    const favs = await usersService.getFavorites(student.id);
    console.log(`Favorites count: ${favs.length}`);
    if (favs.some(f => f.id === menuItems[0].id)) {
        console.log('✅ Manual favorite verified.');
    } else {
        console.log('❌ Manual favorite failed.');
    }

    // Toggle OFF
    const removeResult = await usersService.toggleFavorite(student.id, menuItems[0].id);
    console.log(`Remove Item 1 result: favorited=${removeResult.favorited}`);
    const favsAfter = await usersService.getFavorites(student.id);
    console.log(`Favorites count after removal: ${favsAfter.length}`);
    if (favsAfter.length === 0) {
        console.log('✅ Manual favorite removal verified.');
    } else {
        console.log('❌ Manual favorite removal failed.');
    }

    console.log('\n2. Testing BACKGROUND Recommendation logic (Re-verifying)');
    // Place orders for Item 1
    const branch = await prisma.branch.findFirst();
    if (!branch) throw new Error('No branch found.');

    await prisma.order.create({
        data: {
            orderNumber: `HYBRID-REC-${Date.now()}`,
            status: OrderStatus.COMPLETED,
            studentId: student.id,
            branchId: branch.id,
            totalPrice: 10.0,
            paymentMethod: 'CASH',
            items: {
                create: {
                    menuItemId: menuItems[1].id, // Item 1
                    unitPrice: 5.0,
                    quantity: 2,
                    subtotal: 10.0
                }
            }
        }
    });

    const recs = await usersService.getRecommendedItems(student.id);
    if (recs.some(r => r.id === menuItems[1].id)) {
        console.log(`✅ Background recommendation found: ${recs[0].name}`);
    } else {
        console.log('❌ Background recommendation failed.');
    }

    console.log('\n3. Final Check: Integration');
    // Add Item 1 to manual favorites too
    await usersService.toggleFavorite(student.id, menuItems[1].id);
    const finalProfile = await usersService.getProfile(student.id);
    console.log(`Profile Favorites: ${finalProfile.favorites.length}`);

    if (finalProfile.favorites.length === 1) {
        console.log('✅ Hybrid system integrated successfully.');
    } else {
        console.log('❌ Hybrid integration failed.');
    }

    console.log('\n--- Verification Complete ---');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
