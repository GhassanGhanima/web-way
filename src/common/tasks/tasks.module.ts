import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SubscriptionsModule } from '@app/modules/subscriptions/subscriptions.module';
import { EmailModule } from '../email/email.module';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    SubscriptionsModule,
    EmailModule,
  ],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
