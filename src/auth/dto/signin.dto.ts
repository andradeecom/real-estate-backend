import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import {
  PASSWORD_PATTERN,
  VALIDATION_MESSAGES,
} from 'src/utils/validators/validation-patterns';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({required: true, example: 'johnDoe@gmail.com'})
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(PASSWORD_PATTERN, { message: VALIDATION_MESSAGES.PASSWORD })
  @ApiProperty({required: true, example: 'Password123!'})
  password: string;
}
