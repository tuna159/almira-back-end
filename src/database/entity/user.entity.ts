import { EIsDelete } from 'enum';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { PostComment } from './postComment.entity';
import { PostGiveAway } from './postGiveAway.entity';
import { PostLike } from './postLike.entity';
import { UserDetail } from './userDetail.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  user_id: string;

  @Column({ name: 'user_name', type: 'varchar', length: 255, default: null })
  user_name: string;

  @Column({ name: 'password', type: 'varchar', length: 255, default: null })
  password: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 65, default: null })
  phone_number: string;

  @Column({ name: 'email', type: 'varchar', length: 255, default: null })
  email: string;

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

  @OneToMany(() => PostGiveAway, (postGiveAways) => postGiveAways.user)
  postGiveAways: PostGiveAway[];
}
