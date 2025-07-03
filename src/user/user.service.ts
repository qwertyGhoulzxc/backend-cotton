import {
  convertToSecondsUtil,
  generateExpTime,
  generateSixDigitCode,
  hashPassword,
} from '@app/common/utils';
import { JwtPayload } from '@auth/interfaces';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { Cache } from 'cache-manager';
import { ChangeUserDataDto } from './dto';

type resetCacheArgs = string[] | string;

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  public async save(user: Partial<User>): Promise<User> {
    if (user.isActivated) {
      return this.prismaService.user.create({
        data: {
          email: user.email.toLowerCase(),
          name: user.name,
          password: null,
          provider: user?.provider,
          isActivated: user.isActivated,
        },
      });
    }
    return this.prismaService.user.create({
      data: {
        email: user.email.toLowerCase(),
        name: user.name,
        password: hashPassword(user.password),
        activationCode: {
          create: {
            code: generateSixDigitCode(),
            expiresAt: generateExpTime('1d'),
          },
        },
      },
    });
  }

  public async findOne(idOrEmail: string, isReset = false) {
    if (isReset) {
      await this.resetCache(idOrEmail);
    }

    const user = await this.cacheManager.get<User>(idOrEmail);
    if (!user) {
      const user = await this.prismaService.user.findFirst({
        where: { OR: [{ id: idOrEmail }, { email: idOrEmail.toLowerCase() }] },
      });
      if (!user) return null;
      await this.cacheManager.set(
        idOrEmail,
        user,
        convertToSecondsUtil(this.configService.get('JWT_EXP')),
      );
      return user;
    }
    return user;
  }

  //other

  public async changeUserData(
    dto: ChangeUserDataDto,
    userId: string,
  ): Promise<User> {
    const user = await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
      },
    });
    await this.resetCache([userId, user.email]);
    return user;
  }

  public async delete(id: string, user: JwtPayload) {
    if (id !== user.id)
      throw new ForbiddenException(
        'You do not have sufficient permissions to delete this user',
      );
    const _user = await this.prismaService.user.delete({ where: { id } });
    await this.resetCache([_user.email, id]);
    return _user.id;
  }

  private async resetCache(args: resetCacheArgs) {
    if (typeof args === 'string') await this.cacheManager.del(args);
    else {
      await Promise.all(args.map((key) => this.cacheManager.del(key)));
    }
  }
}
