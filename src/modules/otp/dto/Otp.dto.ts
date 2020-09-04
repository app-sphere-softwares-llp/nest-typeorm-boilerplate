import { OtpEntity } from '../otp.entity';
import { AbstractDto } from '@/shared/dto/AbstractDto';

export class OtpDto extends AbstractDto {
  constructor(otp: OtpEntity) {
    super(otp);
  }
}
