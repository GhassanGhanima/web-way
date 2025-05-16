import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService, DiskHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';
import { TypeOrmHealthIndicator } from './indicators/typeorm.health';
import * as os from 'os';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check system health' })
  check() {
    // Get platform-appropriate disk path
    const diskPath = os.platform() === 'win32' ? 'C:\\' : '/';
    
    return this.health.check([
      // Database health check
      () => this.db.pingCheck('database'),
      
      // Disk storage check - ensure we have at least 25% free space
      () => this.disk.checkStorage('storage', { path: diskPath, thresholdPercent: 0.75 }),
      
      // Memory heap check - ensure we're not using more than 75% of heap
      () => this.memory.checkHeap('memory_heap', 250 * 1024 * 1024),
      
      // RSS memory check - ensure we're not using more than 75% of RSS memory
      () => this.memory.checkRSS('memory_rss', 250 * 1024 * 1024),
    ]);
    
  }
}