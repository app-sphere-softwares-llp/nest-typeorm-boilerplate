import { ApiProperty } from '@nestjs/swagger';

import { PageMetaDto } from '@/shared/dto/PageMetaDto';
import { BookDto } from './BookDto';

export class BooksPageDto {
  @ApiProperty({
    type: BookDto,
    isArray: true,
  })
  data: BookDto[];

  @ApiProperty()
  meta: PageMetaDto;

  constructor(data: BookDto[], meta: PageMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
