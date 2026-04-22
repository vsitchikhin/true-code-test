import { User } from '@domain/entities/user.entity';
import { UserOrmEntity } from '@infrastructure/persistence/typeorm/entities/user.orm-entity';

export class UserMapper {
  static toDomain(ormEntity: UserOrmEntity): User {
    const user = new User(
      ormEntity.id,
      ormEntity.email,
      ormEntity.username,
      ormEntity.passwordHash,
      ormEntity.phoneNumber,
      ormEntity.bio,
      ormEntity.avatarPath,
      ormEntity.refreshTokenHash,
      ormEntity.createdAt,
    );
    return user;
  }

  static toOrm(domainEntity: User) {
    const ormEntity = new UserOrmEntity();
    ormEntity.id = domainEntity.id;
    ormEntity.email = domainEntity.email;
    ormEntity.username = domainEntity.username;
    ormEntity.passwordHash = domainEntity.passwordHash;
    ormEntity.phoneNumber = domainEntity.phoneNumber;
    ormEntity.bio = domainEntity.bio ?? null;
    ormEntity.avatarPath = domainEntity.avatarPath ?? null;
    ormEntity.refreshTokenHash = domainEntity.refreshTokenHash ?? null;
    ormEntity.createdAt = domainEntity.createdAt;
    return ormEntity;
  }
}
