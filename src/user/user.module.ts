import { MailModule } from '@mail/mail.module';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ResetPasswordService } from './reset-password.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [CacheModule.register(), MailModule],
  providers: [UserService, ResetPasswordService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
