import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma/prisma.service';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (!user || !(await this.userService.comparePassword(password, user.password_hash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async signin(SignInDto) {

    // Deconstruct the DTO
    const { email, password } = SignInDto;

    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload, {expiresIn: '1h'});
    const refreshToken = await this.jwtService.signAsync(payload, {expiresIn: '7d', secret: process.env.JWT_REFRESH_SECRET});
  
    return { accessToken, refreshToken }; 
  }

  async signup(SignUpDto) {
    const { email, password } = SignUpDto;
    // Create a new user
    const newUser = await this.userService.create({
      email,
      password, // Ensure to hash the password in the user service
    });
    return newUser;

  }

  async refreshToken(refreshToken: string) {
    const payload = await this.jwtService.verifyAsync(refreshToken, {
    secret: process.env.JWT_REFRESH_SECRET,
    });

    const newAccessToken = await this.jwtService.signAsync(
      { sub: payload.sub, email: payload.email },
      { expiresIn: '1h' },
    );

    return { accessToken: newAccessToken };
    
  }

}
