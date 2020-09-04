import { Body, Controller, Get, HttpCode, HttpStatus, NotFoundException, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BookDto } from '@/modules/book/dto/BookDto';
import { BookService } from '@/modules/book/book.service';
import { BookCreateDto } from '@/modules/book/dto/BookCreateDto';
import { BooksPageDto } from '@/modules/book/dto/BooksPageDto';
import { BooksPageOptionsDto } from '@/modules/book/dto/BooksPageOptionsDto';
import { DeleteBookDto } from '@/modules/book/dto/DeleteBookDto';
import { GetBookDto } from '@/modules/book/dto/GetBookDto';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { AuthUser } from '@/shared/decorators/auth-user.decorator';
import { UserDto } from '@/modules/user/dto/UserDto';
import { UserEntity } from '@/modules/user/user.entity';

@Controller('book')
@ApiTags('books')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class BookController {

  constructor(private bookService: BookService) {
  }

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: BookDto,
    description: 'Book created successfully',
  })
  async createBook(@Body() dto: BookCreateDto, @AuthUser() user: UserEntity): Promise<BookDto> {
    // create book
    const book = await this.bookService.createBook(dto, user);
    return book.toDto();
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get Book Details',
    type: BookDto,
  })
  async getBook(@Query() dto: GetBookDto) {
    const book = await this.bookService.getBookById(dto.bookId, { relations: ['author'] });
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return book.toDto();
  }

  @Post('get-all')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get All books items',
    type: BooksPageDto,
  })
  async getBooks(@Body() dto: BooksPageOptionsDto): Promise<BooksPageDto> {
    return await this.bookService.getBooks(dto);
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  async deleteBook(@Body() dto: DeleteBookDto) {
    return await this.bookService.deleteBook(dto.bookId);
  }
}
