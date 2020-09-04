'use strict';

import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { UsersPageDto } from './dto/UsersPageDto';
import { UsersPageOptionsDto } from './dto/UsersPageOptionsDto';
import { UserService } from './user.service';
import { UserDto } from '@/modules/user/dto/UserDto';
import { UserCreateDto } from '@/modules/user/dto/UserCreateDto';

@Controller('users')
@ApiTags('users')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(
    private _userService: UserService,
    private readonly _i18n: I18nService,
  ) {
  }

  @Get('users')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get users list',
    type: UsersPageDto,
  })
  getUsers(
    @Query(new ValidationPipe({ transform: true }))
      pageOptionsDto: UsersPageOptionsDto,
  ): Promise<UsersPageDto> {
    return this._userService.getUsers(pageOptionsDto);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Create User',
    type: UserDto,
  })
  async createUser(@Body() dto: UserCreateDto): Promise<UserDto> {
    const user = await this._userService.createUser(dto);
    return user.toDto();
  }
}
