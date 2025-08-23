import { ALLOWED_CARD_SORT_BY } from '@app/common/constants';
import { TCardCursor } from '@app/common/decorators';

export type TCardSearchParams = {
  limit: number;
  sortBy: (typeof ALLOWED_CARD_SORT_BY)[number];
  search: string | null;
  cursor: TCardCursor;
};
