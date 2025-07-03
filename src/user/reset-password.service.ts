import { UserWithResetPasswordCode } from '@app/@types';
import { MAX_RESET_PASSWORD_ATTEMPTS } from '@app/common/constants';
import {
  generateExpTime,
  generateSixDigitCode,
  hashPassword,
} from '@app/common/utils';
import { MailService } from '@mail/mail.service';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { compareSync } from 'bcrypt';
import { isBefore } from 'date-fns';
import {
  ChangePasswordByCodeDto,
  ChangePasswordDto,
  IsValidResetPasswordCode,
} from './dto';
import { UserService } from './user.service';

@Injectable()
export class ResetPasswordService {
  constructor(
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
  ) {}

  public async changePassword(
    dto: ChangePasswordDto,
    userId: string,
    agent: string,
  ) {
    const user = await this.userService.findOne(userId);

    if (!compareSync(user.password, dto.oldPassword) && user.password)
      throw new ConflictException('Old password does not match');
    await Promise.all([
      this.prismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          password: hashPassword(dto.password),
        },
      }),
      this.prismaService.token.deleteMany({
        where: {
          userId,
          NOT: {
            userAgent: agent,
          },
        },
      }),
    ]);
  }

  public async generateResetPasswordCode(
    email: string,
  ): Promise<UserWithResetPasswordCode | undefined> {
    const user = await this.userService.findOne(email);
    if (!user) return undefined;

    const _resetCode = await this.prismaService.resetPasswordCode.findFirst({
      where: { userId: user.id },
    });
    if (
      _resetCode &&
      _resetCode.attempts >= MAX_RESET_PASSWORD_ATTEMPTS &&
      isBefore(new Date(), _resetCode.expiresAt)
    )
      throw new ForbiddenException('Try again later');

    let resetPasswordCode;
    if (_resetCode && !isBefore(new Date(), _resetCode.expiresAt)) {
      resetPasswordCode = await this.prismaService.resetPasswordCode.update({
        where: { userId: user.id },
        data: {
          userId: user.id,
          code: generateSixDigitCode(),
          expiresAt: generateExpTime('2h'),
          attempts: 0,
        },
      });
    } else {
      resetPasswordCode = await this.prismaService.resetPasswordCode.upsert({
        where: { userId: user.id },
        update: {
          code: generateSixDigitCode(),
          expiresAt: generateExpTime('2h'),
        },
        create: {
          userId: user.id,
          code: generateSixDigitCode(),
          expiresAt: generateExpTime('2h'),
        },
      });
    }
    return {
      ...user,
      resetPasswordCode,
    };
  }

  public async isValid(dto: IsValidResetPasswordCode) {
    const user = await this.userService.findOne(dto.email);
    if (!user) throw new BadRequestException('Invalid code, try again');
    const code = this.isNumberCode(dto.code);
    await this.checkIsValidCode(user.id, dto.email, code);
    return { userId: user.id, code: dto.code };
  }

  public async changePasswordByCode(dto: ChangePasswordByCodeDto) {
    const user = await this.userService.findOne(dto.email);
    if (!user) throw new BadRequestException('Invalid email or code');
    const code = this.isNumberCode(dto.code);

    await this.checkIsValidCode(user.id, user.email, code);
    await Promise.all([
      this.prismaService.user.update({
        where: {
          id: user.id,
        },
        data: {
          password: hashPassword(dto.password),
        },
      }),
      this.prismaService.token.deleteMany({
        where: {
          userId: user.id,
        },
      }),
    ]);
  }

  private async checkIsValidCode(userId: string, email: string, code: number) {
    const data = await this.prismaService.resetPasswordCode.findFirst({
      where: {
        userId,
      },
    });
    if (!data) throw new BadRequestException();
    const { code: resetCode, expiresAt, attempts } = data;
    if (!isBefore(new Date(), expiresAt)) {
      const newCode = await this.generateResetPasswordCode(email);
      if (!newCode) throw new BadRequestException();
      await this.mailService.sendResetPasswordCodeEmail(
        newCode.email,
        newCode.resetPasswordCode.code,
      );
      throw new BadRequestException(
        'The verification code has expired. Please check your email and enter the new code.',
      );
    }
    if (resetCode !== code) {
      if (attempts < MAX_RESET_PASSWORD_ATTEMPTS) {
        const newExpires =
          attempts + 1 === MAX_RESET_PASSWORD_ATTEMPTS
            ? generateExpTime('5m')
            : undefined;
        await this.prismaService.resetPasswordCode.update({
          where: {
            userId: userId,
          },
          data: {
            attempts: {
              increment: 1,
            },
            expiresAt: newExpires,
          },
        });
        if (attempts + 1 === MAX_RESET_PASSWORD_ATTEMPTS)
          throw new HttpException(
            'Too many requests, try later',
            HttpStatus.TOO_MANY_REQUESTS,
          );

        throw new ForbiddenException('Invalid code, try again');
      }
      throw new HttpException(
        'Too many requests, try later',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private isNumberCode(_code: string | number): number {
    const code = Number(_code);
    if (
      isNaN(code) ||
      !Number.isInteger(code) ||
      code < 100000 ||
      code > 999999
    ) {
      throw new BadRequestException('Invalid code format');
    }
    return code;
  }
}
