import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BranchPaymentOptionDto } from './branch-payment-option.dto';

export class CreateBranchDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ required: false })
  @IsOptional()
  latitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  longitude?: number;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  hostelTags?: string[];

  @ApiProperty({ type: [BranchPaymentOptionDto], required: false })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BranchPaymentOptionDto)
  paymentOptions?: BranchPaymentOptionDto[];
}
