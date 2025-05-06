import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserSeedService implements OnModuleInit {
  private readonly logger = new Logger(UserSeedService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    
    if (nodeEnv === 'development') {
      this.logger.log('Development environment detected, seeding admin user');
      await this.seedAdminUser();
    } else {
      this.logger.log(`Environment: ${nodeEnv}, skipping admin user seeding`);
    }
  }

  private async seedAdminUser() {
    try {
      // Check if admin user already exists using findByEmail
      const adminEmail = 'admin@example.com';
      const existingUser = await this.userRepository.findByEmail(adminEmail);
      
      if (existingUser) {
        this.logger.log('Admin user already exists, skipping seed');
        return;
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash('admin', 10);

      // Create the admin user
      const adminUser = await this.userRepository.create({
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        crm: 'ADMIN-001',
      });

      this.logger.log(`Admin user created with ID: ${adminUser._id}`);
    } catch (error) {
      this.logger.error('Failed to seed admin user:', error);
    }
  }
}
