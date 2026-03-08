import { S3PATH } from '@app/common/constants';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import * as sharp from 'sharp';
import { UploadService } from 'src/upload/upload.service';

@Injectable()
export class AvatarService {
  private readonly logger = new Logger(AvatarService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  private isExternalUrl(path: string): boolean {
    return path.startsWith('http://') || path.startsWith('https://');
  }

  public async updateAvatar(file: Express.Multer.File, userId: string) {
    this.logger.log(`Updating avatar for user: ${userId}`);
    const profile = await this.prismaService.profile.findUnique({
      where: {
        userId,
      },
    });
    if (!profile) {
      this.logger.warn(`Profile not found for user: ${userId}`);
      throw new NotFoundException('Profile not found');
    }

    if (
      profile.avatarPath !== S3PATH.DEFAULT_AVATAR &&
      !this.isExternalUrl(profile.avatarPath)
    ) {
      this.logger.debug(`Deleting old avatar: ${profile.avatarPath}`);
      await this.uploadService.deleteFile(profile.avatarPath);
    }

    const buffer = await sharp(file.buffer)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();

    const fileName = await this.uploadService.uploadFile(
      { ...file, buffer, mimetype: 'image/webp' },
      S3PATH.AVATAR,
    );

    this.logger.log(`Avatar uploaded successfully: ${fileName}`);

    await this.prismaService.profile.update({
      where: {
        userId,
      },
      data: {
        avatarPath: fileName,
      },
    });
  }

  public async deleteAvatar(userId: string) {
    this.logger.log(`Deleting avatar for user: ${userId}`);
    const profile = await this.prismaService.profile.findUnique({
      where: { userId },
    });
    if (!profile) {
      this.logger.warn(`Profile not found for user: ${userId}`);
      throw new NotFoundException('Profile not found');
    }
    if (profile.avatarPath === S3PATH.DEFAULT_AVATAR) {
      this.logger.debug(`User ${userId} already has default avatar`);
      return;
    }

    if (this.isExternalUrl(profile.avatarPath)) {
      this.logger.debug(
        `Skipping S3 delete for external avatar: ${profile.avatarPath}`,
      );
    } else {
      await this.uploadService.deleteFile(profile.avatarPath);
    }

    await this.prismaService.profile.update({
      where: { userId },
      data: {
        avatarPath: S3PATH.DEFAULT_AVATAR,
      },
    });
    this.logger.log(`Avatar deleted successfully for user: ${userId}`);
  }
}
