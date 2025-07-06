import { Injectable, PipeTransform } from '@nestjs/common';
import { ALLOWED_SORT_BY } from '../constants';

@Injectable()
export class ParseSortByPipe implements PipeTransform {
  transform(value: string) {
    if (!ALLOWED_SORT_BY.includes(value as any)) {
      value = ALLOWED_SORT_BY[0];
    }
    return value;
  }
}
