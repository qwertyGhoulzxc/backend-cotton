import { BadRequestException } from '@nestjs/common';
import validate from 'deep-email-validator';

export const validateEmail = async (email: string) => {
  const validation = await validate({
    email,
    validateSMTP: false,
  });

  if (!validation.valid)
    throw new BadRequestException(
      validation.validators[validation.reason].reason as string,
    );
};
