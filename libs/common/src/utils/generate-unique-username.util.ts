import { generateSixDigitCode } from './generate-six-digit-code.util';

const adjectives = [
  'wise',
  'bright',
  'quick',
  'sharp',
  'keen',
  'alert',
  'smart',
  'calm',
  'cool',
  'fast',
];

const nouns = [
  'owl',
  'card',
  'deck',
  'note',
  'brain',
  'book',
  'mind',
  'quiz',
  'study',
  'learn',
];

export function generateUniqueUsername() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = generateSixDigitCode();
  return `${adj}_${noun}${num}`;
}
