import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailTemplateService } from './email-template.service';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  template?: string;
  context?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content?: any;
    path?: string;
    contentType?: string;
  }>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    private emailTemplateService: EmailTemplateService,
  ) {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    const host = this.configService.get<string>('EMAIL_HOST');
    const port = this.configService.get<number>('EMAIL_PORT');
    const user = this.configService.get<string>('EMAIL_USER');
    const pass = this.configService.get<string>('EMAIL_PASSWORD');
    const secure = this.configService.get<boolean>('EMAIL_SECURE', false);

    // Create transporter
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });

    // Verify connection configuration
    try {
      await this.transporter.verify();
      this.logger.log('Email service ready');
    } catch (error) {
      this.logger.error(`Failed to initialize email transport: ${error.message}`, error.stack);
      
      // In development, use a test account
      if (this.configService.get('NODE_ENV') === 'development') {
        this.logger.log('Creating test account for development');
        const testAccount = await nodemailer.createTestAccount();
        
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        
        this.logger.log('Test email account created successfully');
      }
    }
  }

  async sendMail(options: EmailOptions): Promise<boolean> {
    try {
      const { to, subject, text, html, template, context, attachments } = options;
      
      let htmlContent = html;
      
      // If template is provided, render it
      if (template && context) {
        htmlContent = this.emailTemplateService.renderTemplate(template, context);
      }
      
      const from = this.configService.get<string>('EMAIL_FROM');
      
      const mailOptions = {
        from,
        to,
        subject,
        text,
        html: htmlContent,
        attachments,
      };
      
      const info = await this.transporter.sendMail(mailOptions);
      
      this.logger.log(`Email sent: ${info.messageId}`);
      
      // Log ethereal URL in development mode
      if (this.configService.get('NODE_ENV') === 'development') {
        this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      return false;
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    return this.sendMail({
      to: email,
      subject: 'Welcome to Accessibility Tool',
      template: 'welcome',
      context: {
        name,
        loginUrl: `${this.configService.get('APP_URL')}/login`,
      },
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    const resetUrl = `${this.configService.get('APP_URL')}/reset-password?token=${token}`;
    
    return this.sendMail({
      to: email,
      subject: 'Password Reset Request',
      template: 'password-reset',
      context: {
        resetUrl,
        expiresIn: '1 hour',
      },
    });
  }

  async sendSubscriptionConfirmation(email: string, planName: string): Promise<boolean> {
    return this.sendMail({
      to: email,
      subject: 'Subscription Confirmation',
      template: 'subscription-confirmation',
      context: {
        planName,
        dashboardUrl: `${this.configService.get('APP_URL')}/dashboard`,
      },
    });
  }
}
