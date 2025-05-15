import { Controller, Get, Version } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('default')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Version('1')
  @ApiOperation({ summary: 'Get greeting message' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns a greeting message',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' }
      }
    }
  })
  getHello(): { message: string } {
    return { message: this.appService.getHello() };
  }
}
