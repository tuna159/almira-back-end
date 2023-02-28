import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './post.entity';

@Entity('post_image')
export class PostImage {
  @PrimaryGeneratedColumn({
    name: 'post_image_id',
    type: 'int',
    unsigned: true,
  })
  post_image_id: number;

  @Column({ name: 'post_id', type: 'int', unsigned: true })
  post_id: number;

  @Column({
    name: 'image_url',
    type: 'varchar',
    length: 512,
    default: null,
    nullable: true,
  })
  image_url: string | null;

  @Column({
    name: 'title',
    type: 'varchar',
    length: 512,
    default: null,
    nullable: true,
  })
  title: string;

  @Column({ name: 'size', type: 'int', default: null, nullable: true })
  size: number;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'current_timestamp',
  })
  created_at: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: null,
    onUpdate: 'current_timestamp',
  })
  updated_at: Date | null;

  @ManyToOne(() => Post, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;
}
