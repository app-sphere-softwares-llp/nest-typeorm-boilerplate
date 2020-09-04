import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UtilsService } from '@/shared/utils/utils.service';
import { ConfigService } from '@/shared/services/config.service';
import { UserDto } from '../user/dto/UserDto';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { TokenPayloadDto } from './dto/TokenPayloadDto';
import { UserLoginDto } from './dto/UserLoginDto';
import { VerifyOtpDto } from '@/modules/otp/dto/VerifyOtp.dto';
import { AbstractService } from '@/shared/services/abstract.service';
import { OtpService } from '@/modules/otp/otp.service';
import { UserNotFoundException } from '@/shared/exceptions/user-not-found.exception';

@Injectable()
export class AuthService extends AbstractService<null, null> {

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly otpService: OtpService,
  ) {
    super(null);
  }

  /**
   * create jwt token
   * creates new jwt token using user's id and user's client id
   * @param {UserEntity | UserDto} user
   * @returns {Promise<TokenPayloadDto>}
   */
  async createToken(user: UserEntity | UserDto): Promise<TokenPayloadDto> {
    return new TokenPayloadDto({
      expiresIn: this.configService.getNumber('JWT_EXPIRATION_TIME'),
      accessToken: await this.jwtService.signAsync({ id: user.id }),
    });
  }

  /**
   * validate user by email and password
   * @param userLoginDto
   */
  async validateUser(userLoginDto: UserLoginDto): Promise<UserEntity> {
    await this.withTransaction(async () => {
      const user = await this.userService.findOne({
        email: userLoginDto.email,
      });
      const isPasswordValid = await UtilsService.validateHash(
        userLoginDto.password,
        user && user.password,
      );
      if (!user || !isPasswordValid) {
        throw new UserNotFoundException();
      }
      return user;
    });

    // get updated user
    return await this.userService.findByUsernameOrEmail({
      email: userLoginDto.email,
    });
  }


  /**
   * validates user email
   * @param {UserLoginDto} userLoginDto
   * @returns {Promise<UserEntity>}
   */
  async validateUserEmail(userLoginDto: UserLoginDto): Promise<UserEntity> {
    const user = await this.userService.findByUsernameOrEmail({
      email: userLoginDto.email,
    });
    if (!user) {
      throw new BadRequestException('This email is not registered with us');
    }

    return user;
  }

  /**
   * validate user by otp
   * first checks is valid otp
   * than check user already have account than use that account to create token
   * if user don't have an account than creates a new account
   * @param dto
   */
  async validateUserByOtp(dto: VerifyOtpDto): Promise<UserEntity> {
    await this.withTransaction(async () => {
      // verify otp
      await this.otpService.verifyOtp(dto);

      // expire all other pending otp
      await this.otpService.expireExistingRequests(dto.email);

      // get user by email
      const user = await this.userService.findByUsernameOrEmail({
        email: dto.email,
      });

      if (!user) {
        throw new UserNotFoundException();
      }

      // update users last login
      await this.userService.updateUserById(user.id, { lastLogin: UtilsService.generateUtcDate() });
    });

    // get updated user
    return await this.userService.findByUsernameOrEmail({
      email: dto.email,
    });
  }
}
