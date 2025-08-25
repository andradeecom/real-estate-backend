import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({required: true, example: 'johnDoe@gmail.com'})
  @IsEmail()
  email: string;

  @ApiProperty({required: true, example: 'Password123!'})
  password: string;
}
