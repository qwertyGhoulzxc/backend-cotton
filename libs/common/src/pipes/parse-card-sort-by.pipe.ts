import { Injectable, PipeTransform } from '@nestjs/common';
import { ALLOWED_CARD_SORT_BY } from '../constants';

@Injectable()
export class ParseCardSortByPipe implements PipeTransform {
  transform(value: string) {
    if (!ALLOWED_CARD_SORT_BY.includes(value as any)) {
      value = ALLOWED_CARD_SORT_BY[0];
    }
    return value;
  }
}
