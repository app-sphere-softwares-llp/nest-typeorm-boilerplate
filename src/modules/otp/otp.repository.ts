import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { OtpEntity } from '@/modules/otp/otp.entity';

@EntityRepository(OtpEntity)
export class OtpRepository extends Repository<OtpEntity> {}
