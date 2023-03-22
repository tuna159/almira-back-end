import { EIsDelete, EIsIncognito } from 'enum';
import {
  EActivityType,
  EReadActivity,
} from 'src/core/interface/default.interface';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { PostComment } from './postComment.entity';
import { User } from './user.entity';

@Entity('activity')
export class Activity {
  @PrimaryGeneratedColumn({
    name: 'activity_id',
    type: 'int',
    unsigned: true,
  })
  activity_id: number;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  user_id: string;

  @Column({ name: 'post_id', type: 'int', unsigned: true, default: null })
  post_id: number;

  @Column({ name: 'from_user_id', type: 'char', length: 36, default: null })
  from_user_id: string;

  @Column({
    name: 'post_comment_id',
    type: 'int',
    unsigned: true,
    default: null,
  })
  post_comment_id: number;

  @Column({ name: 'comment', type: 'varchar', length: 4096, default: null })
  comment: string;

  @Column({
    name: 'type',
    type: 'tinyint',
    width: 1,
    default: EActivityType.COMMENT,
  })
  type: number;

  @Column({
    name: 'is_read',
    type: 'tinyint',
    width: 1,
    default: EReadActivity.UN_READ,
  })
  is_read: number;

  @Column({
    name: 'is_incognito',
    type: 'tinyint',
    width: 1,
    comment: '0: not incognito, 1: incognito',
    default: EIsIncognito.NOT_INCOGNITO,
  })
  is_incognito: number;

  @Column({
    name: 'is_deleted',
    type: 'tinyint',
    width: 1,
    comment: '0: not deleted, 1: deteled',
    default: EIsDelete.NOT_DELETE,
  })
  is_deleted: number;

  @Column('timestamp', { select: false })
  date_time: Date | null;

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

  @ManyToOne(() => User, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'from_user_id' })
  fromUser: User;

  @ManyToOne(() => Post, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => PostComment, (PostComment) => PostComment.activity)
  @JoinColumn({ name: 'post_comment_id' })
  postComment: PostComment;

  // @OneToOne(() => PostComment, (PostComment) => PostComment.activity)
  // @JoinColumn({ name: 'post_comment_id' })
  // postComment: PostComment;
}
