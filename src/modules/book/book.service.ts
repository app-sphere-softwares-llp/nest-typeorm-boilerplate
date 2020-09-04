import { Injectable } from '@nestjs/common';
import { AbstractService } from '@/shared/services/abstract.service';
import { BookEntity } from '@/modules/book/book.entity';
import { BookRepository } from '@/modules/book/book.repository';
import { EntityManager, FindOneOptions, UpdateResult } from 'typeorm';
import { UsersPageOptionsDto } from '@/modules/user/dto/UsersPageOptionsDto';
import { BooksPageDto } from '@/modules/book/dto/BooksPageDto';
import { BookCreateDto } from '@/modules/book/dto/BookCreateDto';
import { UserEntity } from '@/modules/user/user.entity';
import { UserService } from '@/modules/user/user.service';
import { UserNotFoundException } from '@/shared/exceptions/user-not-found.exception';
import { UtilsService } from '@/shared/utils/utils.service';

@Injectable()
export class BookService extends AbstractService<BookRepository, BookEntity> {
  constructor(
    protected readonly bookRepository: BookRepository, private userService: UserService,
  ) {
    super(bookRepository);
  }

  /**
   * finds book by id
   * @param id
   * @param options
   */
  async getBookById(id: number | string, options?: FindOneOptions<BookEntity>) {
    return this.findById(id, options);
  }

  /**
   * create new book
   * @param dto
   * @param loggedInUser
   */
  async createBook(
    dto: BookCreateDto, loggedInUser: UserEntity,
  ): Promise<BookEntity> {
    return this.withTransaction(async (manager: EntityManager) => {
      const author = await this.userService.findUserById(dto.authorId);

      if (!author) {
        throw new UserNotFoundException('author not found');
      }

      // create book object
      const book = new BookEntity();
      book.name = dto.name;
      book.createdBy = loggedInUser;
      book.author = author;

      // create record
      return await this.createRecord(book);
    });
  }

  /**
   * get all books
   * @param pageOptionsDto
   */
  async getBooks(pageOptionsDto: UsersPageOptionsDto): Promise<BooksPageDto> {
    const queryBuilder = this.bookRepository.createQueryBuilder('books');
    queryBuilder.where(UtilsService.likeQueryHelper('name', pageOptionsDto.query));
    const { items, pageMetaDto } = await this.getAllPaginated(queryBuilder, pageOptionsDto);

    return new BooksPageDto(items.toDtos(), pageMetaDto);
  }

  /**
   * update book by id
   * @param {string | number} id
   * @param {Partial<BookEntity>} book
   * @param loggedInUser
   * @returns {Promise<UpdateResult>}
   */
  updateBookById(id: string | number, book: Partial<BookEntity>, loggedInUser: UserEntity): Promise<UpdateResult> {
    return this.updateById(id, book);
  }

  /**
   * delete book
   * @param id
   */
  async deleteBook(id: number | string): Promise<string> {
    await this.deleteById(id);
    return 'Book Deleted Successfully';
  }

  /**
   * delete book
   * @param id
   */
  async restoreBook(id: number | string): Promise<string> {
    await this.restoreById(id);
    return 'Book Restored Successfully';
  }
}
