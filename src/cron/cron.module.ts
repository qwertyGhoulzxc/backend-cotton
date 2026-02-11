import { Module } from '@nestjs/common';
import { MasteryScheduler } from './mastery/mastery.scheduler';
import { WeightsScheduler } from './weights/weights.scheduler';
import { WeightsService } from './weights/weights.service';

@Module({
  providers: [MasteryScheduler, WeightsService, WeightsScheduler]
})
export class CronModule {}
