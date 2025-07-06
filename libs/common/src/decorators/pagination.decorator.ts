import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { DEFAULT_PAGINATION } from '../constants';

export interface PaginationParams {
  page: number;
  limit: number;
}

export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PaginationParams => {
    const request = ctx.switchToHttp().getRequest();
    const query = request.query;

    const page = parseInt(query.page, 10);
    const limit = parseInt(query.limit, 10);

    return {
      page: isNaN(page) ? DEFAULT_PAGINATION.page : page,
      limit: isNaN(limit) ? DEFAULT_PAGINATION.limit : limit,
    };
  },
);
