import { UserWithResetPasswordCode } from '@app/@types';
import {
  MAX_RESET_PASSWORD_ATTEMPTS,
  regexPatterns,
} from '@app/common/constants';
import {
  generateExpTime,
  generateSixDigitCode,
  hashPassword,
  maskEmail,
} from '@app/common/utils';
import { MailService } from '@mail/mail.service';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { compareSync } from 'bcrypt';
import { isBefore } from 'date-fns';
import { Response } from 'express';
import {
  ChangePasswordByCodeDto,
  ChangePasswordDto,
  IsValidResetPasswordCode,
} from './dto';
import { UserService } from './user.service';

@Injectable()
export class ResetPasswordService {
  private readonly logger = new Logger(ResetPasswordService.name);

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
    this.logger.log(`Attempting to change password for user: ${userId}`);
    const user = await this.userService.findOne(userId);

    if (!compareSync(dto.oldPassword, user.password) && user.password) {
      this.logger.warn(
        `Password change failed: Old password incorrect for user ${userId}`,
      );
      throw new ConflictException('Old password does not match');
    }
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
    this.logger.log(`Password changed successfully for user: ${userId}`);
  }

  public async generateResetPasswordCode(
    usernameOrEmail: string,
    res?: Response,
  ): Promise<UserWithResetPasswordCode | Response> {
    this.logger.log(`Generating reset password code for: ${usernameOrEmail}`);
    const user = await this.userService.findOne(usernameOrEmail);

    if (!user && regexPatterns.email.test(usernameOrEmail)) {
      this.logger.warn(
        `Reset code generation failed: User not found for email ${usernameOrEmail}`,
      );
      // If res is provided, return response, otherwise strict return type might be issue but controller handles it
      if (res) {
        return res
          .status(201)
          .json({ usernameOrEmail, email: maskEmail(usernameOrEmail) });
      }
    }

    if (!user && !regexPatterns.email.test(usernameOrEmail))
      throw new BadRequestException('Invalid email or username');

    if (!user) {
      // Should not be reached if handled above, but for safety
      throw new BadRequestException('User not found');
    }

    if (!user.isActivated) {
      //TODO: Implement activation mail if needed, currently just logging
      this.logger.warn(`User ${user.id} is not activated`);
      // await this.mailService.sendActivationMail()
    }

    const _resetCode = await this.prismaService.resetPasswordCode.findFirst({
      where: { userId: user.id },
    });
    if (
      _resetCode &&
      _resetCode.attempts >= MAX_RESET_PASSWORD_ATTEMPTS &&
      isBefore(new Date(), _resetCode.expiresAt)
    ) {
      this.logger.warn(
        `Reset code generation blocked: Rate limited for user ${user.id}`,
      );
      throw new ForbiddenException('Try again later');
    }

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
    this.logger.log(`Reset password code generated for user: ${user.id}`);
    return {
      ...user,
      resetPasswordCode,
    };
  }

  public async isValid(dto: IsValidResetPasswordCode, res?: Response) {
    this.logger.log(
      `Validating reset password code for: ${dto.usernameOrEmail}`,
    );
    const user = await this.userService.findOne(dto.usernameOrEmail);

    if (!user) {
      this.logger.warn(
        `Validation failed: User not found for ${dto.usernameOrEmail}`,
      );
      throw new BadRequestException('Invalid email or username');
    }

    const code = this.isNumberCode(dto.code);
    await this.checkIsValidCode(
      { userId: user.id, code, email: user.email },
      res,
    );
    this.logger.log(`Reset code validated successfully for user: ${user.id}`);
    return { userId: user.id, code: dto.code };
  }

  public async changePasswordByCode(
    dto: ChangePasswordByCodeDto,
    res?: Response,
  ) {
    this.logger.log(`Changing password by code for: ${dto.userId}`);
    const user = await this.userService.findOne(dto.userId);
    if (!user) {
      this.logger.warn(
        `Change password failed: User not found for id ${dto.userId}`,
      );
      throw new BadRequestException('Invalid email or code');
    }
    const code = this.isNumberCode(dto.code);

    await this.checkIsValidCode(
      { userId: user.id, email: user.email, code },
      res,
    );
    await Promise.all([
      this.prismaService.user.update({
        where: {
          id: user.id,
        },
        data: {
          password: hashPassword(dto.password),
        },
      }),
      this.prismaService.resetPasswordCode.delete({
        where: {
          userId: user.id,
        },
      }),
      this.prismaService.token.deleteMany({
        where: {
          userId: user.id,
        },
      }),
    ]);
    this.logger.log(
      `Password changed by code successfully for user: ${user.id}`,
    );
  }

  private async checkIsValidCode(
    {
      userId,
      email,
      code,
    }: {
      userId: string;
      email: string;
      code: number;
    },
    res?: Response,
  ) {
    const data = await this.prismaService.resetPasswordCode.findFirst({
      where: {
        userId,
      },
    });
    if (!data) {
      this.logger.warn(
        `Code check failed: No reset code found for user ${userId}`,
      );
      throw new BadRequestException();
    }
    const { code: resetCode, expiresAt, attempts } = data;
    if (!isBefore(new Date(), expiresAt)) {
      this.logger.log(`Code expired for user ${userId}, generating new code`);
      const newCode = (await this.generateResetPasswordCode(
        email,
        res,
      )) as UserWithResetPasswordCode;

      if (newCode && newCode.resetPasswordCode) {
        await this.mailService.sendResetPasswordCodeEmail(
          newCode.email,
          newCode.resetPasswordCode.code,
        );
      }

      throw new BadRequestException(
        'The verification code has expired. Please check your email and enter the new code.',
      );
    }
    if (resetCode !== code) {
      this.logger.warn(`Invalid code attempt for user ${userId}`);
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
        if (attempts + 1 === MAX_RESET_PASSWORD_ATTEMPTS) {
          this.logger.warn(`Max reset attempts reached for user ${userId}`);
          throw new HttpException(
            'Too many requests, try later',
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }

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
