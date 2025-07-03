import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
type SendMail = {
  to: string;
  subject?: string;
  template: 'activation' | 'reset-password';
  context: unknown;
};
@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendMail(data: SendMail) {
    const { context, subject, template, to } = data;
    return this.mailerService.sendMail({
      to,
      subject,
      template,
      context,
    });
  }

  async sendActivationMail(to: string, code: number) {
    return this.sendMail({
      to,
      subject: 'Activate your account',
      template: 'activation',
      context: { code },
    });
  }

  async sendResetPasswordCodeEmail(to, code) {
    return this.sendMail({
      to,
      subject: 'Reset your password',
      template: 'reset-password',
      context: { code },
    });
  }
}
