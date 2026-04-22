import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';


import { PostOrmEntity } from '@infrastructure/persistence/typeorm/entities/post.orm-entity';

@Entity('post_images')
export class PostImageOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'post_id' })
  postId: string;

  @Column()
  path: string;

  @Column({ default: 0 })
  order: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => PostOrmEntity, (post) => post.images)
  @JoinColumn({ name: 'post_id' })
  post: PostOrmEntity;
}
