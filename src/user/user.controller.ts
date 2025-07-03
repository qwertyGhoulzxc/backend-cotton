import { UserWithResetPasswordCode } from '@app/@types';
import { CurrentUser, Public, UserAgent } from '@app/common/decorators';
import { JwtPayload } from '@auth/interfaces';
import { MailService } from '@mail/mail.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Response } from 'express';
import {
  ChangePasswordByCodeDto,
  ChangePasswordDto,
  ChangeUserDataDto,
  IsValidResetPasswordCode,
} from './dto';
import { ResetPasswordService } from './reset-password.service';
import { UserResponse } from './responses';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly resetPasswordService: ResetPasswordService,
    private readonly mailService: MailService,
  ) {}

  // TODO: change token
  @Patch('change-user-data')
  public async changeUserData(
    @Body() dto: ChangeUserDataDto,
    @CurrentUser('id') userId: string,
  ) {
    const user = await this.userService.changeUserData(dto, userId);
    return plainToClass(UserResponse, user);
  }

  @Delete(':id')
  public async deleteUser(
    @Param('id') userId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.userService.delete(userId, user);
  }

  //TODO: Thing about data that going to be in the page me
  @Get('me')
  public async getMe(@CurrentUser('id') userId: string) {
    const user = this.userService.findOne(userId);
    return plainToClass(UserResponse, user);
  }

  // password

  @Put('change-password')
  public async changePassword(
    @Body() dto: ChangePasswordDto,
    @CurrentUser('id') userId: string,
    @UserAgent() agent: string,
    @Res() res: Response,
  ) {
    await this.resetPasswordService.changePassword(dto, userId, agent);
    return res.sendStatus(HttpStatus.OK);
  }

  // public
  @Public()
  @Get('get-reset-password-code/:email')
  public async getResetPasswordCode(
    @Param('email') email: string,
    @Res() res: Response,
  ) {
    const user =
      await this.resetPasswordService.generateResetPasswordCode(email);
    if (!user || !user?.id) {
      return res.sendStatus(HttpStatus.OK);
    }
    const _user = user as UserWithResetPasswordCode;

    await this.mailService.sendResetPasswordCodeEmail(
      _user.email,
      _user.resetPasswordCode.code,
    );

    return res.sendStatus(HttpStatus.OK);
  }

  @Public()
  @Post('reset-password-by-code/isValid')
  public async accessToChangePasswordByCode(
    @Body() dto: IsValidResetPasswordCode,
    @Res() res: Response,
  ) {
    const obj = await this.resetPasswordService.isValid(dto);
    return res.sendStatus(HttpStatus.OK).json(obj);
  }

  @Public()
  @Put('change-password-by-code')
  public async changePasswordByCode(
    @Body() dto: ChangePasswordByCodeDto,
    @Res() res: Response,
  ) {
    await this.resetPasswordService.changePasswordByCode(dto);
    return res.sendStatus(HttpStatus.OK);
  }
}
