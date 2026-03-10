import { Module } from '@nestjs/common';
import { DemoDataScheduler } from './demo-data/demo-data.scheduler';
import { DemoDataService } from './demo-data/demo-data.service';
import { MasteryScheduler } from './mastery/mastery.scheduler';
import { WeightsScheduler } from './weights/weights.scheduler';
import { WeightsService } from './weights/weights.service';

@Module({
  providers: [
    MasteryScheduler,
    WeightsService,
    WeightsScheduler,
    DemoDataService,
    DemoDataScheduler,
  ],
})
export class CronModule {}
