import { SignUpDto } from '@auth/dto';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsPasswordsMatching', async: false })
export class IsPasswordsMatchingConstraint
  implements ValidatorConstraintInterface
{
  validate(passwordRepeat: string, args: ValidationArguments) {
    const obj = args.object as SignUpDto;
    return obj.password == passwordRepeat;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return "passwords don't match";
  }
}
