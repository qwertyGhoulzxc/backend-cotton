import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Token, User } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { add } from 'date-fns';
import { Response } from 'express';
import { v4 } from 'uuid';

export interface Tokens {
  accessToken: string;
  refreshToken: Token;
}

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async generateTokens(user: User, agent: string): Promise<Tokens> {
    this.logger.log(`Generating tokens for user: ${user.id}`);
    const accessToken =
      'Bearer ' +
      this.jwtService.sign({
        id: user.id,
        username: user.username,
        isActivated: user.isActivated,
      });
    const refreshToken = await this.upsertRefreshToken(user.id, agent);
    return { accessToken, refreshToken };
  }

  public async deleteRefreshToken(token: string) {
    this.logger.log(`Deleting refresh token`);
    return this.prismaService.token.deleteMany({ where: { token } });
  }

  public async deleteAllUserTokens(userId: string): Promise<void> {
    this.logger.log(`Deleting all refresh tokens for user: ${userId}`);
    await this.prismaService.token.deleteMany({ where: { userId } });
  }

  public setRefreshTokenToCookies(tokens: Tokens, res: Response) {
    if (!tokens) {
      throw new UnauthorizedException();
    }
    res.cookie('refreshtoken', tokens.refreshToken.token, {
      httpOnly: true,
      sameSite: 'lax',
      expires: new Date(tokens.refreshToken.exp),
      secure: this.configService.get('NODE_ENV', 'dev') === 'prod',
      path: '/',
    });
  }

  private async upsertRefreshToken(
    userId: string,
    agent: string,
  ): Promise<Token> {
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
}
