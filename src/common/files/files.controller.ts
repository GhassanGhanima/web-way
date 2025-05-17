import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Query,
    UseGuards,
    UploadedFile,
    UseInterceptors,
    Res,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
    StreamableFile,
    Version,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
  import { JwtAuthGuard } from '@app/modules/auth/guards/jwt-auth.guard';
  import { RolesGuard } from '@app/modules/roles/guards/roles.guard';
  import { Roles, Role } from '@app/common/decorators/roles.decorator';
  import { FilesService } from './files.service';
  import { Response } from 'express';
  import * as path from 'path';
  
  // Add missing Multer type
  import { Multer } from 'multer';
  
  // Alternative fix if the above import doesn't work
  // The Express namespace should be augmented
  declare global {
    namespace Express {
      interface Multer {
        File: {
          fieldname: string;
          originalname: string;
          encoding: string;
          mimetype: string;
          size: number;
          destination: string;
          filename: string;
          path: string;
          buffer: Buffer;
        }
      }
    }
  }
  
  @ApiTags('files')
  @Controller('files')
  export class FilesController {
    constructor(private readonly filesService: FilesService) {}
  
    @Post('upload')
    @Version('1')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload a file' })
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
          subdir: {
            type: 'string',
            description: 'Subdirectory to store the file in',
          },
        },
      },
    })
    @ApiResponse({
      status: 201,
      description: 'The file has been successfully uploaded',
    })
    async uploadFile(
      @UploadedFile(
        new ParseFilePipe({
          validators: [
            new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
            new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|pdf)$/ }),
          ],
        }),
      )
      file: Express.Multer["File"],
      @Query('subdir') subdir?: string,
    ): Promise<{ filePath: string }> {
      const filePath = await this.filesService.uploadFile(file, subdir);
      return { filePath };
    }
  
    @Get(':path')
    @Version('1')
    @ApiOperation({ summary: 'Get a file by path' })
    @ApiResponse({
      status: 200,
      description: 'Returns the requested file',
    })
    async getFile(
      @Param('path') filePath: string,
      @Res({ passthrough: true }) response: Response,
    ): Promise<StreamableFile> {
      const file = await this.filesService.getFile(filePath);
      
      // Determine content type from path
      const contentType = this.getContentType(filePath);
      response.set({
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${path.basename(filePath)}"`,
      });
      
      return new StreamableFile(file);
    }
  
    @Delete(':path')
    @Version('1')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a file' })
    @ApiResponse({
      status: 200,
      description: 'The file has been successfully deleted',
    })
    async deleteFile(@Param('path') filePath: string): Promise<{ success: boolean }> {
      const result = await this.filesService.deleteFile(filePath);
      return { success: result };
    }
  
    @Get()
    @Version('1')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'List files in a directory' })
    @ApiResponse({
      status: 200,
      description: 'Returns a list of files',
    })
    async listFiles(@Query('subdir') subdir?: string): Promise<{ files: string[] }> {
      const files = await this.filesService.listFiles(subdir);
      return { files };
    }
  
    private getContentType(filePath: string): string {
      const ext = path.extname(filePath).toLowerCase();
      
      switch (ext) {
        case '.jpg':
        case '.jpeg':
          return 'image/jpeg';
        case '.png':
          return 'image/png';
        case '.gif':
          return 'image/gif';
        case '.pdf':
          return 'application/pdf';
        default:
          return 'application/octet-stream';
      }
    }
  }