import { AbstractEntity } from '@/shared/entity/abstract.entity';
import { BookDto } from '@/modules/book/dto/BookDto';
import { Column, Entity, ManyToOne } from 'typeorm';
import { UserEntity } from '@/modules/user/user.entity';

@Entity({ name: 'books' })
export class BookEntity extends AbstractEntity<BookDto> {
  @Column()
  name: string;

  @ManyToOne(type => UserEntity, {
    eager: false,
  })
  createdBy: UserEntity;

  @ManyToOne(type => UserEntity, {
    eager: false,
  })
  modifiedBy: UserEntity;

  @ManyToOne(type => UserEntity, {
    eager: false,
  })
  author: UserEntity;

  dtoClass = BookDto;
}
