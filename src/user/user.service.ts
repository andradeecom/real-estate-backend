import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt'; // Import bcrypt for password hashing
import { ConfigService } from '@nestjs/config'; // Import ConfigService to access environment variables


@Injectable()
export class UserService {
  private readonly saltOrRounds: number; // Number of salt rounds for bcrypt

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService, // Inject ConfigService for environment variables
  ) {
    const raw = this.configService.get<string>('BCRYPT_SALT_ROUNDS') || 10; // Default to 10 if not set
    const rounds = Number(raw);
    if (isNaN(rounds) || rounds < 4 || rounds > 15) {
      throw new Error(`Invalid BCRYPT_SALT_ROUNDS value: ${raw}. It must be a positive integer between 4 and 15.`);
    }
    this.saltOrRounds = rounds; // Set the salt rounds for bcrypt
    console.log(`BCRYPT_SALT_ROUNDS set to: ${this.saltOrRounds}`); // Log the salt rounds for debugging
  }


  async create(createUserDto: CreateUserDto) {
    const isUserExists = await this.prisma.user.findUnique({
      where: {
        email: createUserDto.email,
      },
    });

    if (isUserExists) throw new ConflictException('User already exists'); // returns 409 Conflict

    const hashedPassword = await bcrypt.hash(createUserDto.password, this.saltOrRounds);

    const {email, full_name, role, tenant_id} = createUserDto;
    const dbUser: Prisma.UserCreateInput = {
      email: email,
      password_hash: hashedPassword,
    };

    // Include only if they exist, handling typescript's strict null checks
    if (full_name) dbUser.full_name = full_name;
    if (role) dbUser.role = role;
    if (tenant_id) {
      dbUser.tenant = {
        connect: { id: tenant_id },
      };
    }


    return this.prisma.user.create({
      data: dbUser,
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        tenant_id: true, // Optional, if user is created within a tenant context
      },
    });
  }

  findAll() {
    // Returns array of User objects --> User[]
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
      }
    });
  }

  async findOne(id: string) {
    const foundUser = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        tenant_id: true,
      },
    });

    if (!foundUser) throw new NotFoundException('User not found'); // returns 404 Not Found

    return foundUser;
  }

  async findByEmail(email: string) {
    const foundUser = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        tenant_id: true, // Optional, if user is created within a tenant context
        password_hash: true,
      },
    });
    if (!foundUser) throw new NotFoundException('User not found'); // returns 404 Not Found
    return foundUser;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {

    // Check if at least one field is provided for update
    if (!updateUserDto.email && !updateUserDto.full_name && !updateUserDto.role && !updateUserDto.tenant_id) {
      throw new ConflictException('No fields to update'); // returns 409 Conflict
    }

    // Check if user exists
    const foundUser = await this.prisma.user.findUnique({
      where: { id },
      });

    if (!foundUser) throw new NotFoundException('User not found'); // returns 404 Not Found

    // Update user with provided fields
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        tenant_id: true,
      },
    });

    // TODO: Use response interceptors wrapping the responses with codes and messages for all successful reaponses
    return {
      code: 200,
      message: 'User updated successfully',
      data: updatedUser
    }
  }

  async remove(id: string) {
    // Check if user exists
    const foundUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!foundUser) throw new NotFoundException('User not found'); // returns 404 Not Found

    // Delete user
    const deletedUser = await this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
      },
    });

    // TODO: Use response interceptors for this
    return {
      code: 200,
      message: 'User deleted successfully',
      data: deletedUser,
    }
  }

  async comparePassword(plainTextPassword: string, hashedPassword: string) {
  // Compare plain text password with hashed password
  return bcrypt.compare(plainTextPassword, hashedPassword);
  }

}
