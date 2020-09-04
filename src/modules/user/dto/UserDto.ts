'use strict';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { UserRoleType } from '@/shared/enums/user-role-type';
import { AbstractDto } from '@/shared/dto/AbstractDto';
import { UserEntity } from '../user.entity';
import { UserLoginProvider } from '@/shared/enums/user-login-provider';

export class UserDto extends AbstractDto {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiPropertyOptional()
  contactNo: string;

  @ApiProperty({ enum: UserRoleType })
  role: UserRoleType;

  @ApiProperty({ enum: UserLoginProvider })
  provider: UserLoginProvider;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  profileUrl: string;

  @ApiProperty()
  receivePushNotification: boolean;

  @ApiPropertyOptional()
  lastLogin: Date;

  @ApiProperty()
  receiveTextMessageNotification: boolean;

  @ApiProperty()
  isAdmin: boolean;

  @ApiPropertyOptional()
  meta: any;

  @ApiPropertyOptional({ type: () => UserDto })
  createdBy: UserDto;

  @ApiPropertyOptional({ type: () => UserDto })
  modifiedBy: UserDto;

  constructor(user: UserEntity) {
    super(user);
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.role = user.role;
    this.provider = user.provider;
    this.email = user.email;
    this.contactNo = user.contactNo;
    this.lastLogin = user.lastLogin;
    this.profileUrl = user.profileUrl;

    if (user.createdBy) {
      this.createdBy = user.createdBy.toDto();
    }

    if (user.modifiedBy) {
      this.createdBy = user.modifiedBy.toDto();
    }
  }
}
