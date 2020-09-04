import { AbstractDto } from '@/shared/dto/AbstractDto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserDto } from '@/modules/user/dto/UserDto';
import { BookEntity } from '@/modules/book/book.entity';

export class BookDto extends AbstractDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ type: () => UserDto })
  author: UserDto;

  @ApiPropertyOptional({ type: () => UserDto })
  createdBy: UserDto;

  @ApiPropertyOptional({ type: () => UserDto })
  modifiedBy: UserDto;

  constructor(params: BookEntity) {
    super(params);
    if (params) {
      this.name = params.name;

      if (params.author) {
        this.author = params.author.toDto();
      }

      if (params.createdBy) {
        this.createdBy = params.createdBy.toDto();
      }

      if (params.modifiedBy) {
        this.modifiedBy = params.modifiedBy.toDto();
      }
    }
  }
}
