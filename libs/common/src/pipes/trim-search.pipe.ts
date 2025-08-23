import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class TrimSearchPipe implements PipeTransform {
  transform(value: any): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }
}
