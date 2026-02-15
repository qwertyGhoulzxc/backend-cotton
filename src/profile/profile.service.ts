import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { UpdateProfileDto } from './dto';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async update(userId: string, dto: UpdateProfileDto) {
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
