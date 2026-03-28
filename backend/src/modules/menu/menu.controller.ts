import { Controller, Post, Get, Body, UseGuards, Req, Param, HttpStatus, Res, Patch, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Response } from 'express';
import { sendResponse } from '../../common/utils/sendResponse';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from '../../common/services/storage.service';

@ApiTags('Menu')
@ApiBearerAuth()
@Controller('menu')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MenuController {
  constructor(
    private menuService: MenuService,
    private storageService: StorageService,
  ) {}

  @Post('upload')
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    const result = await this.storageService.uploadFile(file);
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
      },
    });
  }

  @Get('categories')
  @Roles(UserRole.OWNER, UserRole.STAFF)
  async getCategories(@Res() res: Response) {
    const categories = await this.menuService.getAllCategories();
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Categories fetched',
      data: categories,
    });
  }

  @Post('categories')
  @Roles(UserRole.OWNER)
  async createCategory(@Body('name') name: string, @Res() res: Response) {
    const category = await this.menuService.createCategory(name);
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: 'Category created',
      data: category,
    });
  }

  @Get('restaurant/:restaurantId')
  @Roles(UserRole.OWNER)
  async getRestaurantMenu(@Param('restaurantId') restaurantId: string, @Res() res: Response) {
    const items = await this.menuService.getMenuItemsByRestaurant(restaurantId);
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Restaurant menu items fetched',
      data: items,
    });
  }

  @Get('branch/:branchId')
  @Roles(UserRole.OWNER, UserRole.STAFF)
  async getBranchMenu(@Param('branchId') branchId: string, @Res() res: Response) {
    const items = await this.menuService.getBranchMenu(branchId);
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Branch menu items fetched',
      data: items,
    });
  }

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

  @Patch(':menuItemId')
  @Roles(UserRole.OWNER)
  async update(@Param('menuItemId') menuItemId: string, @Body() data: any, @Req() req: any, @Res() res: Response) {
    const menuItem = await this.menuService.updateMenuItem(req.user.sub, menuItemId, data);
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Menu item updated successfully',
      data: menuItem,
    });
  }

  @Delete(':menuItemId')
  @Roles(UserRole.OWNER)
  async delete(@Param('menuItemId') menuItemId: string, @Req() req: any, @Res() res: Response) {
    await this.menuService.deleteMenuItem(req.user.sub, menuItemId);
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Menu item deleted successfully',
      data: null,
    });
  }
}
