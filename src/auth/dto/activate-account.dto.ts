import { IsString, IsUUID, Length } from 'class-validator';

export class ActivateAccountDto {
  @IsUUID()
  userId: string;

  @IsString()
  @Length(6, 6)
  code: string;
}
