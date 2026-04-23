import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsString, IsOptional, Length, Matches } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'new_username' })
  @IsOptional()
  @IsString()
  @Length(3, 20)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers and underscores',
  })
  username?: string;

  @ApiPropertyOptional({ example: 'I am a software engineer' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  bio?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
  @IsOptional()
  @IsString()
  avatarPath?: string;
}
