import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UserService', () => {
  let service: UserService;
  let mockPrisma: any;


  beforeEach(async () => {
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        // Mock PrismaService
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const createUserDto = {
    email: 'testing@example.ex',
    password: 'Password123',
    full_name: 'Test User',
    role: 'USER',
    tenant_id: 'tenant123',
  };

  const updateUserDto = {
    email: 'update@example.ex',
    full_name: 'Updated User',
    role: 'ADMIN',
    tenant_id: 'updatedTenant123',
  };

  describe('create', () => {
    it('should create a user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null); // Simulate no existing user
      mockPrisma.user.create.mockResolvedValue({
        id: 'user123',
        email: createUserDto.email,
        full_name: createUserDto.full_name,
        role: createUserDto.role,
        tenant_id: createUserDto.tenant_id,
      });

      const result = await service.create(createUserDto);

      expect(result).toEqual({
        id: 'user123',
        email: createUserDto.email,
        full_name: createUserDto.full_name,
        role: createUserDto.role,
        tenant_id: createUserDto.tenant_id,
      });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: createUserDto.email,
          password_hash: createUserDto.password, // This should be hashed in real implementation
          full_name: createUserDto.full_name,
          role: createUserDto.role,
          tenant_id: createUserDto.tenant_id,
        },
        select: {
          id: true,
          email: true,
          full_name: true,
          role: true,
          tenant_id: true, // Optional, if user is created within a tenant context
        },
      });

    });

    it('should throw an error if user already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existingUser' }); // Simulate existing user
      await expect(service.create(createUserDto)).rejects.toThrow('User already exists');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
        });
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const existingUser = createUserDto;
      existingUser.id = 'user123';
      mockPrisma.user.findUnique.mockResolvedValue(existingUser); // Simulate existing user
      mockPrisma.user.update.mockResolvedValue({
          id: existingUser.id,
          email: updateUserDto.email,
          full_name: updateUserDto.full_name,
          role: updateUserDto.role,
          tenant_id: updateUserDto.tenant_id,
      });
      const result = await service.update(existingUser.id, updateUserDto);
      expect(result).toEqual({
        code: 200,
        message: 'User updated successfully',
        data: {
          id: existingUser.id,
          email: updateUserDto.email,
          full_name: updateUserDto.full_name,
          role: updateUserDto.role,
          tenant_id: updateUserDto.tenant_id,
        }
      });
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: existingUser.id },
      });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: existingUser.id },
        data: {
          email: updateUserDto.email,
          full_name: updateUserDto.full_name,
          role: updateUserDto.role,
          tenant_id: updateUserDto.tenant_id,
        },
        select: {
          id: true,
          email: true,
          full_name: true,
          role: true,
          tenant_id: true, // Optional, if user is created within a tenant context
        },
      });
    });

    it('should throw an error if user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null); // Simulate no existing user
      await expect(service.update('nonExistentId', updateUserDto)).rejects.toThrow('User not found');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonExistentId' },
      });
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });
  });
});
