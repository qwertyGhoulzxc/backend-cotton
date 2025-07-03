import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class ChangeUserDataDto {
  @IsOptional()
  @IsString()
  @Length(1, 20)
  name: string;

  @IsOptional()
  @IsEmail()
  email: string;
}
