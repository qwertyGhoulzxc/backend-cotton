import { MailModule } from '@mail/mail.module';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TokenModule } from '@token/token.module';
import { UserModule } from '@user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GUARDS } from './guards';
import { STRATEGIES } from './strategies';

@Module({
  imports: [PassportModule, TokenModule, UserModule, MailModule, HttpModule],
  providers: [AuthService, ...STRATEGIES, ...GUARDS],
  controllers: [AuthController],
})
export class AuthModule {}
