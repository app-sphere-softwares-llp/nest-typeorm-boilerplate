import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { AbstractEntity } from '@/shared/entity/abstract.entity';
import { UserRoleType } from '@/shared/enums/user-role-type';
import { UserDto } from './dto/UserDto';
import { UserLoginProvider } from '@/shared/enums/user-login-provider';

@Entity({ name: 'users' })
export class UserEntity extends AbstractEntity<UserDto> {
  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: false })
  lastName: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  contactNo: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ type: 'enum', enum: UserLoginProvider, default: UserLoginProvider.Normal })
  provider: UserLoginProvider;

  @Column({ type: 'enum', enum: UserRoleType, default: UserRoleType.User })
  role: UserRoleType;

  @Column({ nullable: true })
  profileUrl: string;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin: Date;

  @ManyToOne(type => UserEntity)
  createdBy: UserEntity;

  @ManyToOne(type => UserEntity)
  modifiedBy: UserEntity;

  dtoClass = UserDto;
}
