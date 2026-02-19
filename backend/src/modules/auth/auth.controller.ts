import { Controller, Post, Body, Res, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Response } from 'express';
import { sendResponse } from '../../common/utils/sendResponse';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
    const tokens = await this.authService.register(dto);
    
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: 'User registered successfully',
      data: tokens,
    });
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const tokens = await this.authService.login(dto);
    
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Logged in successfully',
      data: tokens,
    });
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() req: any,
    @Body() dto: ChangePasswordDto,
    @Res() res: Response
  ) {
    const result = await this.authService.changePassword(req.user.sub, dto);
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: result.message,
      data: result,
    });
  }
}
