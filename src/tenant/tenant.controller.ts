import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Tenant')
@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Tenant created successfully' })
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantService.create(createTenantDto);
  }

  @Get()
  @ApiOkResponse({ description: 'List of tenants retrieved successfully' })
  findAll() {
    return this.tenantService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Tenant retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.tenantService.findOne(id);
  }

  @Put(':id')
  @ApiOkResponse({ description: 'Tenant updated successfully' })
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantService.update(id, updateTenantDto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Tenant deleted successfully' })
  remove(@Param('id') id: string) {
    return this.tenantService.remove(id);
  }
}
