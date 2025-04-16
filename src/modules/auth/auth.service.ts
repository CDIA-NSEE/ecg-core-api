import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../users/repositories/user.repository';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userRepository: UserRepository,
  ) {}

  async validateUser(username: string, pass: string): Promise<Partial<User> | null> {
    const user = await this.userRepository.findOne(username);
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
