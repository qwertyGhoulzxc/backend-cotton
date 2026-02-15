import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class ChangeUserDataDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
