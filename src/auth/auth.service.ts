import { generateExpTime, generateSixDigitCode } from '@app/common/utils';
import { MailService } from '@mail/mail.service';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Provider, Token, User } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { UserService } from '@user/user.service';
import { compareSync } from 'bcrypt';
import { add, isBefore } from 'date-fns';
import { Response } from 'express';
import { v4 } from 'uuid';
import { ActivateAccountDto, SignInDto, SignUpDto } from './dto';
import { Tokens } from './interfaces';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  public async singUp(dto: SignUpDto) {
    const user = await this.prismaService.user.findFirst({
      where: { email: dto.email },
    });

    if (user)
      throw new BadRequestException('Cannot sign up user with this data');
    const newUser = await this.userService.save(dto);
    const activationCode = await this.prismaService.activationCode.findUnique({
      where: { userId: newUser.id },
    });
    if (activationCode) {
      await this.mailService.sendActivationMail(
        newUser.email,
        activationCode.code,
      );
    }
    return newUser;
  }

  public async signIn(dto: SignInDto, agent: string, res: Response) {
    const user = await this.userService.findOne(dto.email);
    if (!user) throw new UnauthorizedException('Invalid email or password');
    if (user.provider && !user.password)
      throw new BadRequestException(
        `Please use ${user.provider.toLowerCase()} to login`,
      );

    if (!user.password || !compareSync(dto.password, user.password))
      throw new UnauthorizedException('Invalid email or password');

    if (!user.isActivated) {
      const activationCode = await this.prismaService.activationCode.findUnique(
        {
          where: { userId: user.id },
        },
      );

      if (activationCode) {
        await this.mailService.sendActivationMail(
          user.email,
          activationCode.code,
        );
      }
      throw new UnauthorizedException({ id: user.id, email: user.email });
    }

    return this.generateTokens(user, agent);
  }

  public async refreshTokens(
    refreshToken: string,
    agent: string,
  ): Promise<Tokens> {
    const token = await this.prismaService.token.findUnique({
      where: { token: refreshToken },
    });
    if (!token) throw new UnauthorizedException();
    await this.prismaService.token.delete({ where: { token: refreshToken } });
    if (new Date(token.exp) < new Date()) {
      throw new UnauthorizedException();
    }
    const user = await this.userService.findOne(token.userId);
    return this.generateTokens(user, agent);
  }

  public async deleteRefreshToken(token: string) {
    return this.prismaService.token.deleteMany({ where: { token } });
  }

  public async getActivationCode(email: string) {
    const user = await this.checkUserActivationCode(email);
    await this.mailService.sendActivationMail(email, user.activationCode.code);
    return { email, id: user.id };
  }

  public async activateAccount(dto: ActivateAccountDto) {
    const user = await this.checkUserActivationCode(dto.userId);
    if (!user.activationCode.code) await this.upsertUserActivationCode(user);
    if (user.activationCode.code !== Number(dto.code))
      throw new BadRequestException('Invalid code');

    await Promise.all([
      this.prismaService.user.update({
        where: { id: user.id },
        data: {
          isActivated: true,
        },
      }),
      this.prismaService.activationCode.delete({ where: { userId: user.id } }),
    ]);
  }

  private async upsertUserActivationCode(user: Partial<User>) {
    const { code } = await this.prismaService.activationCode
      .upsert({
        where: {
          userId: user.id,
        },
        create: {
          code: generateSixDigitCode(),
          userId: user.id,
          expiresAt: generateExpTime('1d'),
        },
        update: {
          code: generateSixDigitCode(),
          expiresAt: generateExpTime('1d'),
        },
      })
      .catch((error) => {
        throw new InternalServerErrorException('Something went wrong');
      });
    await this.mailService.sendActivationMail(user.email, code);
    throw new BadRequestException(
      'Activation code has expired. Please check email and try again',
    );
  }

  private async checkUserActivationCode(emailOrId: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        OR: [{ email: emailOrId }, { id: emailOrId }],
      },
      select: {
        activationCode: true,
        id: true,
        email: true,
        isActivated: true,
      },
    });

    if (user.isActivated)
      throw new BadRequestException('You have already activated your account');
    if (!user)
      throw new BadRequestException(
        'No such user or you have already activated your account',
      );
    if (!isBefore(new Date(), user.activationCode.expiresAt))
      await this.upsertUserActivationCode(user);
    return user;
  }

  private async generateTokens(user: User, agent: string): Promise<Tokens> {
    const accessToken =
      'Bearer ' +
      this.jwtService.sign({
        id: user.id,
        name: user.name,
        isActivated: user.isActivated,
      });
    const refreshToken = await this.getRefreshToken(user.id, agent);
    return { accessToken, refreshToken };
  }

  private async getRefreshToken(userId: string, agent: string): Promise<Token> {
    const _token = await this.prismaService.token.findFirst({
      where: { userId, userAgent: agent },
    });
    const token = _token?.token ?? '';
    return this.prismaService.token.upsert({
      where: { token },
      update: {
        token: v4(),
        exp: add(new Date(), { months: 1 }),
      },
      create: {
        token: v4(),
        exp: add(new Date(), { months: 1 }),
        userId,
        userAgent: agent,
      },
    });
  }

  public async googleAuth(
    email: string,
    agent: string,
    email_verified: string,
    name: string,
  ) {
    const userExist = await this.userService.findOne(email);
    if (userExist) {
      return this.generateTokens(userExist, agent);
    }
    const user = await this.userService.save({
      email,
      name,
      provider: Provider.GOOGLE,
      isActivated: Boolean(email_verified),
    });

    if (!user)
      throw new HttpException(
        `Fail attempt to create user ${email}`,
        HttpStatus.BAD_REQUEST,
      );

    return this.generateTokens(user, agent);
  }
}
