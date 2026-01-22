import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { USER_PUBLIC_SELECT, USER_AUTH_SELECT } from './projections/user.projection';
import { Prisma, $Enums } from '@prisma/client';
import { ConfigService } from '@nestjs/config';


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


  async create(input: CreateUserDto) {
    /**
    * - Validate user input (handled by class-validator)
    * - Check if user already exists
    * - Hash password
    * - Create user
    */

    // Check if user already exists
    const isUserExists = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (isUserExists) throw new ConflictException('User already exists');

    // Hash password
    const hashedPassword = await this.hashPassword(input.password);

    const { email, full_name, role, tenant_id } = input;

    return await this.prisma.user.create({
      data: {
        email,
        full_name,
        role,
        tenant_id,
        password_hash: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        tenant_id: true,
      },
    });
  }

  async findAll() {
    return await this.prisma.user.findMany({
      select: USER_PUBLIC_SELECT,
    });
  }

  async findOne(id: string) {
    const foundUser = await this.prisma.user.findUnique({
      where: { id },
      select: USER_PUBLIC_SELECT,
    });

    if (!foundUser) throw new NotFoundException('User not found');

    return foundUser;
  }

  async findByEmail(email: string) {
    const foundUser = await this.prisma.user.findUnique({
      where: { email },
      select: USER_AUTH_SELECT,
    });
    if (!foundUser) throw new NotFoundException('User not found');
    return foundUser;
  }

  async update(id: string, input: UpdateUserDto) {
    // Check if at least one field is provided for update
    if (
      input.email === undefined &&
      input.full_name === undefined &&
      input.role === undefined &&
      input.tenant_id === undefined
    ) {
      throw new ConflictException('No fields to update');
    }

    // If email is being updated, check if it already exists
    if (input.email) {
      const isUserExists = await this.prisma.user.findUnique({
        where: {
          email: input.email,
        },
      });

      if (isUserExists) {
        throw new ConflictException(`User email '${input.email}' already exists`);
      }
    }

    // If email is being updated, check it doesn't already exist
    if (input.email) {
      const existingUserEmail = await this.prisma.user.findUnique({
        where: { email: input.email },
      })

      if (existingUserEmail) {
        throw new ConflictException(`User email '${input.email}' already exists`);
      }
    }

    // Check if user exists
    const foundUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!foundUser) throw new NotFoundException('User not found'); // returns 404 Not Found

    // Update user with provided fields
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: input,
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        tenant_id: true,
      },
    });

    return updatedUser;
  }

  async remove(id: string) {
    // Check if user exists
    const foundUser = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!foundUser) throw new NotFoundException('User not found');

    // Delete user
    const deletedUser = await this.prisma.user.delete({
      where: { id },
      select: USER_PUBLIC_SELECT,
    });

    return deletedUser;
  }

  async hashPassword(password: string) {

    const saltOrRounds = Number(process.env.BCRYPT_SALT_ROUNDS);
    if (isNaN(saltOrRounds) || saltOrRounds < 4 || saltOrRounds > 15) {
      throw new Error(
        `Invalid BCRYPT_SALT_ROUNDS value: ${saltOrRounds}. It must be a positive integer between 4 and 15.`,
      );
    }
    return await bcrypt.hash(password, saltOrRounds);
  }

  async verifyPassword(plainTextPassword: string, hashedPassword: string) {
    return await bcrypt.compare(plainTextPassword, hashedPassword);
  }
}
