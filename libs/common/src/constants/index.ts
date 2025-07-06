export const MAX_RESET_PASSWORD_ATTEMPTS = 5;

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 5,
} as const;

export const ALLOWED_SORT_BY = [
  'recent',
  'mastery',
  'cards',
  'alphabetical',
  'newest',
] as const;

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
