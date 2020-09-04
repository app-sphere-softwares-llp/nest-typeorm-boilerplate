import { AbstractEntity } from '@/shared/entity/abstract.entity';
import { OtpDto } from '@/modules/otp/dto/Otp.dto';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'otp-requests' })
export class OtpEntity extends AbstractEntity<OtpDto> {
  @Column({ unique: false, nullable: false })
  email: string;

  @Column({ nullable: false })
  otp: number;

  @Column({ default: false })
  isApproved: boolean;

  @Column({ default: false })
  isExpired: boolean;

  dtoClass = OtpDto;
}
