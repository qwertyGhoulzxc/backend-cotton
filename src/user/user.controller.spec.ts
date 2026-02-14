import { ThrottlerGuard } from '@app/common/guards/throttler.guard';
import { MailService } from '@mail/mail.service';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { IsValidResetPasswordCode } from './dto';
import { ResetPasswordService } from './reset-password.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

jest.mock('@app/common/validators', () => ({
  validateIsUsernameOrEmail: jest.fn(),
}));

describe('UserController', () => {
  let controller: UserController;
  let resetPasswordService: ResetPasswordService;
  let mailService: MailService;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    sendStatus: jest.fn().mockReturnThis(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn(),
            delete: jest.fn(),
            changeUserData: jest.fn(),
          },
        },
        {
          provide: ResetPasswordService,
          useValue: {
            changePassword: jest.fn(),
            generateResetPasswordCode: jest.fn(),
            isValid: jest.fn(),
            changePasswordByCode: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendResetPasswordLink: jest.fn(),
            sendResetPasswordCodeEmail: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserController>(UserController);
    resetPasswordService =
      module.get<ResetPasswordService>(ResetPasswordService);
    mailService = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getResetPasswordCode', () => {
    it('should handle non-existing user cleanly', async () => {
      jest
        .spyOn(resetPasswordService, 'generateResetPasswordCode')
        .mockResolvedValue(undefined as any); // Simulate void return if handled in service

      await controller.getResetPasswordCode('test@example.com', mockResponse);
      expect(
        resetPasswordService.generateResetPasswordCode,
      ).toHaveBeenCalledWith('test@example.com', mockResponse);
    });

    it('should send email if user exists', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        resetPasswordCode: { code: 123456 },
      };
      jest
        .spyOn(resetPasswordService, 'generateResetPasswordCode')
        .mockResolvedValue(user as any);

      await controller.getResetPasswordCode('test@example.com', mockResponse);

      expect(mailService.sendResetPasswordCodeEmail).toHaveBeenCalledWith(
        'test@example.com',
        123456,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });
  });

  describe('accessToChangePasswordByCode', () => {
    it('should throw if code length is invalid', async () => {
      const dto: IsValidResetPasswordCode = {
        usernameOrEmail: 'test',
        code: '123',
      };
      await expect(
        controller.accessToChangePasswordByCode(dto, mockResponse),
      ).rejects.toThrow(BadRequestException);
    });

    it('should call service isValid if code valid', async () => {
      const dto: IsValidResetPasswordCode = {
        usernameOrEmail: 'test',
        code: '123456',
      };
      jest
        .spyOn(resetPasswordService, 'isValid')
        .mockResolvedValue({ userId: '1', code: '123456' });

      await controller.accessToChangePasswordByCode(dto, mockResponse);

      expect(resetPasswordService.isValid).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });
  });
});
