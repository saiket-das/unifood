import { IsEmail, IsNotEmpty, IsEnum, IsString, IsOptional } from 'class-validator';
import { UserRole } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class InviteUserDto {
  @ApiProperty({ example: 'staff@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Staff Name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: UserRole, example: UserRole.STAFF })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @ApiProperty({ example: 'temp123', description: 'Temporary password for the new user' })
  @IsString()
  @IsNotEmpty()
  temporaryPassword: string;

  @ApiProperty({ required: false, description: 'Optional ID (used if role is OWNER to link to a restaurant, etc.)' })
  @IsString()
  @IsOptional()
  targetId?: string; 
}
