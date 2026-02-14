import { regexPatterns } from '@app/common/constants';
import { IsPasswordsMatchingConstraint } from '@app/common/decorators';
import {
  IsEmail,
  IsString,
  IsStrongPassword,
  Matches,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';

export class SignUpDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(50, { message: 'Password cannot be longer than 50 characters' })
  @IsStrongPassword()
  password: string;

  @MinLength(8, {
    message: 'Password repeat must be at least 8 characters long',
  })
  @IsString()
  @Validate(IsPasswordsMatchingConstraint, {
    message: 'Passwords do not match',
  })
  passwordRepeat: string;

  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @Matches(regexPatterns.username, {
    message:
      'The string must contain only Latin letters and up to 5 underscores',
  })
  @MaxLength(20, { message: 'Username cannot be longer than 20 characters' })
  username: string;
}
