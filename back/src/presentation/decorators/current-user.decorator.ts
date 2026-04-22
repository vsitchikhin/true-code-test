/* eslint-disable */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest() as { user?: Record<string, unknown> };
    const user = request.user;

    if (!user) {
      return null;
    }

    return data ? (user[data] as unknown) : user;
  },
);
