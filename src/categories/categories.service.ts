import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  public async listUserCategories(userId: string) {
    const _categories = await this.prismaService.deckCategory.findMany({
      where: {
        userId,
      },
      select: {
        name: true,
      },
    });
    const categories = _categories.map((val) => val.name);
    return categories;
  }
}
