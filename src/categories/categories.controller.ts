import { CurrentUser } from '@app/common/decorators';
import { Controller, Get } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
  @Get('list-user-categories')
  public async listUserCategories(@CurrentUser('id') userId: string) {
    return this.categoriesService.listUserCategories(userId);
  }
}
