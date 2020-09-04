import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteBookDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  bookId: string;
}
