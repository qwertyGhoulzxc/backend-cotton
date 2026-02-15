import { S3PATH } from '@app/common/constants';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { UploadService } from 'src/upload/upload.service';
import { UpdateProfileDto } from './dto';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  public async getProfilePage(username: string, isMe: boolean) {
    const userProfile = await this.prismaService.user.findFirst({
      where: {
        username,
      },
      select: {
        username: true,
        createdAt: true,
        email: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            avatarPath: true,
          },
        },
      },
    });
    if (!userProfile)
      throw new NotFoundException('No such user with this username');

    const profile = userProfile.profile || {
      firstName: '',
      lastName: '',
      avatarPath: S3PATH.DEFAULT_AVATAR,
    };

    const { avatarPath, firstName, lastName } = profile;
    const avatarUrl = await this.uploadService.getSignedLink(avatarPath);
    return {
      username: userProfile.username,
      createdAt: userProfile.createdAt,
      email: isMe ? userProfile.email : null,
      firstName,
      lastName,
      avatarUrl,
    };
  }

  public async update(userId: string, dto: UpdateProfileDto) {
    this.logger.log(`Updating profile for user: ${userId}`);
    const profile = await this.prismaService.profile.upsert({
      where: { userId },
      update: dto,
      create: {
        userId,
        ...dto,
      },
    });
    this.logger.log(`Profile updated successfully for user: ${userId}`);
    return profile;
  }
}
