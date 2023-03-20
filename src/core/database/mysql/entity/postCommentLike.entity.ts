import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PostComment } from './postComment.entity';
import { User } from './user.entity';

@Entity('post_comment_like')
export class PostCommentLike {
  @PrimaryGeneratedColumn({
    name: 'post_comment_like_id',
    type: 'int',
    unsigned: true,
  })
  post_comment_like_id: number;

  @Column({ name: 'post_comment_id', type: 'int', unsigned: true })
  post_comment_id: number;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  user_id: string;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'current_timestamp',
  })
  created_at: Date;

  @ManyToOne(() => User, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => PostComment, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'post_comment_id' })
  postComment: PostComment;
}
