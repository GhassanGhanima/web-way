import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FaqService } from '../faq.service';
import { Faq } from '../entities/faq.entity';
import { CreateFaqDto } from '../dtos/create-faq.dto';
import { UpdateFaqDto } from '../dtos/update-faq.dto';
import { JwtAuthGuard } from '@app/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@app/modules/roles/guards/roles.guard';
import { PermissionsGuard } from '@app/modules/permissions/guards/permissions.guard';
import { Roles, Role } from '@app/common/decorators/roles.decorator';
import { Permissions, Permission } from '@app/common/decorators/permissions.decorator';

@ApiTags('faqs')
@Controller('faqs')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get()
  @Version('1')
  @ApiOperation({ summary: 'Get all FAQs' })
  @ApiResponse({
    status: 200,
    description: 'Returns all FAQs',
    type: [Faq],
  })
  findAll(@Query('published') published?: string): Promise<Faq[]> {
    const onlyPublished = published === 'true';
    return this.faqService.findAllFaqs(onlyPublished);
  }

  @Get(':id')
  @Version('1')
  @ApiOperation({ summary: 'Get FAQ by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns a FAQ by ID',
    type: Faq,
  })
  @ApiResponse({
    status: 404,
    description: 'FAQ not found',
  })
  findOne(@Param('id') id: string): Promise<Faq> {
    return this.faqService.findOneFaq(id);
  }

  @Post()
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @Permissions(Permission.FAQ_CREATE) // Change from 'faq:create' to Permission.FAQ_CREATE
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new FAQ' })
  @ApiResponse({
    status: 201,
    description: 'The FAQ has been successfully created',
    type: Faq,
  })
  create(@Body() createFaqDto: CreateFaqDto): Promise<Faq> {
    return this.faqService.createFaq(createFaqDto);
  }

  @Put(':id')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @Permissions(Permission.FAQ_UPDATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a FAQ' })
  @ApiResponse({
    status: 200,
    description: 'The FAQ has been successfully updated',
    type: Faq,
  })
  update(@Param('id') id: string, @Body() updateFaqDto: UpdateFaqDto): Promise<Faq> {
    return this.faqService.updateFaq(id, updateFaqDto);
  }

  @Delete(':id')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @Permissions(Permission.FAQ_DELETE) // Change from 'faq:delete' to Permission.FAQ_DELETE
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a FAQ' })
  @ApiResponse({
    status: 200,
    description: 'The FAQ has been successfully deleted',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.faqService.removeFaq(id);
  }

  @Put(':id/publish')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @Permissions(Permission.FAQ_UPDATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish a FAQ' })
  @ApiResponse({
    status: 200,
    description: 'The FAQ has been successfully published',
    type: Faq,
  })
  publish(@Param('id') id: string): Promise<Faq> {
    return this.faqService.setFaqPublishedStatus(id, true);
  }

  @Put(':id/unpublish')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @Permissions(Permission.FAQ_UPDATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unpublish a FAQ' })
  @ApiResponse({
    status: 200,
    description: 'The FAQ has been successfully unpublished',
    type: Faq,
  })
  unpublish(@Param('id') id: string): Promise<Faq> {
    return this.faqService.setFaqPublishedStatus(id, false);
  }

  @Post('reorder')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @Permissions(Permission.FAQ_UPDATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder FAQs in a category' })
  @ApiResponse({
    status: 200,
    description: 'The FAQs have been successfully reordered',
    type: [Faq],
  })
  reorder(
    @Body() data: { categoryId: string; faqIds: string[] }
  ): Promise<Faq[]> {
    return this.faqService.reorderFaqs(data.categoryId, data.faqIds);
  }

  @Get('product/:productType')
  @Version('1')
  @ApiOperation({ summary: 'Get FAQs by product type' })
  @ApiResponse({
    status: 200,
    description: 'Returns FAQs for a specific product type',
    type: [Faq],
  })
  getFaqsByProductType(@Param('productType') productType: string): Promise<Faq[]> {
    return this.faqService.findFaqsByProductType(productType);
  }

  @Post('product/:productId')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @Permissions(Permission.FAQ_CREATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a FAQ for a specific product' })
  @ApiResponse({
    status: 201,
    description: 'The FAQ has been successfully created for the product',
    type: Faq,
  })
  createProductFaq(
    @Param('productId') productId: string,
    @Body() createFaqDto: CreateFaqDto
  ): Promise<Faq> {
    return this.faqService.createProductFaq(productId, createFaqDto);
  }
}