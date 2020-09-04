import { forwardRef, Module } from '@nestjs/common';
import { BookController } from './book.controller';
import { BookService } from './book.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookRepository } from '@/modules/book/book.repository';
import { UserModule } from '@/modules/user/user.module';

@Module({
  controllers: [BookController],
  providers: [BookService],
  imports: [
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([BookRepository])
  ],
})
export class BookModule {
}
