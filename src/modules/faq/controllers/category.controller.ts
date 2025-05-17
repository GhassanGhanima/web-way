import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FaqService } from '../faq.service';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from '../dtos/create-category.dto';
import { UpdateCategoryDto } from '../dtos/update-category.dto';
import { JwtAuthGuard } from '@app/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@app/modules/roles/guards/roles.guard';
import { PermissionsGuard } from '@app/modules/permissions/guards/permissions.guard';
import { Roles, Role } from '@app/common/decorators/roles.decorator';
import { Permissions, Permission } from '@app/common/decorators/permissions.decorator';

@ApiTags('faq-categories')
@Controller('faq-categories')
export class CategoryController {
  constructor(private readonly faqService: FaqService) {}

  @Get()
  @Version('1')
  @ApiOperation({ summary: 'Get all FAQ categories' })
  @ApiResponse({
    status: 200,
    description: 'Returns all FAQ categories',
    type: [Category],
  })
  findAll(): Promise<Category[]> {
    return this.faqService.findAllCategories();
  }

  @Get(':id')
  @Version('1')
  @ApiOperation({ summary: 'Get FAQ category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns a FAQ category by ID',
    type: Category,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  findOne(@Param('id') id: string): Promise<Category> {
    return this.faqService.findOneCategory(id);
  }

  @Post()
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @Permissions(Permission.FAQ_CREATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new FAQ category' })
  @ApiResponse({
    status: 201,
    description: 'The FAQ category has been successfully created',
    type: Category,
  })
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.faqService.createCategory(createCategoryDto);
  }

  @Put(':id')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @Permissions(Permission.FAQ_UPDATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a FAQ category' })
  @ApiResponse({
    status: 200,
    description: 'The FAQ category has been successfully updated',
    type: Category,
  })
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    return this.faqService.updateCategory(id, updateCategoryDto);
  }

  @Delete(':id')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @Permissions(Permission.FAQ_DELETE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a FAQ category' })
  @ApiResponse({
    status: 200,
    description: 'The FAQ category has been successfully deleted',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete category with FAQs',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.faqService.removeCategory(id);
  }

  @Post('reorder')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @Permissions(Permission.FAQ_UPDATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder FAQ categories' })
  @ApiResponse({
    status: 200,
    description: 'The FAQ categories have been successfully reordered',
    type: [Category],
  })
  reorder(
    @Body() data: { categoryIds: string[] }
  ): Promise<Category[]> {
    return this.faqService.reorderCategories(data.categoryIds);
  }
}