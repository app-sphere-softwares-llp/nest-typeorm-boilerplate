import { SetMetadata } from '@nestjs/common';

import { UserRoleType } from '../enums/user-role-type';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Roles = (...roles: UserRoleType[]) => SetMetadata('roles', roles);
