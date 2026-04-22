import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';


import { PostOrmEntity } from '@infrastructure/persistence/typeorm/entities/post.orm-entity';

@Entity('users')
export class UserOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column({ name: 'phone_number', unique: true })
  phoneNumber: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ name: 'avatar_path', type: 'text', nullable: true })
  avatarPath: string | null;

  @Column({ name: 'refresh_token_hash', type: 'text', nullable: true })
  refreshTokenHash: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => PostOrmEntity, (post) => post.author)
  posts: PostOrmEntity[];
}
