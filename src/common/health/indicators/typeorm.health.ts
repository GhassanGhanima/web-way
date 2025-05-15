import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class TypeOrmHealthIndicator extends HealthIndicator {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {
    super();
  }

  async pingCheck(key: string): Promise<HealthIndicatorResult> {
    try {
      // Try to ping database with a raw query
      await this.dataSource.query('SELECT 1');
      
      return this.getStatus(key, true, { message: 'Database connection is healthy' });
    } catch (error) {
      throw new HealthCheckError(
        'TypeORM health check failed',
        this.getStatus(key, false, { message: error.message }),
      );
    }
  }
}
