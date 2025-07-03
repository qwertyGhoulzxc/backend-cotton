import { ResetPasswordCode, User } from '@prisma/client';

export type UserWithResetPasswordCode = User & {
  resetPasswordCode: ResetPasswordCode;
};
