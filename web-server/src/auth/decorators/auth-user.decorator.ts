import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from 'src/users/entities/user.entity';

export const AuthUser = createParamDecorator(
  (data: UserEntity, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // Assuming user information is stored in the request by JwtStrategy
  },
);