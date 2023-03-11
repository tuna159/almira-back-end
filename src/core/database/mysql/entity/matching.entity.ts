import { EIsDelete } from 'enum';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity('matching')
export class Matching {
  @PrimaryGeneratedColumn({ name: 'matching_id', type: 'int', unsigned: true })
  matching_id: number;

  @Column({ name: 'user1_id', type: 'char', length: 36 })
  user1_id: string;

  @Column({ name: 'user2_id', type: 'char', length: 36 })
  user2_id: string;

  @Column({ name: 'matched_datetime', type: 'datetime', default: null })
  matched_datetime: Date;

  @Column({
    name: 'request_cancelled_datetime',
    type: 'datetime',
    default: null,
  })
  request_cancelled_datetime: Date;

  @Column({
    name: 'is_deleted',
    type: 'tinyint',
    width: 1,
    comment: '0: not deleted, 1: deteled',
    default: EIsDelete.NOT_DELETE,
  })
  is_deleted: number;

  @Column({ name: 'created_by', type: 'varchar', length: 255, default: null })
  created_by: string;

  @Column({ name: 'updated_by', type: 'varchar', length: 255, default: null })
  updated_by: string;

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
    onUpdate: 'current_timestamp',
  })
  updated_at: Date | null;

  @ManyToOne(() => User, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user1_id' })
  user1: User;

  @ManyToOne(() => User, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user2_id' })
  user2: User;
}
