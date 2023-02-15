import { EIsDelete, EIsIncognito } from 'enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { User } from './user.entity';

@Entity('post_comment')
export class PostComment {
  @PrimaryGeneratedColumn({
    name: 'post_comment_id',
    type: 'int',
    unsigned: true,
  })
  post_comment_id: number;

  @Column({ name: 'post_id', type: 'int', unsigned: true })
  post_id: number;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  user_id: string;

  @Column({ name: 'content', type: 'varchar', length: 4096, default: '' })
  content: string;

  @Column({
    name: 'is_incognito',
    type: 'tinyint',
    default: EIsIncognito.INCOGNITO,
  })
  is_incognito: number;

  @Column({
    name: 'is_deleted',
    type: 'tinyint',
    width: 1,
    default: EIsDelete.NOT_DELETE,
  })
  is_deleted: number;

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

  @ManyToOne(() => User, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Post, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;
}
