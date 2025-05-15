import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly uploadDir: string;
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: string[];

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get<string>('FILES_UPLOAD_DIR', 'uploads');
    this.maxFileSize = this.configService.get<number>('FILES_MAX_SIZE', 5 * 1024 * 1024); // Default 5MB
    this.allowedMimeTypes = this.configService.get<string>('FILES_ALLOWED_TYPES', 'image/jpeg,image/png,image/gif,application/pdf')
      .split(',');
    
    // Ensure upload directory exists
    this.ensureUploadDirExists();
  }

  private async ensureUploadDirExists() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      this.logger.error(`Failed to create upload directory: ${error.message}`, error.stack);
      throw error;
    }
  }

  async uploadFile(file: Express.Multer["File"], subdir: string = ''): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(`File too large. Maximum size is ${this.maxFileSize / 1024 / 1024}MB`);
    }
    
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`);
    }
    
    try {
      // Create a unique filename
      const fileHash = crypto.createHash('md5').update(file.originalname + Date.now()).digest('hex');
      const fileExt = path.extname(file.originalname);
      const fileName = `${fileHash}${fileExt}`;
      
      // Create subdirectory if needed
      const uploadPath = subdir ? path.join(this.uploadDir, subdir) : this.uploadDir;
      await fs.mkdir(uploadPath, { recursive: true });
      
      // Write the file
      const filePath = path.join(uploadPath, fileName);
      await fs.writeFile(filePath, file.buffer);
      
      // Return the relative path
      return subdir ? `${subdir}/${fileName}` : fileName;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to upload file');
    }
  }

  async getFile(filePath: string): Promise<Buffer> {
    try {
      const fullPath = path.join(this.uploadDir, filePath);
      return await fs.readFile(fullPath);
    } catch (error) {
      this.logger.error(`Failed to get file: ${error.message}`, error.stack);
      throw new NotFoundException('File not found');
    }
  }

  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.uploadDir, filePath);
      await fs.unlink(fullPath);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
      return false;
    }
  }

  async listFiles(subdir: string = ''): Promise<string[]> {
    try {
      const dirPath = subdir ? path.join(this.uploadDir, subdir) : this.uploadDir;
      const files = await fs.readdir(dirPath);
      return files;
    } catch (error) {
      this.logger.error(`Failed to list files: ${error.message}`, error.stack);
      return [];
    }
  }
}
