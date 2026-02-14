import { IsNotEmpty, IsString, Length } from 'class-validator';

export class IsValidResetPasswordCode {
  @IsString()
  @IsNotEmpty()
  usernameOrEmail: string;

  @IsString()
  @Length(6, 6)
  code: string;
}
