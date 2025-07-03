import { IsPasswordsMatchingConstraint } from '@app/common/decorators';
import {
  IsEmail,
  IsString,
  IsStrongPassword,
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
  @MinLength(1, { message: 'Name must be at least 1 character long' })
  @MaxLength(20, { message: 'Name cannot be longer than 20 characters' })
  name: string;
}
