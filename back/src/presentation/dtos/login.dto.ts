import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'john_doe',
    description: 'Email или имя пользователя',
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Пароль пользователя',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
