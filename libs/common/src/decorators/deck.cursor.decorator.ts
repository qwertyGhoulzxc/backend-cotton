// src/common/decorators/cursor.decorator.ts
import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { parseCursorValue } from '../utils/parse-deck-cursor-value.util';

export interface TDeckCursor {
  id: string;
  fieldValue: string | number | Date;
}

export const DeckCursor = createParamDecorator(
  (sortByKey: string, ctx: ExecutionContext): TDeckCursor | null => {
    const request = ctx.switchToHttp().getRequest();
    const rawCursor = request.query.cursor;
    const sortBy = request.query[sortByKey];

    if (!rawCursor) return null;

    try {
      const parsed = JSON.parse(rawCursor);
      return {
        id: parsed.id,
        fieldValue: parseCursorValue(sortBy, parsed.fieldValue),
      };
    } catch (e) {
      throw new BadRequestException('Invalid cursor format');
    }
  },
);
