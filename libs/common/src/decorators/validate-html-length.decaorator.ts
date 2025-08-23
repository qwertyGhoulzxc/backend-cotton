import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { JSDOM } from 'jsdom';

function htmlToPlainText(html: string): string {
  const dom = new JSDOM(html);
  return (
    dom.window.document.body.textContent?.replace(/\s+/g, ' ').trim() || ''
  );
}

export function ValidateHtmlLength(
  minLength: number,
  maxLength: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'validateHtmlLength',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [minLength, maxLength],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          const text = htmlToPlainText(value);
          const [min, max] = args.constraints;
          if (max !== undefined) {
            return text.length >= min && text.length <= max;
          }
          return text.length >= min;
        },
        defaultMessage(args: ValidationArguments) {
          const [min, max] = args.constraints;
          if (max !== undefined) {
            return `${args.property} must contain between ${min} and ${max} visible characters`;
          }
          return `${args.property} must contain at least ${min} visible characters`;
        },
      },
    });
  };
}
