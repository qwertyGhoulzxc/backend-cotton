import { Injectable, PipeTransform } from '@nestjs/common';
import { ALLOWED_DECK_SORT_BY } from '../constants';

@Injectable()
export class ParseDeckSortByPipe implements PipeTransform {
  transform(value: string) {
    if (!ALLOWED_DECK_SORT_BY.includes(value as any)) {
      value = ALLOWED_DECK_SORT_BY[0];
    }
    return value;
  }
}
