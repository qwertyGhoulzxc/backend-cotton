import { Module } from '@nestjs/common';
import { UploadModule } from 'src/upload/upload.module';
import { AvatarService } from './avatar.service';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [UploadModule],
  providers: [ProfileService, AvatarService],
  controllers: [ProfileController],
})
export class ProfileModule {}
