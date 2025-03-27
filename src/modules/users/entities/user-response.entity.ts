import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../shared/common/entities/base.entity';
import { UserDocument } from '../schemas/user.schema';

export class UserResponseEntity extends BaseEntity {
  @ApiProperty({ description: 'The unique identifier of the user' })
  id: string;

  @ApiProperty({ description: 'The username of the user' })
  name: string;

  @ApiProperty({ description: 'The email of the user' })
  email: string;

  @ApiProperty({ description: 'The password of the user' })
  password?: string;

  @ApiProperty({ description: 'The CRM of the user' })
  crm: string;

  @ApiProperty({ description: 'Whether the user is deleted (soft delete)' })
  deletedAt?: Date;

  @ApiProperty({ description: 'The creation date of the user' })
  createdAt: Date;

  @ApiProperty({ description: 'The last update date of the user' })
  updatedAt: Date;

  constructor(partial?: Partial<UserResponseEntity>) {
    super(partial);
    if (partial) {
      Object.assign(this, partial);
    }
  }

  static fromEntity(user: UserDocument): UserResponseEntity {
    return new UserResponseEntity({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      password: user.password,
      crm: user.crm,
      deletedAt: user.deletedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  static fromEntities(users: UserDocument[]): UserResponseEntity[] {
    return users.map((user) => UserResponseEntity.fromEntity(user));
  }
}
