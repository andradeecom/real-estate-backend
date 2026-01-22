import { Role } from '../user-roles';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  Matches,
  IsEnum,
} from 'class-validator';
import {
  PASSWORD_PATTERN,
  FULL_NAME_PATTERN,
  VALIDATION_MESSAGES,
} from 'src/utils/validators/validation-patterns';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ required: true, example: 'john@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ required: true, example: 'Str0ngP@ssw0rd!' })
  @IsString()
  @IsNotEmpty()
  @Matches(PASSWORD_PATTERN, { message: VALIDATION_MESSAGES.PASSWORD })
  password: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Matches(FULL_NAME_PATTERN, { message: VALIDATION_MESSAGES.FULL_NAME })
  full_name: string;

  @IsOptional()
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  tenant_id: string; // Optional, if user is created within a tenant context
}
