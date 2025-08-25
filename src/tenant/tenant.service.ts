import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';


@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto) {
   const isTenantExists = await this.prisma.tenant.findUnique({
      where: {
        name: createTenantDto.name,
      },
    });

    if (isTenantExists) throw new ConflictException('Tenant already exists'); // returns 409 Conflict

  const dbTenant = {
      name: createTenantDto.name,
      custom_domain: createTenantDto.custom_domain,
      plan_id: createTenantDto.plan_id,
  };

    return this.prisma.tenant.create({
      data: dbTenant,
      select: {
        id: true,
        name: true,
        custom_domain: true,
      },
    });
  }
  

  findAll() {
    return this.prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        custom_domain: true,
      },
     });
  }


   async findOne(id: string) {
    const foundTenant = await this.prisma.tenant.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        custom_domain: true,
        users: {
          select: {
            id: true,
            email: true,
            full_name: true,
            role: true,
          },
        },
     },
    });

    if (!foundTenant) throw new NotFoundException(`Tenant with ID ${id} not found`); // returns 404 Not Found

     return foundTenant;
   }

  async update(id: string, updateTenantDto: UpdateTenantDto) {
    // check if at least one field is provided for update
    if (!updateTenantDto.name && !updateTenantDto.custom_domain && !updateTenantDto.plan_id) {
      throw new ConflictException('No fields to update'); // returns 409 Conflict
    }

    // check if tenant exists
    const foundTenant = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!foundTenant) throw new NotFoundException(`Tenant with ID ${id} not found`); // returns 404 Not Found

    // TODO: Handle name already exists error

    // update tenant with provided fields
    const updatedTenant = await this.prisma.tenant.update({
      where: { id },
      data: updateTenantDto,
      select: {
        id: true,
        name: true,
        custom_domain: true,
      },
    });

    return {
      code: 200,
      message: 'Tenant updated successfully',
      data: updatedTenant,
    }
  }

  async remove(id: string) {
    // check if tenant exists
    const foundTenant = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!foundTenant) throw new NotFoundException(`Tenant with ID ${id} not found`); // returns 404 Not Found

    // delete tenant
    const deletedTenant = await this.prisma.tenant.delete({
      where: { id },
      select: {
        id: true,
        name: true,
        custom_domain: true,
      },
    });

    // TODO: Use response interceptors for this
    return {
      code: 200,
      message: 'Tenant deleted successfully',
      data: deletedTenant,
    } 
  }
}
