import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { PrismaService } from '../prisma/prisma.service';
import { TENANT_PUBLIC_SELECT, TENANT_WITH_USERS_SELECT } from './projections/tenant.projection';


@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) { }

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
      select: TENANT_PUBLIC_SELECT,
    });
  }

  findAll() {
    return this.prisma.tenant.findMany({
      select: TENANT_PUBLIC_SELECT,
    });
  }

  async findOne(id: string) {
    const foundTenant = await this.prisma.tenant.findUnique({
      where: { id },
      select: TENANT_WITH_USERS_SELECT,
    });

    if (!foundTenant)
      throw new NotFoundException(`Tenant with ID ${id} not found`); // returns 404 Not Found

    return foundTenant;
  }

  async update(id: string, input: UpdateTenantDto) {
    // check if at least one field is provided for update
    if (
      !input.name &&
      !input.custom_domain &&
      !input.plan_id
    ) {
      throw new ConflictException('No fields to update'); // returns 409 Conflict
    }

    // check if tenant name is being updated and if it already exists
    if (input.name) {
      const isTenantExists = await this.prisma.tenant.findUnique({
        where: {
          name: input.name,
        },
      });

      if (isTenantExists) {
        throw new ConflictException(`Tenant name '${input.name}' already exists`);
      }
    }

    // check if tenant exists
    const foundTenant = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!foundTenant)
      throw new NotFoundException(`Tenant with ID ${id} not found`); // returns 404 Not Found

    // update tenant with provided fields
    const updatedTenant = await this.prisma.tenant.update({
      where: { id },
      data: input,
      select: TENANT_PUBLIC_SELECT,
    });

    return updatedTenant;
  }

  async remove(id: string) {
    // check if tenant exists
    const foundTenant = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!foundTenant)
      throw new NotFoundException(`Tenant with ID ${id} not found`); // returns 404 Not Found

    // delete tenant
    const deletedTenant = await this.prisma.tenant.delete({
      where: { id },
      select: TENANT_PUBLIC_SELECT,
    });

    return deletedTenant;
  }
}
