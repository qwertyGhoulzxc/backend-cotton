import { Module } from '@nestjs/common';
import { FsrsService } from './fsrs.service';
import { FsrsController } from './fsrs.controller';

@Module({
  providers: [FsrsService],
  controllers: [FsrsController]
})
export class FsrsModule {}
