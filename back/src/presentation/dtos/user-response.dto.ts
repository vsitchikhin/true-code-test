import { ApiProperty } from '@nestjs/swagger';

import { User } from '@domain/entities/user.entity';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty({ type: 'string', required: false, nullable: true })
  firstName: string | null;

  @ApiProperty({ type: 'string', required: false, nullable: true })
  lastName: string | null;

  @ApiProperty({ type: 'string', required: false, nullable: true })
  bio: string | null;

  @ApiProperty({ type: 'string', required: false, nullable: true })
  avatarPath: string | null;

  @ApiProperty({ type: 'string', required: false, nullable: true })
  birthDate: string | null;

  @ApiProperty()
  createdAt: Date;

  static fromDomain(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.username = user.username;
    dto.phoneNumber = user.phoneNumber;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.bio = user.bio;
    dto.avatarPath = user.avatarPath;
    dto.birthDate = user.birthDate ? user.birthDate.toISOString() : null;
    dto.createdAt = user.createdAt;
    return dto;
  }
}
