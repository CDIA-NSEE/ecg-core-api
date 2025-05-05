import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserSeedService implements OnModuleInit {
  private readonly logger = new Logger(UserSeedService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  private async seedAdminUser() {
    try {
      // Check if admin user already exists
      const existingUsers = await this.userRepository.findAll({ email: 'admin@example.com' });
      
      if (existingUsers.length > 0) {
        this.logger.log('Admin user already exists, skipping seed');
        return;
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash('admin', 10);

      // Create the admin user
      const adminUser = await this.userRepository.create({
        name: 'Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        crm: 'ADMIN-001',
      });

      this.logger.log(`Admin user created with ID: ${adminUser._id}`);
    } catch (error) {
      this.logger.error('Failed to seed admin user:', error);
    }
  }
}
