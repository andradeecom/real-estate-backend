import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { SignInDto } from './signin.dto';
import { Role } from 'src/user/user-roles';

export class SignUpDto extends SignInDto {
  @IsString()
  @IsOptional()
  full_name: string;

  @IsString()
  @IsOptional()
  @IsEnum(Role)
  role: Role;

  @IsString()
  @IsOptional()
  @IsUUID()
  tenant_id: string;
}
