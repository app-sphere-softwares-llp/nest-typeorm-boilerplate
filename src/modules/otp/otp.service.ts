import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { AbstractService } from '@/shared/services/abstract.service';
import { OtpRepository } from '@/modules/otp/otp.repository';
import { OtpEntity } from '@/modules/otp/otp.entity';
import { EntityManager } from 'typeorm';
import { UtilsService } from '@/shared/utils/utils.service';
import { VerifyOtpDto } from '@/modules/otp/dto/VerifyOtp.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@/shared/services/config.service';

@Injectable()
export class OtpService extends AbstractService<OtpRepository, OtpEntity> {
  constructor(
    protected readonly otpRepository: OtpRepository,
    private readonly configService: ConfigService,
    // private readonly mailService: MailerService,
  ) {
    super(otpRepository);
  }

  /**
   * get latest otp
   * returns latest otp for an email id
   * @param {string} email
   * @return {Promise<OtpEntity[]>}
   */
  async getLatestOtpByEmail(email: string): Promise<OtpEntity> {
    return this.findOne({
      where: {
        email,
        isExpired: false,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * send otp
   * resends new otp
   * @param email
   * @return {Promise<OtpEntity>}
   */
  async sendOtp(email: string): Promise<OtpEntity> {
    return this.withTransaction(async (manager: EntityManager) => {
      return this.createOtp(email);
    });
  }

  /**
   * resend otp
   * resends new otp
   * @param email
   * @return {Promise<OtpEntity>}
   */
  async resendOtp(email: string): Promise<OtpEntity> {
    return this.withTransaction(async (manager: EntityManager) => {
      // expire all existing opts
      await this.expireExistingRequests(email);

      return this.createOtp(email);
    });
  }

  /**
   * expire existing otp
   * expires existing otp request for email id
   * @param email
   */
  async expireExistingRequests(email: string) {
    return this.updateMultiple({ email }, { isExpired: true });
  }

  /**
   * verify otp
   * verifies an otp by checking email
   * @param {VerifyOtpDto} dto
   * @returns {Promise<boolean>}
   */
  async verifyOtp(dto: VerifyOtpDto): Promise<OtpEntity> {
    const otpDetails = await this.findOne({ email: dto.email, otp: dto.otp, isExpired: false, isApproved: false });
    if (!otpDetails) {
      throw new BadRequestException('Invalid otp');
    }

    // update otp request and mark it as approved
    await this.updateById(otpDetails.id, { isApproved: true, isExpired: true });
    return otpDetails;
  }


  /**
   * create otp
   * creates new otp
   * @param email
   * @return {Promise<OtpEntity>}
   */
  private async createOtp(email: string): Promise<OtpEntity> {
    const otpModel = new OtpEntity();
    otpModel.email = email;
    otpModel.otp = UtilsService.generateRandomCode();

    const otpEntity = await this.createRecord(otpModel);
    if (!otpEntity) {
      throw new InternalServerErrorException();
    }

    // this.mailService.sendMail({
    //   to: email,
    //   subject: 'One time password',
    //   template: 'send-otp',
    //   context: {
    //     code: otpModel.otp,
    //   },
    // });

    return otpEntity;
  }
}
