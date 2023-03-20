import { EIsDelete } from 'enum';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Message } from './message.entity';
import { Post } from './post.entity';
import { PostComment } from './postComment.entity';
import { PostLike } from './postLike.entity';
import { UserBlocking } from './userBlocking.entity';
import { UserDetail } from './userDetail.entity';
import { PostGift } from './postGift.entity';
import { Following } from './following.entity';
import { UserVoucher } from './userVoucher.entity';
import { PostCommentLike } from './postCommentLike.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  user_id: string;

  @Column({ name: 'user_name', type: 'varchar', length: 255, default: null })
  user_name: string;

  @Column({ name: 'password', type: 'varchar', length: 255, default: null })
  password: string;

  @Column({ name: 'token', type: 'mediumtext', nullable: true })
  token: string | null;

  @Column({
    name: 'is_deleted',
    type: 'tinyint',
    width: 1,
    comment: '0: not deleted, 1: deteled',
    default: EIsDelete.NOT_DELETE,
  })
  is_deleted: number;

  @Column({ name: 'total_points', type: 'int', default: 0 })
  total_points: number;

  @Column({
    name: 'created_at',
    type: 'datetime',
    default: () => 'current_timestamp',
  })
  created_at: Date;

  @Column({
    name: 'updated_at',
    type: 'datetime',
    default: null,
  })
  updated_at: Date | null;

  @OneToOne(() => UserDetail, (userDetail) => userDetail.user)
  userDetail: UserDetail;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => PostComment, (postComment) => postComment.user)
  postComments: PostComment[];

  @OneToMany(() => PostLike, (postLike) => postLike.user)
  postLikes: PostLike[];

  @OneToMany(() => Message, (message) => message.sender)
  messagesSent: Message[];

  @OneToMany(() => Message, (message) => message.receiver)
  messagesReceived: Message[];

  @OneToMany(() => UserBlocking, (userBlocking) => userBlocking.userOnBlocks)
  userOnBlockings: UserBlocking[];

  @OneToMany(() => UserBlocking, (userBlocking) => userBlocking.userByBlocks)
  userByBlocking: UserBlocking[];

  @OneToMany(() => PostGift, (uerPoint) => uerPoint.sender)
  pointSent: PostGift[];

  @OneToMany(() => PostGift, (uerPoint) => uerPoint.receiver)
  pointReceived: PostGift[];

  @OneToMany(() => Following, (following) => following.user1)
  user1s: Following[];

  @OneToMany(() => Following, (following) => following.user2)
  user2s: Following[];

  @OneToMany(() => UserVoucher, (userVoucherId) => userVoucherId.userId)
  userVoucher: UserVoucher[];

  @OneToMany(() => PostCommentLike, (postCommentLike) => postCommentLike.user)
  postCommentsLike: PostCommentLike[];
}
