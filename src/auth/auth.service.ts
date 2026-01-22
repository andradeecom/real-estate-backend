import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma/prisma.service';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET;
  private readonly jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
  private readonly jwtExpiresIn = process.env.JWT_EXPIRES_IN;
  private readonly jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN;

  constructor(
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) { }

  // Type this return
  async signIn(input: SignInDto) {
    // Deconstruct the DTO
    const { email, password } = input;

    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await this.userService.verifyPassword(
      password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    if (
      !this.jwtSecret ||
      !this.jwtRefreshSecret ||
      !this.jwtExpiresIn ||
      !this.jwtRefreshExpiresIn
    ) {
      throw new Error('JWT secrets are not configured');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = await this.generateToken(
      this.jwtSecret,
      payload,
      this.jwtExpiresIn,
    );
    const refreshToken = await this.generateToken(
      this.jwtRefreshSecret,
      payload,
      this.jwtRefreshExpiresIn,
    );

    return {
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          tenant_id: user.tenant_id,
        },
        accessToken,
        refreshToken,
      },
    };
  }

  // Type this return
  async signUp(input: SignUpDto) {
    const { email, password, full_name, role, tenant_id } = input;

    // Check if the user already exists --> This is handled by the UserService.create
    // Hash the password --> This is handled by the UserService.create
    // Create a new user --> This is handled by the UserService.create
    const newUser = await this.userService.create({
      email,
      password,
      full_name,
      role,
      tenant_id,
    });

    return {
      data: {
        newUser,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    if (
      !this.jwtRefreshSecret ||
      !this.jwtSecret ||
      !this.jwtExpiresIn ||
      !this.jwtRefreshExpiresIn
    ) {
      throw new Error('JWT secrets are not configured');
    }

    const verifiedToken = await this.verifyToken(
      this.jwtRefreshSecret,
      refreshToken,
    );

    if (!verifiedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Ensure we include the latest user role in the token payload
    const currentUser = await this.userService.findOne(verifiedToken.sub);
    const payload = { sub: currentUser.id, email: currentUser.email, role: currentUser.role };

    // Generate both new access token and new refresh token (token rotation)
    const newAccessToken = await this.generateToken(
      this.jwtSecret,
      payload,
      this.jwtExpiresIn,
    );

    const newRefreshToken = await this.generateToken(
      this.jwtRefreshSecret,
      payload,
      this.jwtRefreshExpiresIn,
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async generateToken(
    secret: string,
    payload: Record<string, any>,
    expiresIn: string,
  ) {
    return await this.jwtService.signAsync(payload, {
      expiresIn,
      secret,
    });
  }

  async verifyToken(secret: string, token: string) {
    return this.jwtService.verifyAsync(token, { secret });
  }
}
