import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { BranchesService } from '../src/modules/branches/branches.service';
import { AuthService } from '../src/modules/auth/auth.service';
import { UsersService } from '../src/modules/users/users.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { UserRole } from '@prisma/client';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const branchesService = app.get(BranchesService);
  const authService = app.get(AuthService);
  const usersService = app.get(UsersService);
  const prisma = app.get(PrismaService);

  try {
    console.log('--- Verifying Invitation & Mandatory Password Change Flow ---');

    // 1. Setup: Get a test owner and branch they actually own
    const owner = await prisma.user.findUnique({ where: { email: 'test-owner@unifood.com' } });
    if (!owner) throw new Error('Test owner not found. Run setup-test-data.ts first.');
    
    const branch = await prisma.branch.findFirst({
        where: { restaurant: { ownerId: owner.id } }
    });
    
    if (!branch) throw new Error('Test owner has no branch. Run setup-test-data.ts first.');

    const staffEmail = 'new-staff@um.edu.my';
    const tempPassword = 'tempPassword123';

    // Cleanup previous test user if exists
    const existingUser = await prisma.user.findUnique({ where: { email: staffEmail } });
    if (existingUser) {
        await prisma.staffBranch.deleteMany({ where: { staffId: existingUser.id } });
        await prisma.user.delete({ where: { id: existingUser.id } });
    }

    console.log('\n1. Owner invites a new staff member');
    const inviteResult = await branchesService.inviteStaffByEmail(owner.id, branch.id, {
      email: staffEmail,
      name: 'New Staff Member',
      role: UserRole.STAFF,
      temporaryPassword: tempPassword,
    });
    console.log(`Invite result: ${inviteResult.message}`);

    // 2. Staff logs in
    console.log('\n2. Staff member logs in with temporary password');
    const loginResult = await authService.login({ email: staffEmail, password: tempPassword });
    console.log(`Needs password change: ${loginResult.needsPasswordChange}`);
    
    if (loginResult.needsPasswordChange) {
        console.log('✅ Mandatory password change flag detected.');
    } else {
        console.log('❌ Failed to detect mandatory password change flag.');
    }

    // 3. Verify access restriction (in logic)
    console.log('\n3. Verifying password change logic');
    const newPassword = 'newSecurePassword123';
    const changeResult = await authService.changePassword(inviteResult.userId, { newPassword });
    console.log(`Password changed successfully. New token received: ${changeResult.access_token.substring(0, 10)}...`);

    // 4. Verify flag is cleared
    const updatedUser = await prisma.user.findUnique({ where: { id: inviteResult.userId } });
    console.log(`Flag after change: ${updatedUser?.needsPasswordChange}`);

    if (updatedUser?.needsPasswordChange === false) {
        console.log('✅ Password change flag cleared successfully.');
    } else {
        console.log('❌ Password change flag still set.');
    }

    // 5. Test List Staff
    console.log('\n5. Testing staff listing');
    const staffList = await branchesService.getBranchStaff(owner.id, branch.id);
    console.log(`Staff count in branch: ${staffList.length}`);
    const foundStaff = staffList.find(s => s.staffId === inviteResult.userId);
    if (foundStaff) {
        console.log('✅ Invited staff member found in branch list.');
    } else {
        console.log('❌ Invited staff member NOT found in branch list.');
    }

    // 6. Test Remove Staff
    console.log('\n6. Testing staff removal');
    await branchesService.removeStaffFromBranch(owner.id, branch.id, inviteResult.userId);
    const staffListAfter = await branchesService.getBranchStaff(owner.id, branch.id);
    const stillExists = staffListAfter.find(s => s.staffId === inviteResult.userId);
    if (!stillExists) {
        console.log('✅ Staff member removed successfully.');
    } else {
        console.log('❌ Staff member still exists after removal.');
    }

    console.log('\n--- Verification Complete ---');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
