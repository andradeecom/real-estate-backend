import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../user/user-roles';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.SUPERADMIN)
@ApiTags('Tenant')
@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) { }

  @Post()
  @ResponseMessage('Tenant created successfully')
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantService.create(createTenantDto);
  }

  @Get()
  @ResponseMessage('Tenants fetched successfully')
  findAll() {
    return this.tenantService.findAll();
  }

  @Get(':id')
  @ResponseMessage('Tenant fetched successfully')
  findOne(@Param('id') id: string) {
    return this.tenantService.findOne(id);
  }

  @Put(':id')
  @ResponseMessage('Tenant updated successfully')
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantService.update(id, updateTenantDto);
  }

  @Delete(':id')
  @ResponseMessage('Tenant deleted successfully')
  remove(@Param('id') id: string) {
    return this.tenantService.remove(id);
  }
}
