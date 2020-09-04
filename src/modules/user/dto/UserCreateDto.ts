'use strict';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRoleType } from '@/shared/enums/user-role-type';

export class UserCreateDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  lastName: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  contactNo?: string;

  @ApiProperty({ enum: UserRoleType, enumName: 'RoleType' })
  @IsIn(Object.values(UserRoleType))
  role?: UserRoleType;
}
