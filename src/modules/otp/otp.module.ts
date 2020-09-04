import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpRepository } from '@/modules/otp/otp.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([OtpRepository]),
  ],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {
}
