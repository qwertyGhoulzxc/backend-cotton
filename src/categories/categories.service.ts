import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  public async listUserCategories(userId: string) {
    const categories = await this.prismaService.deckCategory.findMany({
      where: {
        userId,
      },
      select: {
        name: true,
        color: true,
        icon: true,
      },
    });
    return categories;
  }
}
