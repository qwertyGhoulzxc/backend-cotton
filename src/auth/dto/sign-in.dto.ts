import { IsUsernameOrEmail } from '@app/common/validators';
import { IsString } from 'class-validator';

export class SignInDto {
  @IsUsernameOrEmail({ message: 'invalid login or password' })
  login: string;

  @IsString()
  password: string;
}
