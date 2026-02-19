import { Controller, Post, Get, Patch, Body, UseGuards, Req, Param, HttpStatus, Res, Put } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Response } from 'express';
import { sendResponse } from '../../common/utils/sendResponse';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CreateBranchDto } from './dto/create-branch.dto';
import { BranchPaymentOptionDto } from './dto/branch-payment-option.dto';
import { InviteUserDto } from '../auth/dto/invite-user.dto';

@ApiTags('Branches')
@ApiBearerAuth()
@Controller('branches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BranchesController {
  constructor(private branchesService: BranchesService) {}

  @Post('restaurant/:restaurantId')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Create a new branch with optional payment setup' })
  async createBranch(
    @Param('restaurantId') restaurantId: string,
    @Body() data: CreateBranchDto,
    @Req() req: any,
    @Res() res: Response
  ) {
    const branch = await this.branchesService.createBranch(req.user.sub, restaurantId, data);
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: 'Branch created successfully',
      data: branch,
    });
  }

  @Put(':branchId/payment-options')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Update or toggle payment options for a branch' })
  async updatePaymentOptions(
    @Param('branchId') branchId: string,
    @Body() options: BranchPaymentOptionDto[],
    @Req() req: any,
    @Res() res: Response
  ) {
    const branch = await this.branchesService.updateBranchPaymentOptions(req.user.sub, branchId, options);
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Payment options updated successfully',
      data: branch,
    });
  }

  @Get(':branchId')
  async getBranch(@Param('branchId') branchId: string, @Res() res: Response) {
    const branch = await this.branchesService.getBranchById(branchId);
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Branch retrieved successfully',
      data: branch,
    });
  }
  @Post(':branchId/staff/invite')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Invite a new staff member or owner to a branch' })
  async inviteStaff(
    @Param('branchId') branchId: string,
    @Body() dto: InviteUserDto,
    @Req() req: any,
    @Res() res: Response
  ) {
    const result = await this.branchesService.inviteStaffByEmail(req.user.sub, branchId, dto);
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: result.message,
      data: result,
    });
  }

  @Get(':branchId/staff')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Get all staff members assigned to a branch' })
  async getStaff(
    @Param('branchId') branchId: string,
    @Req() req: any,
    @Res() res: Response
  ) {
    const staff = await this.branchesService.getBranchStaff(req.user.sub, branchId);
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Staff retrieved successfully',
      data: staff,
    });
  }

  @Post(':branchId/staff/:staffId/remove')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Remove a staff member from a branch' })
  async removeStaff(
    @Param('branchId') branchId: string,
    @Param('staffId') staffId: string,
    @Req() req: any,
    @Res() res: Response
  ) {
    await this.branchesService.removeStaffFromBranch(req.user.sub, branchId, staffId);
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Staff removed from branch successfully',
      data: {},
    });
  }
}
