import { Controller, Post, Get, Body, UseGuards, Req, Param, HttpStatus, Res, Patch } from '@nestjs/common';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Response } from 'express';
import { sendResponse } from '../../common/utils/sendResponse';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Menu')
@ApiBearerAuth()
@Controller('menu')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MenuController {
  constructor(private menuService: MenuService) {}

  @Post(':restaurantId')
  @Roles(UserRole.OWNER)
  async create(@Param('restaurantId') restaurantId: string, @Body() data: any, @Req() req: any, @Res() res: Response) {
    const menuItem = await this.menuService.createMenuItem(req.user.sub, restaurantId, data);
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: 'Menu item created successfully',
      data: menuItem,
    });
  }

  @Patch(':branchId/:menuItemId/availability')
  @Roles(UserRole.OWNER, UserRole.STAFF)
  async toggleAvailability(
    @Param('branchId') branchId: string,
    @Param('menuItemId') menuItemId: string,
    @Body('isAvailable') isAvailable: boolean,
    @Req() req: any,
    @Res() res: Response
  ) {
    const item = await this.menuService.setBranchAvailability(req.user.sub, branchId, menuItemId, isAvailable);
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Availability updated',
      data: item,
    });
  }
}
