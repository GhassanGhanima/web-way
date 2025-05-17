import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaqController } from './controllers/faq.controller';
import { CategoryController } from './controllers/category.controller';
import { FaqService } from './faq.service';
import { Faq } from './entities/faq.entity';
import { Category } from './entities/category.entity';
import { AuthModule } from '../auth/auth.module';
import { RolesModule } from '../roles/roles.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Faq, Category]),
    AuthModule,
    RolesModule,
    PermissionsModule,
  ],
  controllers: [FaqController, CategoryController],
  providers: [FaqService],
  exports: [FaqService],
})
export class FaqModule {}