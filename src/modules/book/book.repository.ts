import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { BookEntity } from '@/modules/book/book.entity';

@EntityRepository(BookEntity)
export class BookRepository extends  Repository<BookEntity> {
}
