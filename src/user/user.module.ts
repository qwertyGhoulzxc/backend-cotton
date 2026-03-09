import { MailModule } from '@mail/mail.module';
import { Module } from '@nestjs/common';
import { TokenModule } from '@token/token.module';
import { ResetPasswordService } from './reset-password.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [MailModule, TokenModule],
  providers: [UserService, ResetPasswordService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
