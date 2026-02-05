import { Controller, Post, Get, Patch, Body, UseGuards, Req, Param, HttpStatus, Res } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, OrderStatus } from '@prisma/client';
import { Response } from 'express';
import { sendResponse } from '../../common/utils/sendResponse';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @Roles(UserRole.STUDENT)
  async placeOrder(@Body() data: any, @Req() req: any, @Res() res: Response) {
    const order = await this.ordersService.createOrder(req.user.sub, data);
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: 'Order placed successfully',
      data: order,
    });
  }

  @Patch(':orderId/status')
  @Roles(UserRole.STAFF, UserRole.OWNER)
  async updateStatus(
    @Param('orderId') orderId: string,
    @Body('status') status: OrderStatus,
    @Body('note') note: string,
    @Req() req: any,
    @Res() res: Response
  ) {
    const order = await this.ordersService.updateStatus(req.user.sub, orderId, status, note);
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: `Order status updated to ${status}`,
      data: order,
    });
  }

  @Patch('items/:orderItemId/finalize')
  @Roles(UserRole.STAFF)
  async finalizeItem(
    @Param('orderItemId') orderItemId: string,
    @Body('finalQuantity') finalQuantity: number,
    @Req() req: any,
    @Res() res: Response
  ) {
    const item = await this.ordersService.finalizeMeasuredItem(req.user.sub, orderItemId, finalQuantity);
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Item finalized',
      data: item,
    });
  }

  @Get('branch/:branchId')
  @Roles(UserRole.STAFF, UserRole.OWNER)
  async getOrdersByBranch(
    @Param('branchId') branchId: string,
    @Req() req: any,
    @Res() res: Response
  ) {
    const orders = await this.ordersService.getOrdersByBranch(
      req.user.sub,
      req.user.role,
      branchId
    );
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Orders retrieved successfully',
      data: orders,
    });
  }
}
