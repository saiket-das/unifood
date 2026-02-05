import { Controller, Post, Get, Put, Body, UseGuards, Req, Param, HttpStatus, Res } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Response } from 'express';
import { sendResponse } from '../../common/utils/sendResponse';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Restaurants')
@ApiBearerAuth()
@Controller('restaurants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RestaurantsController {
  constructor(private restaurantsService: RestaurantsService) {}

  @Post()
  @Roles(UserRole.OWNER)
  async create(@Body('name') name: string, @Req() req: any, @Res() res: Response) {
    const restaurant = await this.restaurantsService.createRestaurant(req.user.sub, name);
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: 'Restaurant created successfully',
      data: restaurant,
    });
  }

  @Get('my')
  @Roles(UserRole.OWNER)
  async getMy(@Req() req: any, @Res() res: Response) {
    const restaurant = await this.restaurantsService.getMyRestaurant(req.user.sub);
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Restaurant retrieved successfully',
      data: restaurant,
    });
  }
}
