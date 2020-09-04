import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuthUser } from '@/shared/decorators/auth-user.decorator';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { UserDto } from '../user/dto/UserDto';
import { UserEntity } from '../user/user.entity';
import { AuthService } from './auth.service';
import { LoginPayloadDto } from './dto/LoginPayloadDto';
import { UserLoginDto } from './dto/UserLoginDto';
import { OtpService } from '@/modules/otp/otp.service';
import { VerifyOtpDto } from '@/modules/otp/dto/VerifyOtp.dto';
import { UserService } from '@/modules/user/user.service';
import { UserLoginProvider } from '@/shared/enums/user-login-provider';
import { UserRoleType } from '@/shared/enums/user-role-type';
import { UserRegisterDto } from '@/modules/auth/dto/UserRegisterDto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly otpService: OtpService,
  ) {
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: LoginPayloadDto,
    description: 'User info with access token',
  })
  async userLogin(
    @Body() userLoginDto: UserLoginDto,
  ): Promise<LoginPayloadDto> {
    const userEntity = await this.authService.validateUser(userLoginDto);

    const token = await this.authService.createToken(userEntity);
    return new LoginPayloadDto(userEntity.toDto(), token);
  }

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserDto, description: 'Successfully Registered' })
  async userRegister(
    @Body() userRegisterDto: UserRegisterDto,
  ): Promise<UserDto> {
    const createdUser = await this.userService.createUser(
      userRegisterDto,
    );

    return createdUser.toDto();
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: Object,
    description: 'User Provider',
  })
  async verifyEmail(
    @Body() userLoginDto: UserLoginDto,
  ): Promise<{ provider: UserLoginProvider, role: UserRoleType }> {
    const userEntity = await this.authService.validateUserEmail(userLoginDto);

    // if otp is provider than send an otp
    if (userEntity.provider === UserLoginProvider.Otp) {
      await this.otpService.sendOtp(userLoginDto.email);
    }
    return { provider: userEntity.provider, role: userEntity.role };
  }

  @Post('verify-otp')
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
  ): Promise<LoginPayloadDto> {
    // verify otp
    const user = await this.authService.validateUserByOtp(verifyOtpDto);

    // create token
    const token = await this.authService.createToken(user);
    return new LoginPayloadDto(user.toDto(), token);
  }

  @Get('resend-otp')
  async resendOtp(
    @Query('email') email: string,
  ): Promise<{ message: string }> {
    await this.otpService.sendOtp(email);
    return { message: 'Otp Sent Successfully' };
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserDto, description: 'current user info' })
  async getCurrentUser(@AuthUser() user: UserEntity): Promise<UserDto> {
    return user.toDto();
  }
}
