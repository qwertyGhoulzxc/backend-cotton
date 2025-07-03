import { options } from '@auth/config';
import { MailModule } from '@mail/mail.module';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '@user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GUARDS } from './guards';
import { STRATEGIES } from './strategies';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync(options()),
    UserModule,
    MailModule,
    HttpModule,
  ],
  providers: [AuthService, ...STRATEGIES, ...GUARDS],
  controllers: [AuthController],
})
export class AuthModule {}
