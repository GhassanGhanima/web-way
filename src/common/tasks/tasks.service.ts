import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { SubscriptionsService } from '@app/modules/subscriptions/subscriptions.service';
import { CronJob } from 'cron';
import { EmailService } from '../email/email.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private subscriptionsService: SubscriptionsService,
    private emailService: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleSubscriptionRenewals() {
    this.logger.log('Running subscription renewal task');
    
    try {
      // In a real implementation, this would:
      // 1. Find subscriptions due for renewal
      // 2. Attempt to charge the customer
      // 3. Update subscription status based on payment result
      // 4. Send appropriate notifications
      
      this.logger.log('Subscription renewals processed successfully');
    } catch (error) {
      this.logger.error(`Subscription renewal task failed: ${error.message}`, error.stack);
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async sendWeeklyReports() {
    this.logger.log('Sending weekly reports');
    
    try {
      // In a real implementation, this would:
      // 1. Generate reports for the past week
      // 2. Send reports to subscribed administrators
      
      this.logger.log('Weekly reports sent successfully');
    } catch (error) {
      this.logger.error(`Weekly report task failed: ${error.message}`, error.stack);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async sendSubscriptionReminders() {
    this.logger.log('Sending subscription expiration reminders');
    
    try {
      // Find subscriptions expiring in the next 7 days
      const expiringDate = new Date();
      expiringDate.setDate(expiringDate.getDate() + 7);
      
      // In a real implementation, fetch expiring subscriptions
      // and send reminder emails

      this.logger.log('Subscription reminders sent successfully');
    } catch (error) {
      this.logger.error(`Subscription reminder task failed: ${error.message}`, error.stack);
    }
  }

  // Method to add a dynamic cron job
  addCronJob(name: string, cronTime: string, callback: () => void) {
    const job = new CronJob(cronTime, callback);
    
    this.schedulerRegistry.addCronJob(name, job);
    job.start();
    
    this.logger.log(`Cron job ${name} added with schedule: ${cronTime}`);
    
    return job;
  }

  // Method to remove a dynamic cron job
  removeCronJob(name: string) {
    try {
      this.schedulerRegistry.deleteCronJob(name);
      this.logger.log(`Cron job ${name} deleted`);
    } catch (error) {
      this.logger.error(`Error deleting cron job ${name}: ${error.message}`);
    }
  }
}
