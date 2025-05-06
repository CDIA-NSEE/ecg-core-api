import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../users/repositories/user.repository';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userRepository: UserRepository,
  ) {}

  async validateUser(email: string, pass: string): Promise<Partial<UserDocument> | null> {
    try {
      // Find user by email
      const user = await this.userRepository.findByEmail(email);
      
      if (!user) {
        return null;
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(pass, user.password);
      
      if (isPasswordValid) {
        // Remove password from returned user object
        const { password, ...result } = user.toObject();
        return result;
      }
      
      return null;
    } catch (error) {
      console.error('Error validating user:', error);
      return null;
    }
  }

  async login(user: any) {
    // Create payload for JWT
    const payload = { 
      email: user.email, 
      sub: user._id.toString(),
      name: user.name
    };
    
    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      access_token: this.jwtService.sign(payload),
    };
  }
  
  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
