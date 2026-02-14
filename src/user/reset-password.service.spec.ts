import { UserWithResetPasswordCode } from '@app/@types';
import { MailService } from '@mail/mail.service';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@prisma/prisma.service';
import { Response } from 'express';
import { ResetPasswordService } from './reset-password.service';
import { UserService } from './user.service';

describe('ResetPasswordService', () => {
  let service: ResetPasswordService;
  let userService: UserService;
  let prismaService: PrismaService;
  let mailService: MailService;
  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    sendStatus: jest.fn().mockReturnThis(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResetPasswordService,
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            resetPasswordCode: {
              findFirst: jest.fn(),
              update: jest.fn(),
              upsert: jest.fn(),
              delete: jest.fn(),
            },
            user: {
              update: jest.fn(),
            },
            token: {
              deleteMany: jest.fn(),
            },
          },
        },
        {
          provide: MailService,
          useValue: {
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
    }).compile();

    service = module.get<ResetPasswordService>(ResetPasswordService);
    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
    mailService = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateResetPasswordCode', () => {
    it('should return masked email if user not found but valid email format', async () => {
      jest.spyOn(userService, 'findOne').mockResolvedValue(null);
      const email = 'test@example.com';

      const result = await service.generateResetPasswordCode(
        email,
        mockResponse,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          usernameOrEmail: email,
          email: expect.stringContaining('*'),
        }),
      );
    });

    it('should throw BadRequest if user not found and invalid format', async () => {
      jest.spyOn(userService, 'findOne').mockResolvedValue(null);
      const invalid = 'invalid';

      await expect(service.generateResetPasswordCode(invalid)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should generate code for existing user', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        isActivated: true,
      } as any;
      jest.spyOn(userService, 'findOne').mockResolvedValue(user);
      jest
        .spyOn(prismaService.resetPasswordCode, 'findFirst')
        .mockResolvedValue(null);
      jest.spyOn(prismaService.resetPasswordCode, 'upsert').mockResolvedValue({
        code: 123456,
      } as any);

      const result = await service.generateResetPasswordCode(user.email);
      expect(result).toHaveProperty('resetPasswordCode');
      expect((result as UserWithResetPasswordCode).id).toBe('1');
    });
  });

  describe('isValid', () => {
    it('should return valid if code matches', async () => {
      const user = { id: '1', email: 'test@example.com' } as any;
      jest.spyOn(userService, 'findOne').mockResolvedValue(user);
      jest
        .spyOn(prismaService.resetPasswordCode, 'findFirst')
        .mockResolvedValue({
          code: 123456,
          expiresAt: new Date(Date.now() + 10000),
          attempts: 0,
        } as any);

      const result = await service.isValid(
        { usernameOrEmail: 'test@example.com', code: '123456' },
        mockResponse,
      );
      expect(result).toEqual({ userId: '1', code: '123456' });
    });

    it('should throw if code does not match', async () => {
      const user = { id: '1', email: 'test@example.com' } as any;
      jest.spyOn(userService, 'findOne').mockResolvedValue(user);
      jest
        .spyOn(prismaService.resetPasswordCode, 'findFirst')
        .mockResolvedValue({
          code: 654321,
          expiresAt: new Date(Date.now() + 10000),
          attempts: 0,
        } as any);

      await expect(
        service.isValid(
          { usernameOrEmail: 'test@example.com', code: '123456' },
          mockResponse,
        ),
      ).rejects.toThrow();
    });
  });
});
