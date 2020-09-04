import { ApiProperty } from '@nestjs/swagger';

import { PageMetaDto } from '@/shared/dto/PageMetaDto';
import { UserDto } from './UserDto';

export class UsersPageDto {
  @ApiProperty({
    type: UserDto,
    isArray: true,
  })
  data: UserDto[];

  @ApiProperty()
  meta: PageMetaDto;

  constructor(data: UserDto[], meta: PageMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
