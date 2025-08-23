export function parseCursorValue(
  sortBy: string,
  value: any,
): string | number | Date {
  switch (sortBy) {
    case 'mastery':
    case 'cards':
      const num = Number(value);
      if (isNaN(num))
        throw new Error(`Invalid numeric cursor value for "${sortBy}"`);
      return num;

    case 'alphabetical':
      if (typeof value !== 'string')
        throw new Error(`Expected string for "${sortBy}"`);
      return value;

    case 'newest':
    case 'recent':
    default:
      const date = new Date(value);
      if (isNaN(date.getTime()))
        throw new Error(`Invalid date cursor value for "${sortBy}"`);
      return value;
  }
}
