export const MAX_RESET_PASSWORD_ATTEMPTS = 5;

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 5,
} as const;

export const regexPatterns = {
  username: /^(?!.*_{5,})[a-zA-Z0-9_]+$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
} as const;

export const ALLOWED_DECK_SORT_BY = [
  'recent',
  'mastery',
  'cards',
  'alphabetical',
  'newest',
] as const;

export const ALLOWED_CARD_SORT_BY = ['newest', 'oldest', 'easiest', 'hardest'];

export const ALLOWED_COLORS = [
  'red',
  'emerald',
  'blue',
  'cyan',
  'purple',
  'pink',
  'yellow',
  'stone',
] as const;

export const ALLOWED_ICONS = [
  'bookOpen',
  'bot',
  'food',
  'music',
  'ghost',
  'movies',
  'design',
  'art',
  'code',
  'award',
  'mail',
  'math',
  'activity',
  'video',
  'nature',
  'mind',
  'travel',
  'car',
];

export const MIN_AMOUNT_OF_RECORDS_TO_TRAIN = 400 as const;
