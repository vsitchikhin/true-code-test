import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';

import { PostImageOrmEntity } from '@infrastructure/persistence/typeorm/entities/post-image.orm-entity';
import { UserOrmEntity } from '@infrastructure/persistence/typeorm/entities/user.orm-entity';

@Entity('posts')
export class PostOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'author_id' })
  authorId: string;

  @ManyToOne(() => UserOrmEntity, (user) => user.posts)
  @JoinColumn({ name: 'author_id' })
  author: UserOrmEntity;

  @OneToMany(() => PostImageOrmEntity, (image) => image.post)
  images: PostImageOrmEntity[];

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
