import { Controller, Get, Query, Param, UseGuards, Req, HttpStatus, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response } from 'express';
import { sendResponse } from '../../common/utils/sendResponse';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any, @Res() res: Response) {
    const profile = await this.usersService.getProfile(req.user.sub);
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Profile retrieved successfully',
      data: profile,
    });
  }

  @Get('search/branches')
  async search(
    @Query('q') q: string,
    @Query('categoryId') categoryId: string,
    @Query('hostel') hostel: string,
    @Res() res: Response
  ) {
    const branches = await this.usersService.searchBranches(q, categoryId, hostel);
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Search results',
      data: branches,
    });
  }

  @Get('branches/:id')
  async getBranchDetails(@Param('id') id: string, @Res() res: Response) {
    const details = await this.usersService.getBranchDetails(id);
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Branch details retrieved',
      data: details,
    });
  }

  @Get('recommendations')
  @UseGuards(JwtAuthGuard)
  async getRecommendations(@Req() req: any, @Res() res: Response) {
    const items = await this.usersService.getRecommendedItems(req.user.sub);
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Recommendations retrieved successfully',
      data: items,
    });
  }

  @Get('favorites')
  @UseGuards(JwtAuthGuard)
  async getFavorites(@Req() req: any, @Res() res: Response) {
    const favorites = await this.usersService.getFavorites(req.user.sub);
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Favorites retrieved successfully',
      data: favorites,
    });
  }

  @Get('favorites/toggle/:menuItemId')
  @UseGuards(JwtAuthGuard)
  async toggleFavorite(
    @Param('menuItemId') menuItemId: string,
    @Req() req: any,
    @Res() res: Response
  ) {
    const result = await this.usersService.toggleFavorite(req.user.sub, menuItemId);
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: result.favorited ? 'Added to favorites' : 'Removed from favorites',
      data: result,
    });
  }
}
