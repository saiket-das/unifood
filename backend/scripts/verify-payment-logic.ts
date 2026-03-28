import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { BranchesService } from '../src/modules/branches/branches.service';
import { OrdersService } from '../src/modules/orders/orders.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { PaymentMethod } from '@prisma/client';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const branchesService = app.get(BranchesService);
  const ordersService = app.get(OrdersService);
  const prisma = app.get(PrismaService);

  try {
    console.log('--- Verifying Payment Configuration Logic ---');

    // 1. Find our test entities
    const owner = await prisma.user.findUnique({ where: { email: 'test-owner@unifood.com' } });
    const student = await prisma.user.findUnique({ where: { email: 'test-student@um.edu.my' } });
    const restaurant = await prisma.restaurant.findFirst({ where: { ownerId: owner.id } });

    if (!owner || !student || !restaurant) {
      throw new Error('Test entities not found. Run setup-test-data.ts first.');
    }

    console.log('Test entities found.');

    // 2. Create a fresh branch using the SERVICE to test default logic
    console.log('\n2. Testing Default Branch Creation (Cash should be enabled)');
    const branchName = `Test Branch ${Date.now()}`;
    const branch = await branchesService.createBranch(owner.id, restaurant.id, {
      name: branchName,
      address: 'Generated Address',
    });

    const cashOption = branch.paymentOptions.find(o => o.method === PaymentMethod.CASH);
    if (cashOption && cashOption.isEnabled) {
      console.log('✅ Cash is enabled by default.');
    } else {
      console.log('❌ Cash is NOT enabled by default.');
    }

    // 3. Test Order Placement with Cash (Should work)
    console.log('\n3. Testing Order Placement with Cash');
    try {
      await ordersService.createOrder(student.id, {
        branchId: branch.id,
        totalPrice: 10.00,
        paymentMethod: PaymentMethod.CASH,
        items: [] // Simplified for test
      });
      console.log('✅ Cash order placed successfully.');
    } catch (e) {
      console.log('❌ Cash order failed:', e.message);
    }

    // 4. Test Order Placement with QR (Should fail as it is disabled)
    console.log('\n4. Testing Order Placement with QR (Disabled)');
    try {
      await ordersService.createOrder(student.id, {
        branchId: branch.id,
        totalPrice: 10.00,
        paymentMethod: PaymentMethod.QR,
        items: []
      });
      console.log('❌ QR order placed successfully but should have failed.');
    } catch (e) {
      console.log('✅ QR order failed as expected:', e.message);
    }

    // 5. Enable QR and Update Account Transfer
    console.log('\n5. Enabling QR and Configuring Account Transfer');
    await branchesService.updateBranchPaymentOptions(owner.id, branch.id, [
      { method: PaymentMethod.QR, isEnabled: true, qrCodeImageUrl: 'https://example.com/qr.png' },
      { 
        method: PaymentMethod.ACCOUNT_TRANSFER, 
        isEnabled: true, 
        bankName: 'Test Bank', 
        accountNumber: '12345678', 
        accountHolderName: 'Test Owner' 
      }
    ]);
    console.log('Payment options updated.');

    // 6. Test QR again (Should now work)
    console.log('\n6. Testing Order Placement with QR (Enabled)');
    try {
      await ordersService.createOrder(student.id, {
        branchId: branch.id,
        totalPrice: 10.00,
        paymentMethod: PaymentMethod.QR,
        items: []
      });
      console.log('✅ QR order placed successfully.');
    } catch (e) {
      console.log('❌ QR order failed:', e.message);
    }

    // 7. Toggle CASH off and test (Should fail)
    console.log('\n7. Disabling Cash and Testing Order Placement');
    await branchesService.updateBranchPaymentOptions(owner.id, branch.id, [
      { method: PaymentMethod.CASH, isEnabled: false }
    ]);
    
    try {
      await ordersService.createOrder(student.id, {
        branchId: branch.id,
        totalPrice: 10.00,
        paymentMethod: PaymentMethod.CASH,
        items: []
      });
      console.log('❌ Cash order placed successfully but should have failed.');
    } catch (e) {
      console.log('✅ Cash order failed as expected:', e.message);
    }

    console.log('\n--- Verification Complete ---');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
