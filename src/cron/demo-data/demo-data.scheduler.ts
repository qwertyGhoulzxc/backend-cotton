import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@prisma/prisma.service';
import { DemoDataService } from './demo-data.service';

@Injectable()
export class DemoDataScheduler {
  private readonly logger = new Logger(DemoDataScheduler.name);

  constructor(
    private demoDataService: DemoDataService,
    private prismaService: PrismaService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleDailyDemoReset() {
    this.logger.log('Running daily demo data reset...');
    try {
      await this.demoDataService.resetDemoUser();
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to reset demo data: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(`Failed to reset demo data`, error);
      }
    }
  }
}
