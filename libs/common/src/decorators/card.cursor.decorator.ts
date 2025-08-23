import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

export interface TCardCursor {
  id: string;
  fieldValue: string | number | Date;
}

export const CardCursor = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): TCardCursor | null => {
    const request = ctx.switchToHttp().getRequest();
    const rawCursor = request.query.cursor;

    if (!rawCursor) return null;

    try {
      const parsed = JSON.parse(rawCursor);

      if (
        typeof parsed !== 'object' ||
        !parsed.id ||
        parsed.fieldValue === undefined
      ) {
        throw new Error();
      }

      const value = parsed.fieldValue;
      const fieldValue =
        typeof value === 'string' && !isNaN(Date.parse(value))
          ? new Date(value)
          : value;

      return {
        id: parsed.id,
        fieldValue,
      };
    } catch (e) {
      throw new BadRequestException('Invalid cursor format');
    }
  },
);
