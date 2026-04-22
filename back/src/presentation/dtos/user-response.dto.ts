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

  @ApiProperty({ required: false, nullable: true })
  bio: string | null;

  @ApiProperty({ required: false, nullable: true })
  avatarPath: string | null;

  @ApiProperty()
  createdAt: Date;

  static fromDomain(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.username = user.username;
    dto.phoneNumber = user.phoneNumber;
    dto.bio = user.bio;
    dto.avatarPath = user.avatarPath;
    dto.createdAt = user.createdAt;
    return dto;
  }
}
