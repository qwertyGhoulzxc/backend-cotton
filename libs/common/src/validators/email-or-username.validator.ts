import { regexPatterns } from '@app/common/constants';
import { BadRequestException } from '@nestjs/common';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  isEmail,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsUsernameOrEmailConstraint
  implements ValidatorConstraintInterface
{
  validate(value: string, args: ValidationArguments) {
    if (!value) return false;
    if (
      value.length >= 3 &&
      value.length <= 20 &&
      regexPatterns.username.test(value)
    ) {
      return true;
    }
    return isEmail(value);
  }

  defaultMessage(args: ValidationArguments) {
    return 'The value must be a valid username or email';
  }
}

export function IsUsernameOrEmail(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUsernameOrEmailConstraint,
    });
  };
}
export function validateIsUsernameOrEmail(value: string, message?: string) {
  if (
    value.length >= 3 &&
    value.length <= 20 &&
    regexPatterns.username.test(value)
  ) {
    return true;
  }
  if (isEmail(value)) return true;

  throw new BadRequestException({
    message: message ? message : 'Invalid username or email',
    error: 'Bad Request',
    statusCode: 400,
  });
}
