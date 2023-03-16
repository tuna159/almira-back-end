import { EIsDelete, EIsIncognito } from 'enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PostComment } from './postComment.entity';
import { PostLike } from './postLike.entity';
import { PostImage } from './postImage.entity';
import { User } from './user.entity';
import { PostGift } from './postGift.entity';

@Entity('post')
export class Post {
  @PrimaryGeneratedColumn({
    name: 'post_id',
    type: 'int',
    unsigned: true,
  })
  post_id: number;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  user_id: string;

  @Column({ name: 'content', type: 'varchar', length: 800, default: null })
  content: string;

  @Column({
    name: 'is_incognito',
    type: 'tinyint',
    default: EIsIncognito.NOT_INCOGNITO,
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

  @OneToMany(() => PostImage, (postImage) => postImage.post)
  postImage: PostImage[];

  @OneToMany(() => PostComment, (postComment) => postComment.post)
  postComments: PostComment[];

  @OneToMany(() => PostLike, (postLike) => postLike.post)
  postLikes: PostLike[];

  @OneToMany(() => PostGift, (postGifts) => postGifts.post)
  postGifts: PostGift[];
}
