import { Injectable } from '@nestjs/common';
import { EntityManager, FindConditions, FindOneOptions, UpdateResult } from 'typeorm';
import { UsersPageDto } from './dto/UsersPageDto';
import { UsersPageOptionsDto } from './dto/UsersPageOptionsDto';
import { UserEntity } from './user.entity';
import { UserRepository } from './user.repository';
import { AbstractService } from '@/shared/services/abstract.service';
import { UserCreateDto } from '@/modules/user/dto/UserCreateDto';

@Injectable()
export class UserService extends AbstractService<UserRepository, UserEntity> {
  constructor(
    protected readonly userRepository: UserRepository,
  ) {
    super(userRepository);
  }

  async findByUsernameOrEmail(
    options: Partial<{ username: string; email: string }>,
  ): Promise<UserEntity | undefined> {

    const query: FindConditions<UserEntity> = {};

    const queryBuilder = this.createQueryBuilder('user');

    if (options.email) {
      queryBuilder.orWhere('user.email = :email', {
        email: options.email,
      });
    }
    if (options.username) {
      queryBuilder.orWhere('user.username = :username', {
        username: options.username,
      });
    }

    return queryBuilder.getOne();
  }

  async findUserById(id: number | string, options?: FindOneOptions<UserEntity>) {
    return this.findById(id, options );
  }

  async createUser(
    userCreateDto: UserCreateDto,
  ): Promise<UserEntity> {
    return this.withTransaction(async (manager: EntityManager) => {
      // create user object
      const user = { ...new UserEntity(), ...userCreateDto };

      // create record
      return await this.createRecord(user);
    });
  }

  async getUsers(pageOptionsDto: UsersPageOptionsDto): Promise<UsersPageDto> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    const { items, pageMetaDto } = await this.getAllPaginated(queryBuilder, pageOptionsDto);

    return new UsersPageDto(items.toDtos(), pageMetaDto);
  }

  /**
   * update user by id
   * @param {string | number} id
   * @param {Partial<UserEntity>} user
   * @returns {Promise<UpdateResult>}
   */
  updateUserById(id: string | number, user: Partial<UserEntity>): Promise<UpdateResult> {
    return this.updateById(id, user);
  }
}
