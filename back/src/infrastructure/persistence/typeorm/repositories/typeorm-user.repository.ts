import { Repository } from 'typeorm';

import { User } from '@domain/entities/user.entity';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { UserOrmEntity } from '@infrastructure/persistence/typeorm/entities/user.orm-entity';
import { UserMapper } from '@infrastructure/persistence/typeorm/mappers/user.mapper';

export class TypeOrmUserRepository implements IUserRepository {
  constructor(private readonly ormRepository: Repository<UserOrmEntity>) {}

  async save(user: User): Promise<User> {
    const ormEntity = UserMapper.toOrm(user);
    const savedEntity = await this.ormRepository.save(ormEntity);
    return UserMapper.toDomain(savedEntity);
  }

  async findByEmail(email: string): Promise<User | null> {
    const ormEntity = await this.ormRepository.findOne({ where: { email } });
    return ormEntity ? UserMapper.toDomain(ormEntity) : null;
  }

  async findByPhoneNumber(phone: string): Promise<User | null> {
    const ormEntity = await this.ormRepository.findOne({ where: { phoneNumber: phone } });
    return ormEntity ? UserMapper.toDomain(ormEntity) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const ormEntity = await this.ormRepository.findOne({ where: { username } });
    return ormEntity ? UserMapper.toDomain(ormEntity) : null;
  }

  async findById(id: string): Promise<User | null> {
    const ormEntity = await this.ormRepository.findOne({ where: { id } });
    return ormEntity ? UserMapper.toDomain(ormEntity) : null;
  }
}
