import { EIsDelete } from 'enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Gift } from './gift.entity';
import { Post } from './post.entity';
import { User } from './user.entity';

@Entity('post_gift')
export class PostGift {
  @PrimaryGeneratedColumn({
    name: 'post_gift',
    type: 'int',
    unsigned: true,
  })
  post_gift: number;

  @Column({ name: 'sender_id', type: 'char', length: 36 })
  sender_id: string;

  @Column({ name: 'receiver_id', type: 'char', length: 36 })
  receiver_id: string;

  @Column({ name: 'post_id', type: 'int', unsigned: true })
  post_id: number;

  @Column({ name: 'gift_id', type: 'int', unsigned: true })
  gift_id: number;

  @Column({ name: 'points', type: 'int', default: 0 })
  points: number;

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

  @ManyToOne(() => Post, (post) => post.postGifts, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'post_id', referencedColumnName: 'post_id' })
  post: Post;

  @ManyToOne(() => Gift, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'gift_id' })
  giftType: Gift;

  @ManyToOne(() => User, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => User, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;
}
