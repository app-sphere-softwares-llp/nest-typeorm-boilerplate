import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class VerifyOtpDto {
  @IsNotEmpty()
  @Transform(val => parseInt(val))
  @IsNumber()
  otp: number;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}
