import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * get authorized user details
 * @type {(...dataOrPipes: unknown[]) => ParameterDecorator}
 */
export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
