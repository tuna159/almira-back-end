import { EIsDelete } from 'enum';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity('following')
export class Following {
  @PrimaryGeneratedColumn({ name: 'following_id', type: 'int', unsigned: true })
  following_id: number;

  @Column({ name: 'user1_id', type: 'char', length: 36 })
  user1_id: string;

  @Column({ name: 'user2_id', type: 'char', length: 36 })
  user2_id: string;

  @Column({ name: 'following_datetime', type: 'datetime', default: null })
  following_datetime: Date;

  @Column({
    name: 'is_deleted',
    type: 'tinyint',
    width: 1,
    comment: '0: not deleted, 1: deteled',
    default: EIsDelete.NOT_DELETE,
  })
  is_deleted: number;

  @ManyToOne(() => User, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user1_id' })
  user1: User;

  @ManyToOne(() => User, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user2_id' })
  user2: User;
}
