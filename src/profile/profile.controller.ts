import { CurrentUser } from '@app/common/decorators';
import { FilesValidationPipe } from '@app/common/pipes';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AvatarService } from './avatar.service';
import { UpdateProfileDto } from './dto';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly avatarService: AvatarService,
  ) {}

  @Get('get-profile/:username')
  public async getProfile(
    @CurrentUser('username') tokenUsername: string,
    @Param('username') usernameParam: string,
  ) {
    const usernameToUse =
      usernameParam === 'me' ? tokenUsername : usernameParam;
    return this.profileService.getProfilePage(
      usernameToUse,
      usernameParam === 'me',
    );
  }

  @Patch('upload-avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  public async uploadAvatar(
    @UploadedFile(
      new FilesValidationPipe({
        allowedFileTypes: ['.jpg', '.png', '.jpeg'],
        maxSize: 5 * 1024 * 1024,
      }),
    )
    avatarFile: Express.Multer.File,
    @CurrentUser('id') userId: string,
  ) {
    return this.avatarService.updateAvatar(avatarFile, userId);
  }

  @Delete('delete-avatar')
  public async deleteAvatar(@CurrentUser('id') userId: string) {
    return this.avatarService.deleteAvatar(userId);
  }

  @Patch('update-profile-data')
  public async updateProfileData(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.update(userId, dto);
  }
}
