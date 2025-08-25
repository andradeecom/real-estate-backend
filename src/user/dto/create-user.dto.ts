import { Role } from '../user-roles';
import { IsString, IsEmail, IsNotEmpty, MinLength, IsAlpha, IsUUID, IsOptional, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({required: true, example: 'john@gmail.com'})
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({required: true, example: 'Str0ngP@ssw0rd!'})
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      'Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number and one special character',
  })
  password: string;

  @ApiProperty({required: false})
  @IsOptional()
  @Matches(/^[A-Za-z\s]+$/, {
      message: 'Full name must contain only letters and spaces',
    })
  full_name?: string;

  @ApiProperty({required: false, enum: Role})
  role?: Role; // Default role is handled in the DB

  @ApiProperty({required: false})
  @IsOptional()
  @IsUUID()
  tenant_id?: string; // Optional, if user is created within a tenant context
}
