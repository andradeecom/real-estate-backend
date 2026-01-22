import { Test, TestingModule } from '@nestjs/testing';
import { TenantService } from './tenant.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TenantService', () => {
  let service: TenantService;

  beforeEach(async () => {
    mockPrisma = {
      tenant: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        // Mock PrismaService
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const createTenantDto = {
    name: 'Test Tenant',
    custom_domain: 'test.tenant.com',
    plan_id: 'FREE',
  };

  const updateTenantDto = {
    name: 'Updated Tenant',
    custom_domain: 'updated.tenant.com',
    plan_id: 'PAID',
  };

  describe('create', () => {
    it('should create a tenant', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue(null); // Simulate no existing tenant
      mockPrisma.tenant.create.mockResolvedValue({
        id: 'tenant123',
        name: createTenantDto.name,
        custom_domain: createTenantDto.custom_domain,
      });

      const result = await service.create(createTenantDto);

      expect(result).toEqual({
        id: 'tenant123',
        name: createTenantDto.name,
        custom_domain: createTenantDto.custom_domain,
      });

      expect(mockPrisma.tenant.findUnique).toHaveBeenCalledWith({
        where: { name: createTenantDto.name },
      });
      expect(mockPrisma.tenant.create).toHaveBeenCalledWith({
        data: {
          name: createTenantDto.name,
          custom_domain: createTenantDto.custom_domain,
          plan_id: createTenantDto.plan_id,
        },
        select: {
          id: true,
          name: true,
          custom_domain: true,
        },
      });
    });

    it('should throw ConflictException if tenant already exists', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue({ id: 'existingTenant' });
      await expect(service.create(createTenantDto)).rejects.toThrow(
        'Tenant already exists',
      );
      expect(mockPrisma.tenant.findUnique).toHaveBeenCalledWith({
        where: { name: createTenantDto.name },
      });
      expect(mockPrisma.tenant.create).not.toHaveBeenCalled();
    });
  });
});
